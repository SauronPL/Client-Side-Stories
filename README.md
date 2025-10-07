
# Instrukcja instalacji i uruchomienia aplikacji „Stories Clone”

## 1. Wymagania wstępne

* **Node.js** w wersji ≥16.x
* **npm** (wersja dołączona do Node.js) lub odpowiednik (yarn/pnpm)
* Połączenie internetowe do pobrania paczek

Sprawdź wersje w terminalu:

node -v
npm -v

## 2. Instalacja zależności
Użyj kommendy:

cd "ścieżka do głównego folderu projektu"

W głównym folderze projektu uruchom:

npm install

To pobierze wszystkie pakiety wymagane przez Vite, React i Tailwind CSS.

## 3. Uruchomienie środowiska deweloperskiego

Po zakończeniu instalacji wpisz:

npm run dev

W konsoli pojawi się informacja o lokalnym serwerze (domyślnie `http://localhost:5173/`).
Otwórz tę stronę w przeglądarce, aby zobaczyć aplikację w działaniu.

## 4. Budowanie wersji produkcyjnej

Gdy chcesz wygenerować zoptymalizowaną wersję do wdrożenia:

npm run build

Wygeneruje się katalog `dist/`, zawierający gotowe pliki statyczne.

## 5. Podgląd zbudowanej wersji

Aby upewnić się, że build działa poprawnie:

npm run preview

Serwer podglądowy uruchomi pliki z `dist/` na krótkim adresie lokalnym.

## 7. Wdrożenie

Pliki z folderu `dist/` możesz wrzucić na dowolny hosting statyczny (Netlify, Vercel, GitHub Pages, własny serwer WWW itp.).

**Uwaga:**

* Aplikacja działa wyłącznie po stronie klienta — nie wymaga żadnego backendu.
* Obrazy są trzymane w przeglądarce (`localStorage`) i automatycznie usuwane po 24 godzinach.
* Maksymalne wymiary wgrywanych zdjęć są ograniczone do 1080×1920 px.
