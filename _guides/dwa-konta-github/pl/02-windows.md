---
topic: dwa-konta-github
topic_title: "Dwa konta GitHub, jeden komputer"
topic_dek: "Konfiguracja gita i SSH tak, żeby push z każdego katalogu trafiał na właściwe konto — automatycznie, bez przelogowywania."
lang: pl
order: 2
id: "002"
title: "Windows: klucze SSH i agent"
dek: "PowerShell, OpenSSH, Credential Manager i pułapka 32-bit vs 64-bit."
tags: ["Windows"]
---

## 1. Wygeneruj dwa klucze SSH

W PowerShell lub Git Bash:

```bash
ssh-keygen -t ed25519 -f C:/Users/TWOJANAZWA/.ssh/id_ed25519_user1 -C "user1@example.com"
ssh-keygen -t ed25519 -f C:/Users/TWOJANAZWA/.ssh/id_ed25519_user2 -C "user2@example.com"
```

Podczas generowania możesz ustawić passphrase (zalecane) — obsługę tego, żeby nie trzeba było wpisywać go za każdym razem, opisuje sekcja niżej.

## 2. Dodaj klucze publiczne na GitHubie

Zawartość plików `id_ed25519_user1.pub` i `id_ed25519_user2.pub` dodaj w **Settings → SSH and GPG keys** na odpowiednich kontach GitHub — każdy klucz do innego konta.

> Nazwa pliku klucza (`id_ed25519_user1`) i etykieta "Title" przy dodawaniu na GitHubie są całkowicie dowolne — to tylko opisy dla Ciebie. Musi się za to zgadzać dokładnie zawartość klucza publicznego (cały plik `.pub`, bez ucięć) oraz to, na które **konto** go dodajesz. Więcej o tym, co jest dowolne, a co musi się zgadzać — w kroku "Jak to działa".

## 3. Podepnij klucze w `.gitconfig-userX`

To plik, który utworzyłeś w kroku 1 tutoriala. Teraz dopisujesz do niego sekcję `[core]` wskazującą na konkretny klucz.

**Znajdź swoją nazwę użytkownika Windows** (będzie potrzebna w ścieżkach):

```powershell
echo $env:USERNAME
```

**Otwórz plik w Notatniku** (podmień `TWOJANAZWA` na wynik z komendy wyżej):

```powershell
notepad C:\Users\TWOJANAZWA\.gitconfig-user1
```

Jeśli Notatnik zapyta "czy chcesz utworzyć nowy plik?" — to znaczy, że plik jeszcze nie istnieje; zgódź się, to normalne. Jeśli już istnieje z kroku 1 (z sekcją `[user]`), Notatnik go po prostu otworzy z istniejącą zawartością.

**Cały plik powinien wyglądać tak** (jeśli sekcja `[user]` już tam jest, dopisz tylko brakującą część `[core]` pod spodem — nie kasuj `[user]`):

```ini
[user]
    name = User1
    email = user1@example.com
[core]
    sshCommand = "ssh -i C:/Users/TWOJANAZWA/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes"
```

Zapisz plik (Ctrl+S) i zamknij Notatnik. Powtórz identycznie dla `.gitconfig-user2`, podmieniając `user1` na `user2` w obu miejscach (nazwa pliku i ścieżka do klucza w `sshCommand`).

**Alternatywa bez otwierania edytora** — dopisanie sekcji od razu z terminala (PowerShell):

```powershell
Add-Content "C:\Users\TWOJANAZWA\.gitconfig-user1" "`n[core]`n    sshCommand = `"ssh -i C:/Users/TWOJANAZWA/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes`""
```

To dopisze sekcję `[core]` na końcu pliku, nie ruszając tego, co już tam jest. Sprawdź efekt:

```powershell
type C:\Users\TWOJANAZWA\.gitconfig-user1
```

Powinieneś zobaczyć obie sekcje, `[user]` i `[core]`, jedna pod drugą.

## 4. Zmień remote repozytorium na SSH

```bash
git remote set-url origin git@github.com:user1/nazwa-repo.git
git remote -v
```

Jeśli remote nadal zaczyna się od `https://` — właśnie to jest zwykle przyczyną, dla której push idzie na konto, przez które jesteś zalogowany w przeglądarce/VS Code, a nie na to wskazane przez klucz SSH.

## 5. Test połączenia

```bash
ssh -T -i C:/Users/TWOJANAZWA/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes git@github.com
```

Powinieneś zobaczyć `Hi user1! You've successfully authenticated...`. Powtórz dla `user2`.

## 6. Żeby nie wpisywać passphrase przy każdym pushu

Windows ma wbudowaną usługę **OpenSSH Authentication Agent**, ale domyślnie jest wyłączona.

**a) Włącz usługę i ustaw autostart** (PowerShell **jako Administrator**):

```powershell
Set-Service -Name ssh-agent -StartupType Automatic
Start-Service ssh-agent
Get-Service ssh-agent
```

Status powinien pokazać `Running`.

**b) Dodaj oba klucze do agenta:**

```powershell
ssh-add C:/Users/TWOJANAZWA/.ssh/id_ed25519_user1
ssh-add C:/Users/TWOJANAZWA/.ssh/id_ed25519_user2
```

Przy każdym poda Cię o passphrase — wpisujesz raz, potem klucz siedzi w pamięci agenta do końca sesji Windows.

Sprawdź:

```powershell
ssh-add -l
```

> **Pułapka 32-bit vs 64-bit:** jeśli `ssh-add` zgłasza `The term 'ssh-add' is not recognized`, mimo że plik `C:\Windows\System32\OpenSSH\ssh-add.exe` fizycznie istnieje — najpewniej działasz w **32-bitowej wersji PowerShell (x86)**. WOW64 przekierowuje wtedy `System32` na `SysWOW64`, gdzie tego folderu nie ma. Sprawdź: `[Environment]::Is64BitProcess` (powinno być `True`). Otwórz zwykły, 64-bitowy PowerShell (bez dopisku `(x86)` w nazwie na liście Start) i spróbuj ponownie.

**c) Pamiętaj:** klucze dodane przez `ssh-add` **znikają po restarcie komputera** — trzeba je dodać ponownie (raz, jednym poleceniem na klucz).

## Alternatywy, jeśli nie chcesz agenta

- **Usunąć passphrase z klucza** (`ssh-keygen -p -f ścieżka_do_klucza`, puste nowe hasło) — wygodne, ale plik klucza staje się w pełni użyteczny dla każdego, kto uzyska do niego dostęp. Sensowne tylko na w pełni zaszyfrowanym dysku (BitLocker), na komputerze, do którego nikt inny nie ma dostępu.
- **Pageant** (z pakietu PuTTY) — osobny agent z możliwością automatycznego ładowania kluczy przy starcie systemu.

## Wyczyszczenie starych danych logowania HTTPS

Jeśli wcześniej logowałeś się przez HTTPS, Windows mógł zapisać dane w Credential Managerze i mieszać je z nowym setupem SSH:

```bash
cmdkey /list | findstr github
cmdkey /delete:NAZWA_WPISU
```

(nazwę wpisu odczytaj z wyniku `/list` — zwykle coś w stylu `git:https://github.com`)
