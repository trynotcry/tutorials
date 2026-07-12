---
topic: dwa-konta-github
topic_title: "Dwa konta GitHub, jeden komputer"
topic_dek: "Konfiguracja gita i SSH tak, żeby push z każdego katalogu trafiał na właściwe konto — automatycznie, bez przelogowywania."
lang: pl
order: 3
id: "003"
title: "macOS: klucze SSH i Keychain"
dek: "ssh-agent na macOS zapamiętuje hasło w Pęku kluczy — jedna flaga i restarty przestają być problemem."
tags: ["macOS"]
---

## 1. Wygeneruj dwa klucze SSH

W Terminalu:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_user1 -C "user1@example.com"
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_user2 -C "user2@example.com"
```

Ustaw passphrase dla każdego klucza — na macOS obsługa "nie pytaj za każdym razem" jest wbudowana i wygodniejsza niż na Windowsie (patrz krok 6).

## 2. Dodaj klucze publiczne na GitHubie

```bash
cat ~/.ssh/id_ed25519_user1.pub | pbcopy
```

Wklej zawartość w **Settings → SSH and GPG keys** na koncie `user1`. Powtórz dla `user2`.

## 3. Podepnij klucze w `.gitconfig-userX`

```ini
[core]
    sshCommand = "ssh -i ~/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes"
```

Ścieżki z `~` zwykle działają poprawnie w `core.sshCommand` na macOS/Linuksie (w przeciwieństwie do Windows, gdzie bezpieczniej jest podać pełną ścieżkę).

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

macOS ma wbudowaną integrację `ssh-agent` z **Pękiem kluczy (Keychain)**. Dodaj wpis w `~/.ssh/config`:

```
Host github.com-user1
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_user1
    UseKeychain yes
    AddKeysToAgent yes

Host github.com-user2
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_user2
    UseKeychain yes
    AddKeysToAgent yes
```

`UseKeychain yes` + `AddKeysToAgent yes` sprawiają, że po jednorazowym podaniu hasła przy pierwszym `ssh-add`, hasło jest zapisane w Pęku kluczy i **przetrwa restart komputera** — w przeciwieństwie do Windows.

Dodaj klucze raz:

```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_user1
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_user2
```

Sprawdź:

```bash
ssh-add -l
```

> Jeśli używasz aliasów `Host github.com-userX` z `~/.ssh/config` **razem** z `core.sshCommand` w gitconfigu — wybierz jeden mechanizm, żeby się nie gryzły. Prostszy w utrzymaniu jest sam `core.sshCommand` (krok 1 tutoriala) bez aliasów w `~/.ssh/config`; jeśli wolisz aliasy, w `.gitconfig-userX` zamiast `core.sshCommand` po prostu zmień remote na `git@github.com-user1:user1/repo.git`.

## Uwaga: Git od Apple vs Git z Homebrew

macOS ma domyślnie zainstalowany Git od Apple (Xcode Command Line Tools). Jeśli zainstalowałeś dodatkowo Git przez Homebrew, sprawdź który jest używany:

```bash
which git
git --version
```

`includeIf` działa identycznie w obu, ale warto wiedzieć, z której instalacji korzystasz, gdy coś nie działa zgodnie z oczekiwaniami.
