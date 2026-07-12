# Tutoriale — strona z automatycznym spisem treści i pełnym PL/EN

Statyczna strona (Jekyll). Strona główna to wybór języka; `/pl/` i `/en/` to dwie **osobne, w pełni oddzielne** wersje serwisu — treści się nie mieszają. Każda ma własną nawigację boczną (spis treści), która **sama uzupełnia się** o nowe artykuły i tematy — nic nie trzeba ręcznie dopisywać.

## Struktura

```
/                          <- wybór języka (root)
/pl/                       <- strona główna PL (lista tematów)
/en/                       <- strona główna EN (lista tematów)

_guides/
  dwa-konta-github/        <- folder = jeden temat/tutorial
    pl/
      00-wprowadzenie.md
      01-konfiguracja-gitconfig.md
      ...
    en/
      00-introduction.md
      01-gitconfig-setup.md
      ...
  nastepny-temat/          <- kolejny temat, ten sam wzorzec
    pl/...
    en/...
```

Każdy plik `.md` w `_guides/` to jeden krok. Front matter steruje wszystkim:

```yaml
---
topic: dwa-konta-github          # slug tematu — identyczny we wszystkich plikach danego tematu (PL i EN)
topic_title: "Dwa konta GitHub, jeden komputer"   # tytuł widoczny na liście (w tym języku)
topic_dek: "Krótki opis tematu."
lang: pl                          # pl albo en — decyduje, w której (osobnej!) części serwisu artykuł się pojawi
order: 0                          # kolejność kroku w obrębie tematu+języka
id: "000"                         # numer/identyfikator kroku — musi być TAKI SAM w obu językach, żeby przełącznik PL/EN trafiał na właściwe tłumaczenie
title: "Jak to działa"
dek: "Krótki opis kroku."
tags: ["koncepcja"]
---
```

## Jak działa nawigacja (spis treści)

`_includes/nav.html` skanuje **wszystkie** pliki z `_guides/` dla bieżącego języka (`page.lang`), grupuje je po `topic`, sortuje po `order` i renderuje jako listę w panelu bocznym — widocznym na każdej stronie. Nowy plik = nowa pozycja na liście, automatycznie, po najbliższym pushu. Nie ma nigdzie ręcznie wpisanej listy artykułów.

Przełącznik **PL / EN** w nagłówku prowadzi zawsze do treści w tym samym języku:
- na stronie głównej — do drugiej strony głównej (`/pl/` ↔ `/en/`),
- na konkretnym artykule — do jego dokładnego tłumaczenia, jeśli istnieje (dopasowanego po `topic` + `id`), a jeśli nie istnieje — do strony głównej drugiego języka.

## Jak dodać nowy krok do istniejącego tematu

1. Skopiuj dowolny plik z `_guides/dwa-konta-github/pl/` (lub `en/`) jako szablon.
2. Ustaw unikalny `order` i `id` w obrębie tego samego `topic` + `lang`.
3. Zostaw ten sam `topic` — inaczej strona uzna to za nowy, osobny temat.
4. Napisz treść w Markdown.
5. `git add`, `git commit`, `git push`.

Krok pojawi się w spisie treści i na liście tematów automatycznie.

## Jak dodać zupełnie nowy temat/tutorial

1. Utwórz nowy folder w `_guides/`, np. `_guides/nastepny-temat/`.
2. W środku foldery `pl/` i/lub `en/` (można dodać tylko jeden język — wtedy temat pojawi się tylko w tej wersji serwisu).
3. Pliki `.md` z własnym, unikalnym `topic:` (inny niż istniejące tematy).
4. Push — nowy temat pojawi się w spisie treści i na stronie głównej automatycznie.

## Jak dodać tłumaczenie istniejącego kroku

W pliku drugiego języka ustaw **taki sam `topic` i `id`**, jak w oryginale (różny tylko `lang`). Przełącznik PL/EN w nagłówku sam wykryje odpowiednik i będzie prowadził bezpośrednio do niego.

## Publikacja na GitHub Pages

```bash
git init
git add .
git commit -m "Pierwsza wersja tutoriali"
git remote add origin git@github.com:TWOJ_LOGIN/nazwa-repo.git
git branch -M main
git push -u origin main
```

Następnie: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.

Strona będzie pod `https://TWOJ_LOGIN.github.io/nazwa-repo/`.

> **Ważne — `baseurl`:** jeśli publikujesz pod podścieżką (`/nazwa-repo/`, a nie pod głównym `TWOJ_LOGIN.github.io`), uzupełnij w `_config.yml`:
> ```yaml
> baseurl: "/nazwa-repo"
> url: "https://TWOJ_LOGIN.github.io"
> ```
> Bez tego CSS i wszystkie linki wewnętrzne dadzą 404. To najczęstsza przyczyna problemów po pierwszej publikacji.

## Podgląd lokalnie (opcjonalnie, wymaga Ruby)

Podgląd lokalny nie jest wymagany do publikacji — GitHub Pages buduje stronę automatycznie po pushu.

```bash
gem install bundler jekyll
bundle install
bundle exec jekyll serve
```

Strona pod `http://localhost:4000`. Na Windows Ruby instaluje się przez [RubyInstaller](https://rubyinstaller.org/downloads/) — wybierz wersję **z DevKit**.
