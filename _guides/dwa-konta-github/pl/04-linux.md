---
topic: dwa-konta-github
topic_title: "Dwa konta GitHub, jeden komputer"
topic_dek: "Konfiguracja gita i SSH tak, żeby push z każdego katalogu trafiał na właściwe konto — automatycznie, bez przelogowywania."
lang: pl
order: 4
id: "004"
title: "Linux: klucze SSH i agent"
dek: "ssh-agent uruchamiany przez środowisko graficzne lub ręcznie w powłoce."
tags: ["Linux"]
---

## 1. Wygeneruj dwa klucze SSH

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_user1 -C "user1@example.com"
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_user2 -C "user2@example.com"
```

## 2. Dodaj klucze publiczne na GitHubie

```bash
cat ~/.ssh/id_ed25519_user1.pub
```

Skopiuj wynik i wklej w **Settings → SSH and GPG keys** na koncie `user1`. Powtórz dla `user2`. (Jeśli masz `xclip`: `xclip -sel clip < ~/.ssh/id_ed25519_user1.pub`)

## 3. Podepnij klucze w `.gitconfig-userX`

To plik, który utworzyłeś w kroku 1 tutoriala (np. `~/.gitconfig-user1`). Teraz dopisujesz do niego sekcję `[core]` wskazującą na konkretny klucz.

**Otwórz plik w edytorze terminalowym `nano`** (jeśli wolisz `vim` albo inny — użyj swojego):

```bash
nano ~/.gitconfig-user1
```

Jeśli plik już istnieje z kroku 1 (z sekcją `[user]`), zobaczysz jego zawartość. Zjedź na koniec pliku i dopisz nową sekcję. **Cały plik powinien wyglądać tak:**

```ini
[user]
    name = User1
    email = user1@example.com
[core]
    sshCommand = "ssh -i ~/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes"
```

Zapisz i wyjdź z `nano`: **Ctrl+O** (zapisz), Enter (zatwierdź nazwę pliku), **Ctrl+X** (wyjdź). Powtórz identycznie dla `.gitconfig-user2`, podmieniając `user1` na `user2` w obu miejscach (nazwa pliku i ścieżka do klucza w `sshCommand`).

**Alternatywa bez otwierania edytora** — dopisanie sekcji od razu z terminala:

```bash
cat >> ~/.gitconfig-user1 << 'EOF'
[core]
    sshCommand = "ssh -i ~/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes"
EOF
```

To dopisze sekcję `[core]` na końcu pliku, nie ruszając tego, co już tam jest. Sprawdź efekt:

```bash
cat ~/.gitconfig-user1
```

Powinieneś zobaczyć obie sekcje, `[user]` i `[core]`, jedna pod drugą.

## 4. Zmień remote repozytorium na SSH

```bash
git remote set-url origin git@github.com:user1/nazwa-repo.git
git remote -v
```

## 5. Test połączenia

```bash
ssh -T -i ~/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes git@github.com
```

Powinno pokazać `Hi user1! You've successfully authenticated...`.

## 6. Żeby nie wpisywać passphrase przy każdym pushu

Większość dystrybucji z środowiskiem graficznym (GNOME, KDE) uruchamia `ssh-agent` automatycznie przy zalogowaniu i integruje go z menedżerem haseł systemu (np. GNOME Keyring), więc `ssh-add` wystarczy zrobić raz, a hasło przetrwa kolejne logowania.

Dodaj klucze do agenta:

```bash
eval "$(ssh-agent -s)"   # tylko jeśli agent nie jest już uruchomiony
ssh-add ~/.ssh/id_ed25519_user1
ssh-add ~/.ssh/id_ed25519_user2
```

Sprawdź:

```bash
ssh-add -l
```

**Na systemach bez integracji z keyringiem** (np. minimalne instalacje, WSL, serwery bez GUI) `ssh-agent` uruchomiony przez `eval "$(ssh-agent -s)"` żyje tylko w bieżącej sesji terminala/powłoki. Żeby nie uruchamiać go ręcznie za każdym razem, dodaj do `~/.bashrc` lub `~/.zshrc`:

```bash
if [ -z "$SSH_AUTH_SOCK" ]; then
  eval "$(ssh-agent -s)" > /dev/null
  ssh-add ~/.ssh/id_ed25519_user1 2>/dev/null
  ssh-add ~/.ssh/id_ed25519_user2 2>/dev/null
fi
```

To i tak poprosi o passphrase przy każdym nowym logowaniu do systemu — to oczekiwane, chyba że zrezygnujesz z passphrase na kluczu (patrz uwaga w przewodniku dla Windows o kompromisie bezpieczeństwa).

## WSL (Windows Subsystem for Linux)

Jeśli pracujesz w WSL, pamiętaj że to **osobne środowisko SSH** niż Windows — klucze, `~/.gitconfig` i `ssh-agent` w WSL są niezależne od tych w PowerShell. Trzymaj się jednego środowiska (albo WSL, albo Windows) dla danego repozytorium, żeby uniknąć mieszania kluczy i configów.
