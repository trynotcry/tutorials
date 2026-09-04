---
topic: dwa-konta-github
topic_title: "Dwa konta GitHub, jeden komputer"
topic_dek: "Konfiguracja gita i SSH tak, żeby push z każdego katalogu trafiał na właściwe konto — automatycznie, bez przelogowywania."
lang: pl
order: 6
id: "006"
title: "Nowe repozytorium i nowe urządzenie"
dek: "Jak założyć repo od zera, podłączyć się do istniejącego na nowym komputerze i pobrać aktualne dane."
tags: ["workflow"]
---

Ten krok zakłada, że masz już skonfigurowane konto (klucz SSH + `.gitconfig-userX`) zgodnie z wcześniejszymi krokami tego tutoriala. Poniżej trzy osobne scenariusze — wybierz ten, który Cię interesuje.

## A. Zupełnie nowe repozytorium od zera

**1. Utwórz puste repozytorium na GitHubie**, na koncie `user1` (przycisk **New repository** — **nie** zaznaczaj "Initialize with README", żeby uniknąć konfliktu przy pierwszym pushu). Skopiuj adres SSH repo, który GitHub pokaże na następnym ekranie — wygląda tak: `git@github.com:user1/nazwa-repo.git`.

**2. Utwórz folder projektu w odpowiednim katalogu** (czyli tam, gdzie masz skonfigurowany `includeIf` dla `user1`):

```bash
cd D:/Projekty/user1
mkdir nazwa-repo
cd nazwa-repo
```

**3. Zainicjuj repozytorium lokalnie:**

```bash
git init
```

**4. Sprawdź, że Git faktycznie widzi tożsamość `user1`** (dzięki `includeIf` z wcześniejszych kroków):

```bash
git config --show-origin --get user.email
```

Powinno pokazać `user1@example.com` z pliku `.gitconfig-user1`. Jeśli pokazuje coś innego — wróć do kroku "Konfiguracja .gitconfig", zanim pójdziesz dalej.

**5. Podepnij remote (adres skopiowany w punkcie 1) i zrób pierwszy commit:**

```bash
git remote add origin git@github.com:user1/nazwa-repo.git
echo "# Nazwa projektu" > README.md
git add README.md
git commit -m "Pierwszy commit"
```

**6. Wypchnij na GitHub:**

```bash
git branch -M main
git push -u origin main
```

Flaga `-u` zapamiętuje powiązanie lokalnej gałęzi `main` ze zdalną — od teraz wystarczy samo `git push`.

## B. Podłączenie się do istniejącego repo na nowym urządzeniu

Zakładamy, że na nowym komputerze **od zera** wykonujesz kroki 1–2 tego tutoriala (nowa para kluczy SSH, nowy `.gitconfig`, `includeIf`, dodanie klucza publicznego na GitHubie) — klucze SSH nie "przenoszą się" same, trzeba je albo skopiować bezpiecznie z poprzedniego urządzenia, albo (prościej i bezpieczniej) wygenerować nowe i dodać jako kolejny klucz do tego samego konta GitHub.

**1. Upewnij się, że setup działa**, zanim spróbujesz klonować:

```bash
ssh -T -i ścieżka/do/klucza -o IdentitiesOnly=yes git@github.com
```

Powinno pokazać `Hi user1!`.

**2. Sklonuj repozytorium do właściwego katalogu** (tego, dla którego masz `includeIf`):

```bash
cd D:/Projekty/user1
git clone git@github.com:user1/nazwa-repo.git
```

Git od razu użyje SSH (bo URL zaczyna się od `git@github.com:`), więc trafi na właściwe konto automatycznie — pod warunkiem, że klucz dla tego katalogu jest już poprawnie skonfigurowany w `core.sshCommand`.

**3. Sprawdź tożsamość w nowo sklonowanym repo:**

```bash
cd nazwa-repo
git config --show-origin --get user.email
```

## C. Pobranie aktualnych zmian z GitHuba (istniejący, już sklonowany katalog)

Jeśli repo już masz lokalnie i chcesz ściągnąć zmiany, które ktoś (albo Ty, z innego urządzenia) wypchnął w międzyczasie:

```bash
cd D:/Projekty/user1/nazwa-repo
git pull
```

`git pull` to w praktyce `git fetch` (pobranie zmian z GitHuba) + `git merge` (wmieszanie ich w Twoją lokalną gałąź) w jednym poleceniu. Jeśli wolisz najpierw zobaczyć, co się zmieniło, zanim to wmieszasz do swojej pracy:

```bash
git fetch
git log HEAD..origin/main --oneline
```

Ta druga komenda pokaże listę commitów, które są na GitHubie, a jeszcze nie masz ich lokalnie — bez ich pobierania do bieżącej gałęzi.

> Jeśli `git pull` zgłosi konflikt z Twoimi niezapisanymi zmianami, zrób najpierw `git status`, żeby zobaczyć co jest niezacommitowane, a potem albo `git stash` (odłóż zmiany na bok), albo `git commit` (zapisz je), zanim spróbujesz ponownie.
