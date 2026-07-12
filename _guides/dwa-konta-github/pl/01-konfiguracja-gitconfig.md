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

## 1. Główny plik `~/.gitconfig`

Znajdź lub utwórz plik `~/.gitconfig` (na Windows to zwykle `C:\Users\TWOJANAZWA\.gitconfig`) i dodaj sekcje `includeIf` wskazujące na katalogi projektów. Podstaw swoją własną literę dysku i ścieżkę:

```ini
[includeIf "gitdir:D:/Projekty/user1/"]
    path = .gitconfig-user1
[includeIf "gitdir:D:/Projekty/user2/"]
    path = .gitconfig-user2
```

Na macOS/Linuksie ścieżki wyglądają analogicznie, np.:

```ini
[includeIf "gitdir:~/Projekty/user1/"]
    path = .gitconfig-user1
[includeIf "gitdir:~/Projekty/user2/"]
    path = .gitconfig-user2
```

**Uwaga na szczegóły, które najczęściej psują ten mechanizm:**

- Ścieżka w `gitdir:` musi kończyć się **ukośnikiem** `/`.
- Litera dysku i wielkość liter muszą się zgadzać z tym, jak faktycznie masz zorganizowane foldery — jeśli katalog nazywa się `Projekty`, a w configu wpiszesz `projekty`, na niektórych systemach `includeIf` się nie odpali.
- Ścieżki względne w `path =` (np. `.gitconfig-user1`) są liczone względem katalogu, w którym leży *ten* `.gitconfig` — zwykle katalog domowy użytkownika.
- Na Windowsie w ścieżkach używaj `/`, nie `\`.

## 2. Pliki per konto

Utwórz `~/.gitconfig-user1`:

```ini
[user]
    name = User1
    email = user1@example.com
[core]
    sshCommand = "ssh -i ~/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes"
```

I analogicznie `~/.gitconfig-user2`:

```ini
[user]
    name = User2
    email = user2@example.com
[core]
    sshCommand = "ssh -i ~/.ssh/id_ed25519_user2 -o IdentitiesOnly=yes"
```

Na Windowsie w `sshCommand` podaj pełną ścieżkę ze slashami, np. `C:/Users/TWOJANAZWA/.ssh/id_ed25519_user1`.

Flaga `-o IdentitiesOnly=yes` jest ważna — bez niej agent SSH może spróbować użyć innego klucza, zanim sięgnie po ten wskazany jawnie.

## 3. Sprawdzenie, zanim pójdziesz dalej

Wejdź do katalogu z projektem `user1` i sprawdź, skąd Git bierze tożsamość:

```bash
cd D:/Projekty/user1/jakis-projekt
git config --show-origin --get user.email
git config --show-origin --get core.sshCommand
```

Oba wyniki powinny wskazywać na plik `.gitconfig-user1`. Jeśli pokazują coś innego — najczęstsza przyczyna to lokalny `.git/config` w tym konkretnym repozytorium, który **zawsze nadpisuje** wartości z `includeIf`. Sprawdź:

```bash
cat .git/config
```

Jeśli tam widnieje sekcja `[user]` z nieprawidłowym mailem — usuń ją:

```bash
git config --local --unset user.email
git config --local --unset user.name
```

> Ten sam problem może dotyczyć `core.sshCommand`, jeśli kiedyś zostało ustawione lokalnie w tym repo.

Kolejny krok — wygenerowanie kluczy SSH i skonfigurowanie agenta — wybierz dla swojego systemu poniżej.
