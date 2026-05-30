# Podsumowanie i Przewodnik: Launchpad Developer Workspace 2.0

Wprowadziliśmy kompleksową rozbudowę Launchpada do wersji **Workspace 2.0 (Profesjonalny Pulpit Deweloperski)**. Inspirowani zaawansowanymi narzędziami systemowymi (takimi jak **Raycast, Alfred oraz DevToys**), wdrożyliśmy zestaw potężnych rozszerzeń, które czynią ten pulpit kompletnym i niezastąpionym hubem Twojej codziennej pracy programistycznej.

---

## 🎨 Co zrobiliśmy (Przegląd Nowości w wersji 2.0)

Aplikacja zyskała pięć nowych, w pełni zintegrowanych silników funkcjonalnych:
1.  **Command Palette (`Ctrl + K` / `Cmd + K`)**: Osobisty wiersz poleceń (Raycast style) sterowany w 100% klawiaturą, umożliwiający błyskawiczne wywoływanie poleceń oraz wyszukiwanie i otwieranie aplikacji.
2.  **Live Health Status Checker**: Wbudowany w tło pinger, który sprawdza dostępność Twoich usług i wyświetla na kafelkach świecące diody `● Online` lub `● Offline` w czasie rzeczywistym.
3.  **Zintegrowany Toolbox Dewelopera**: Monospace'owy widget w panelu bocznym służący jako lokalne narzędzie deweloperskie do formatowania JSON, Base64 encode/decode oraz URL encode/decode (z wbudowaną auto-detekcją formatów).
4.  **Przełącznik Motywów (Light/Dark)**: Szybka zmiana stylistyki jednym przyciskiem w nagłówku. Możesz płynnie przełączać się między jasnym **LingoLogy Light Mode** a ciemnym **Deep Space Dark Mode** (wybór zapamiętywany jest w `localStorage`).
5.  **Kategoryzacja Linków**: System tagowania aplikacji (np. `PROD`, `STAGE`, `DEV`, `TOOL`), które wyświetlają się w postaci zgrabnych, transparentnych etykiet w rogu kafelków.

---

## 🚀 Główne Funkcje Launchpada

### 1. Czysty Pulpit & Detale Projektu (Modal)
*   **Minimalistyczne Kafelki**: Kafelki na pulpicie wyświetlają teraz jedynie logo marki (z gradientem dopasowanym do ikony), nazwę projektu, czysty adres URL, tag kategorii oraz diodę live statusu. Jeśli w projekcie znajdują się uwagi, na dole kafelka ukaże się jedynie subtelna kontrolka `📝 Zapisane poprawki`.
*   **Projekt Modal (Szczegóły)**: Kliknięcie kafelka (lub skrótu numerycznego) otwiera elegancki, szklany modal szczegółów. Zawiera on:
    *   Duży przycisk **"Uruchom Aplikację 🚀"** otwierający URL w nowej karcie.
    *   Dedykowany notatnik uwag TODO z błyskawicznym autozapisem.
    *   Przycisk **"Generuj Prompt ChatGPT 🤖"**, który kompiluje notatki w profesjonalny prompt dla programisty AI i kopiuje go do Twojego schowka, oraz skrót do otwarcia ChatGPT.

### 2. Live Health Checker (Status Działania Usług)
*   Na każdym kafelku wyświetla się automatycznie dioda dostępności.
*   Pinger w tle co sekundę po załadowaniu bada dostępność serwerów `lingology.pl`, `lingology.app` oraz `tutorapp-khaki.vercel.app` (wykorzystując tryb `no-cors`, co pozwala ominąć blokady CORS przeglądarki).
*   Zielona świecąca dioda oznacza, że usługa działa prawidłowo (`Online`). Czerwona oznacza problem z serwerem, siecią lub DNS (`Offline`).

### 3. Command Palette (Raycast / Alfred Style)
*   Wciśnij **`Ctrl + K`** lub **`Cmd + K`** w dowolnej chwili, aby wywołać panel.
*   Zacznij pisać, aby przefiltrować listę. Możesz nawigować za pomocą strzałek **`↑` i `↓`** oraz zatwierdzać komendy klawiszem **`Enter`**.
*   **Dostępne akcje**: uruchamianie dowolnej aplikacji, otwieranie modali szczegółów projektów, czyszczenie scratchpada, otwieranie modalu dodawania linków czy przełączanie motywów.

### 4. Toolbox Dewelopera (Sidebar Utility)
Zintegrowany w prawy panel deweloperski notes narzędziowy. Posiada trzy zakładki:
*   **JSON**: Wklej minifikowany tekst JSON i kliknij "Uruchom", aby go ustrukturyzować (beautify) ze wcięciem 4 spacji.
*   **Base64**: Wklej tekst do zakodowania LUB zakodowany ciąg Base64 do odkodowania. System **automatycznie rozpozna format** i wykona odpowiednią operację!
*   **URL**: Wklej ciąg tekstowy LUB zakodowany adres URL (ze znakami `%`). System automatycznie wykona kodowanie lub dekodowanie w zależności od zawartości.
*   Przycisk kopiowania pozwala natychmiast wrzucić wynik do schowka.

### 5. Motyw Jasny i Ciemny
*   **LingoLogy Light Mode**: Czyste, miętowo-kremowe tło o wysokim komforcie, zainspirowane oryginalnym designem LingoLogy.
*   **Deep Space Dark Mode**: Klimatyczny ciemny motyw z neonowymi poświatami oraz głębokim kontrastem, idealny do pracy w nocy.

---

## 🎹 Super-wygodne Skróty Klawiszowe

*   ⌨️ **`Ctrl + K` / `Cmd + K`**: Otwiera / zamyka Command Palette.
*   ⌨️ **Klawisze `1` do `9`**: Otwiera panel szczegółów (modal) danej aplikacji.
*   ⌨️ **Klawisz `/`**: Skupia kursor (focus) na głównym pasku wyszukiwania.
*   ⌨️ **Klawisz `N` lub `n`**: Otwiera modal dodawania nowej aplikacji.
*   ⌨️ **Klawisz `Esc`**: Zamyka otwarte modale, Command Palette lub usuwa fokus z wyszukiwarki.

---

## 🛠️ Jak Korzystać?

### Wdrożenie Live (Zalecane)
Aplikacja Workspace 2.0 jest już w pełni wdrożona pod Twoim adresem:
👉 **[https://kuba-launchpad.vercel.app/](https://kuba-launchpad.vercel.app/)**

*(Wskazówka: Jeśli strona nie załadowała się w nowej wersji, wymuś twarde odświeżenie pamięci podręcznej przeglądarki kombinacją `Ctrl + F5` lub `Cmd + Shift + R`).*
