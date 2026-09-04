---
topic: dwa-konta-github
topic_title: "Dwa konta GitHub, jeden komputer"
topic_dek: "Konfiguracja gita i SSH tak, żeby push z każdego katalogu trafiał na właściwe konto — automatycznie, bez przelogowywania."
lang: pl
order: 1
id: "001"
title: "Konfiguracja .gitconfig"
dek: "Ten krok jest identyczny na Windows, macOS i Linuksie."
tags: ["wszystkie systemy"]
---

## 1. Sprawdź dokładną ścieżkę swoich folderów projektów

Zanim cokolwiek wpiszesz w configu, sprawdź **dokładną, prawdziwą ścieżkę** do folderów `user1` i `user2` — literówka albo zła wielkość litery to najczęstsza przyczyna, dla której `includeIf` później nie działa.

**Windows (PowerShell)** — wejdź do folderu i wypisz jego pełną ścieżkę:

```powershell
cd D:\Projekty\user1
(Get-Location).Path
```

Dostaniesz coś w stylu `D:\Projekty\user1`. Do configu wpiszesz to **z ukośnikami `/` zamiast `\`** — czyli `D:/Projekty/user1/`. Powtórz dla `user2`.

**macOS / Linux** — analogicznie:

```bash
cd ~/Projekty/user1
pwd
```

Dostaniesz coś w stylu `/Users/twojanazwa/Projekty/user1`. Tę ścieżkę wpiszesz do configu bez zmian. Powtórz dla `user2`.

> Zapisz sobie gdzieś obie ścieżki — będą potrzebne w następnym kroku, dokładnie w takiej postaci, jaką właśnie zobaczyłeś.

## 2. Otwórz (lub utwórz) główny plik `~/.gitconfig`

**Windows (PowerShell)** — sprawdź swoją nazwę użytkownika i otwórz plik w Notatniku:

```powershell
echo $env:USERNAME
notepad C:\Users\TWOJANAZWA\.gitconfig
```

Jeśli Notatnik zapyta, czy utworzyć nowy plik — zgódź się, to normalne przy pierwszym razie.

**macOS / Linux** — otwórz plik w `nano`:

```bash
nano ~/.gitconfig
```

## 3. Dopisz sekcje `includeIf`

Do otwartego pliku dopisz (nie kasując tego, co już tam jest, jeśli coś jest) sekcje wskazujące na Twoje foldery — użyj ścieżek, które sprawdziłeś w kroku 1:

```ini
[includeIf "gitdir:D:/Projekty/user1/"]
    path = .gitconfig-user1
[includeIf "gitdir:D:/Projekty/user2/"]
    path = .gitconfig-user2
```

Na macOS/Linuksie analogicznie, np.:

```ini
[includeIf "gitdir:~/Projekty/user1/"]
    path = .gitconfig-user1
[includeIf "gitdir:~/Projekty/user2/"]
    path = .gitconfig-user2
```

Zapisz plik: w Notatniku Ctrl+S; w `nano` — Ctrl+O, Enter, Ctrl+X.

**Alternatywa bez otwierania edytora** — dopisanie od razu z terminala:

```powershell
# Windows (PowerShell)
Add-Content "C:\Users\TWOJANAZWA\.gitconfig" "`n[includeIf `"gitdir:D:/Projekty/user1/`"]`n    path = .gitconfig-user1`n[includeIf `"gitdir:D:/Projekty/user2/`"]`n    path = .gitconfig-user2"
```

```bash
# macOS / Linux
cat >> ~/.gitconfig << 'EOF'
[includeIf "gitdir:~/Projekty/user1/"]
    path = .gitconfig-user1
[includeIf "gitdir:~/Projekty/user2/"]
    path = .gitconfig-user2
EOF
```

**Uwaga na szczegóły, które najczęściej psują ten mechanizm:**

- Ścieżka w `gitdir:` musi kończyć się **ukośnikiem** `/`.
- Litera dysku i wielkość liter muszą się zgadzać z tym, co zobaczyłeś w kroku 1 — jeśli katalog nazywa się `Projekty`, a w configu wpiszesz `projekty`, na niektórych systemach `includeIf` się nie odpali.
- Ścieżki względne w `path =` (np. `.gitconfig-user1`) są liczone względem katalogu, w którym leży *ten* `.gitconfig` — zwykle katalog domowy użytkownika.
- Na Windowsie w ścieżkach zawsze `/`, nie `\`.

## 4. Utwórz plik per konto

**Windows:**

```powershell
notepad C:\Users\TWOJANAZWA\.gitconfig-user1
```

**macOS / Linux:**

```bash
nano ~/.gitconfig-user1
```

Wpisz zawartość (na razie tylko tożsamość — sekcję `[core]` z kluczem SSH dopiszesz w następnym kroku, po jego wygenerowaniu):

```ini
[user]
    name = User1
    email = user1@example.com
```

Zapisz i zamknij. Powtórz identycznie dla `.gitconfig-user2`, podmieniając dane na konto `user2`:

```ini
[user]
    name = User2
    email = user2@example.com
```

## 5. Sprawdzenie, zanim pójdziesz dalej

Wejdź do katalogu z projektem `user1` i sprawdź, skąd Git bierze tożsamość:

```bash
cd D:/Projekty/user1/jakis-projekt
git config --show-origin --get user.email
```

Wynik powinien wskazywać na plik `.gitconfig-user1` i pokazywać e-mail `user1@example.com`. Jeśli pokazuje coś innego — najczęstsza przyczyna to lokalny `.git/config` w tym konkretnym repozytorium, który **zawsze nadpisuje** wartości z `includeIf`. Sprawdź:

```bash
cat .git/config
```

Jeśli tam widnieje sekcja `[user]` z nieprawidłowym mailem — usuń ją:

```bash
git config --local --unset user.email
git config --local --unset user.name
```

> Ten sam problem może dotyczyć `core.sshCommand`, jeśli kiedyś zostało ustawione lokalnie w tym repo.

Kolejny krok — wygenerowanie kluczy SSH i dopisanie `core.sshCommand` do plików `.gitconfig-userX` — wybierz dla swojego systemu poniżej.
