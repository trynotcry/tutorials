---
topic: dwa-konta-github
topic_title: "Dwa konta GitHub, jeden komputer"
topic_dek: "Konfiguracja gita i SSH tak, żeby push z każdego katalogu trafiał na właściwe konto — automatycznie, bez przelogowywania."
lang: pl
order: 0
id: "000"
title: "Jak to działa"
dek: "Zasada działania: includeIf w gitconfigu + osobny klucz SSH per katalog."
tags: ["koncepcja"]
---

## Problem

Masz dwa konta GitHub (`user1`, `user2`) i dwa katalogi projektów na jednym komputerze, np.:

```
D:\Projekty\user1\
D:\Projekty\user2\
```

> Litera dysku (`D:`, `G:`, `C:`...) nie ma znaczenia — to tylko przykład. Cały mechanizm opiera się na **ścieżce do katalogu**, nie na konkretnym dysku. Użyj swojej własnej litery i struktury folderów, konsekwentnie podstawiając ją w dalszych krokach.

Chcesz, żeby `git push` z katalogu `user1` zawsze szedł na konto `user1`, a z katalogu `user2` — na `user2`, **bez ręcznego przelogowywania się** w przeglądarce czy w edytorze.

## Dlaczego samo `.gitconfig` to za mało

`.gitconfig` z `includeIf` ustawia tylko **tożsamość** commitów (`user.name`, `user.email`) — czyli kto widnieje jako autor. Nie ustawia **danych logowania** używanych przy pushu. Jeśli logujesz się przez HTTPS (np. przez rozszerzenie GitHub w VS Code), Git i tak użyje jednego zapisanego tokena OAuth — niezależnie od tego, jaki `user.email` masz w configu.

## Rozwiązanie: SSH + osobny klucz per katalog

Zamiast HTTPS używamy SSH. Każde konto GitHub dostaje własną parę kluczy SSH, a Git — na podstawie katalogu, w którym pracujesz — sam wybiera odpowiedni klucz przy każdym połączeniu z GitHubem.

Mechanizm składa się z trzech warstw:

1. **`includeIf "gitdir:..."`** w głównym `~/.gitconfig` — mówi Gitowi "jeśli pracujesz w tym katalogu, doczytaj też ten dodatkowy plik configu".
2. **Osobny plik configu na konto** (`.gitconfig-user1`, `.gitconfig-user2`) — ustawia `user.name`, `user.email` **oraz** `core.sshCommand` wskazujący na konkretny klucz SSH.
3. **Remote repozytorium w formacie SSH** (`git@github.com:user/repo.git`) — żeby Git w ogóle używał SSH, a nie HTTPS.

Efekt: wchodzisz do katalogu, robisz `git push`, a Git po cichu bierze właściwy klucz i właściwą tożsamość — automatycznie.

> Kolejne strony pokazują to krok po kroku dla Windows, macOS i Linuksa. Kroki 1–2 (generowanie kluczy, konfiguracja gitconfig) są takie same na każdym systemie — różni się tylko lokalizacja plików i sposób uruchamiania agenta SSH.
