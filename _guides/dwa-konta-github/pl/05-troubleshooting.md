---
topic: dwa-konta-github
topic_title: "Dwa konta GitHub, jeden komputer"
topic_dek: "Konfiguracja gita i SSH tak, żeby push z każdego katalogu trafiał na właściwe konto — automatycznie, bez przelogowywania."
lang: pl
order: 5
id: "005"
title: "Troubleshooting"
dek: "Najczęstsze problemy przy tym setupie i jak je zdiagnozować."
tags: ["diagnostyka"]
kind: troubleshoot
---

## Push i tak idzie na złe konto

**Sprawdź w tej kolejności:**

```bash
git remote -v
```
Jeśli zaczyna się od `https://` — SSH w ogóle nie jest używane, tylko dane logowania HTTPS zapisane przez przeglądarkę/edytor/Credential Manager. Zmień na `git@github.com:...`.

```bash
git config --show-origin --get user.email
git config --show-origin --get core.sshCommand
```
Sprawdź, z jakiego pliku pochodzą te wartości. Jeśli to nie jest Twój `.gitconfig-userX` — zobacz punkt niżej o lokalnym `.git/config`.

## `git config --show-origin --get user.email` pokazuje zupełnie inny e-mail

Najczęstsza przyczyna: **lokalny config w tym konkretnym repozytorium** (`.git/config`), ustawiony np. przy pierwszym `git init`/`clone`, zanim `includeIf` był skonfigurowany. Lokalny config zawsze wygrywa z `includeIf`, niezależnie jak dobrze jest on skonfigurowany globalnie.

```bash
cat .git/config
```

Jeśli widzisz tam sekcję `[user]` (lub `[core] sshCommand`) z błędnymi danymi:

```bash
git config --local --unset user.email
git config --local --unset user.name
git config --local --unset core.sshCommand
```

Po usunięciu Git spadnie do wartości z `includeIf`.

## `core.sshCommand` pokazuje tylko `ssh.exe` bez `-i` i klucza

Oznacza to, że wpis z `.gitconfig-userX` **nie jest w ogóle wczytywany** — `includeIf` się nie odpala, albo coś inne nadpisuje wartość wcześniej. Sprawdź:

```bash
git config --show-origin --list --show-scope
```

Najczęstsze przyczyny, dlaczego `includeIf` się nie odpala:

- Ścieżka w `gitdir:` nie kończy się `/`.
- Wielkość liter w ścieżce (szczególnie na Windows) nie zgadza się dokładnie z tym, jak Git widzi katalog roboczy.
- Ścieżka względna w `path =` jest liczona od niewłaściwego miejsca (patrz krok 1. tutoriala).

## VS Code / rozszerzenie GitHub wysyła push tylko na jedno konto

Rozszerzenia typu "GitHub Pull Requests and Issues" i wbudowane logowanie GitHub w VS Code trzymają **własną, zcache'owaną sesję OAuth** na `github.com`, niezależną od `.gitconfig`. Nawet perfekcyjnie skonfigurowany `includeIf` tego nie ominie, dopóki repozytorium używa HTTPS. Rozwiązanie: przejście na SSH (remote `git@github.com:...`) — wtedy autoryzacja idzie kluczem, a nie tokenem zapisanym przez rozszerzenie.

## `ssh-add` — "the term is not recognized" (Windows / PowerShell)

Dwie możliwe przyczyny:

1. **Folder OpenSSH nie jest w PATH.** Sprawdź pełną ścieżką: `Get-Item "C:\Windows\System32\OpenSSH\ssh-add.exe"`. Jeśli plik istnieje, dodaj folder do PATH systemowego (PowerShell jako Administrator) i otwórz **nowe** okno terminala.
2. **32-bitowy PowerShell (x86) na 64-bitowym Windows.** WOW64 przekierowuje wtedy `System32` na `SysWOW64`, gdzie folderu OpenSSH nie ma — mimo że PATH wygląda poprawnie i plik "istnieje" wizualnie w Eksploratorze. Sprawdź: `[Environment]::Is64BitProcess` — jeśli `False`, otwórz zwykły (nie `x86`) PowerShell/Windows Terminal.

## Po restarcie znowu trzeba wpisywać passphrase

To oczekiwane zachowanie natywnego agenta OpenSSH na Windowsie — pamięć kluczy w agencie nie jest trwała między restartami. Na macOS problem znika, jeśli w `~/.ssh/config` użyjesz `UseKeychain yes` (patrz przewodnik macOS). Na Linuksie zależy od integracji z keyringiem środowiska graficznego.

Kompromisowe rozwiązanie na każdym systemie: usunąć passphrase z klucza (`ssh-keygen -p`, puste hasło) — ale tylko jeśli dysk jest zaszyfrowany i nikt inny nie ma dostępu do komputera.

## Strona po publikacji na GitHub Pages nie ma stylów, a linki dają 404

Prawie zawsze to `baseurl` w `_config.yml`. Jeśli strona jest publikowana pod `https://TWOJ_LOGIN.github.io/nazwa-repo/` (project page), a `baseurl` jest puste — CSS i linki wskazują na katalog główny domeny zamiast na podścieżkę repo. Ustaw:

```yaml
baseurl: "/nazwa-repo"
url: "https://TWOJ_LOGIN.github.io"
```

Commit, push, poczekaj na rebuild (zakładka **Actions**), odśwież z twardym cache-clearem (Ctrl+Shift+R).

## Stare dane logowania HTTPS nadal "gryzą się" z nowym setupem SSH

Windows Credential Manager mógł zapisać wcześniejsze dane logowania HTTPS do GitHuba:

```bash
cmdkey /list | findstr github
cmdkey /delete:NAZWA_WPISU
```

Na macOS odpowiednikiem jest Pęk kluczy (Keychain Access → wyszukaj "github.com").

## Szybka checklista diagnostyczna

```bash
# 1. Czy jesteś we właściwym katalogu i czy includeIf się odpalił
git config --show-origin --get user.email

# 2. Czy remote jest w formacie SSH
git remote -v

# 3. Czy Git użyje właściwego klucza
git config --show-origin --get core.sshCommand

# 4. Czy sam klucz działa niezależnie od configu repo
ssh -T -i ścieżka/do/klucza -o IdentitiesOnly=yes git@github.com

# 5. Czy agent ma załadowane oba klucze
ssh-add -l
```

Jeśli krok 4 działa poprawnie, a zwykłe `git push` nadal nie — problem leży w konfiguracji Gita (kroki 1–3), nie w samym kluczu SSH.
