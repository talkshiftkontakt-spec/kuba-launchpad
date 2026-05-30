# Podsumowanie i Przewodnik: Launchpad Aplikacji

Stworzyliśmy w pełni funkcjonalną, zoptymalizowaną, a zarazem wizualnie zjawiskową aplikację **Launchpad**, która służy jako Twój osobisty pulpit nawigacyjny do codziennej pracy. Została zaprojektowana w nowoczesnej estetyce **dark glassmorphism** i zoptymalizowana tak, aby mogła działać nieprzerwanie w tle.

---

## 🎨 Co zrobiliśmy (Przegląd Aplikacji)

Aplikacja składa się z trzech ściśle powiązanych ze sobą komponentów:
1. **[index.html](file:///C:/Users/kubas/Documents/antigravity/blissful-borg/index.html)**: Semantyczna struktura o wysokiej dostępności i szybkości ładowania, wczytująca czcionki *Outfit* i *Inter* oraz zestaw ikon *FontAwesome*.
2. **[style.css](file:///C:/Users/kubas/Documents/antigravity/blissful-borg/style.css)**: Kompletny system graficzny bazujący na zmiennych CSS. Zawiera m.in.:
   - **Płynne, animowane tło**: Pływające, półprzezroczyste kule światła (glow blobs) poruszające się powoli w tle.
   - **Efekt szronionego szkła (Glassmorphism)**: Kafelki o wysokiej przejrzystości z efektami rozmycia tła (`backdrop-filter`) i subtelnymi, świecącymi obramowaniami przy najechaniu myszką.
   - **Responsywną siatkę (Grid)**: Automatycznie dostosowującą się do szerokości okna przeglądarki.
3. **[app.js](file:///C:/Users/kubas/Documents/antigravity/blissful-borg/app.js)**: Logika biznesowa napisana w czystym, ultraszybkim Vanilla JS bez zewnętrznych frameworków.

---

## 🚀 Główne Funkcje Launchpada

### 1. Dedykowane Kafelki Aplikacji
*   **Lingology.pl**: Osadzony na głębokim, morskim gradiencie (`gradient-lingology`). Wykorzystuje Twoje ciemne logo (`assets/lingology-logo-dark.png`) – biała ścieżka na morskim tle, które wygląda jak profesjonalna ikona aplikacji iOS.
*   **Lingology.app**: Osadzony na szmaragdowym gradiencie (`gradient-emerald`). Wykorzystuje jasne logo (`assets/lingology-logo-light.png`) – morska ścieżka na białym tle, dając piękny kontrast.
*   **TutorApp Dashboard**: Oznaczony ciepłym gradientem zachodzącego słońca (`gradient-tutor`) ze stylową, edukacyjną ikoną czapki studenckiej (Graduation Cap).
*   **Dynamiczne zachowanie**: Wszystkie karty otwierają się automatycznie w **nowej karcie** (`target="_blank"`), pozostawiając Twój Launchpad nienaruszony.

### 2. Pełna Synchronizacja z LocalStorage (Dodawanie i Usuwanie)
*   Możesz w każdej chwili kliknąć przycisk **"Dodaj aplikację"** w prawym górnym rogu.
*   Otworzy się elegancki szklany modal, w którym wpiszesz nazwę, adres URL, wybierzesz ikonę (emoji, np. `💬`, `📚`, lub nazwę ikony FontAwesome, np. `fa-solid fa-gamepad`) oraz jeden z 5 przygotowanych, neonowych gradientów.
*   Zapisane aplikacje trafiają do pamięci `localStorage` przeglądarki – nie znikną po odświeżeniu strony ani po wyłączeniu komputera!
*   Aplikacje dodane przez Ciebie mają na karcie (po najechaniu myszką) przycisk **kosza 🗑️**, który pozwala na ich natychmiastowe usunięcie.

### 3. Szybkie Wyszukiwanie (Błyskawiczne Filtrowanie)
*   Wystarczy zacząć pisać w pasku wyszukiwania na górze. Aplikacja natychmiast odfiltruje kafelki po nazwie lub adresie URL.

### 4. Inteligentny Sidebar
*   **Szybki Notes (Scratchpad)**: Notatnik zapamiętujący każdą wpisaną literę w czasie rzeczywistym. Posiada mechanizm **debounce** (zapisuje dane z lekkim opóźnieniem po zakończeniu pisania, aby nie obciążać procesora), pokazuje status zapisu ("Zapisywanie..." / "Zapisano") oraz licznik znaków. Możesz go też wyczyścić jednym przyciskiem.
*   **Zegar i dynamiczne powitanie**: W prawym górnym rogu znajduje się precyzyjny zegar sekundy-po-sekundzie wraz z pełną polską datą. Powitanie w logo zmienia się automatycznie w zależności od pory dnia (np. *"Dzień dobry, Kuba! 🌅"*, *"Miłego popołudnia! ☀️"*, *"Dobry wieczór, Kuba! 🌙"*, *"Dobrej nocy, Kuba! 🌌"*).

---

## 🎹 Super-wygodne Skróty Klawiszowe

Stworzyliśmy system sterowania klawiaturą, abyś mógł obsługiwać pulpit bez dotykania myszki:

*   ⌨️ **Klawisze `1` do `9`**: Natychmiast otwiera w nowej zakładce aplikację o danym numerze (widocznym w rogu kafelka). Idealne do błyskawicznego odpalania Lingology czy TutorApp!
*   ⌨️ **Klawisz `/`**: Automatycznie skupia kursor (focus) na pasku wyszukiwania i zaznacza tekst, umożliwiając natychmiastowe wpisanie szukanej frazy.
*   ⌨️ **Klawisz `N` lub `n`**: Błyskawicznie otwiera modal dodawania nowej aplikacji.
*   ⌨️ **Klawisz `Esc`**: Zamyka otwarty modal lub czyści wyszukiwarkę i usuwa z niej fokus.

---

## 🛠️ Jak Uruchomić i Korzystać?

Możesz uruchomić aplikację na trzy sposoby:

### Sposób 1: Live na GitHub Pages (Zalecany i najwygodniejszy! 🚀)
Twój Launchpad jest już w pełni wdrożony w chmurze i dostępny 24/7 pod adresem:
👉 **[https://talkshiftkontakt-spec.github.io/kuba-launchpad/](https://talkshiftkontakt-spec.github.io/kuba-launchpad/)**
*(Dodaj ten adres do zakładek i ciesz się pulpitem bez uruchamiania jakichkolwiek serwerów na swoim komputerze!).*

### Sposób 2: Przez lokalny serwer deweloperski
Wystarczy, że uruchomisz zaproponowane polecenie w terminalu:
```bash
npm run dev
```
Uruchomi to błyskawiczny serwer HTTP. W przeglądarce przejdź pod adres:
👉 **[http://localhost:3000](http://localhost:3000)**
*(Dzięki temu wszystkie mechanizmy przeglądarki oraz lokalne zasoby grafik będą działać bez żadnych restrykcji bezpieczeństwa CORS).*

### Sposób 3: Bezpośrednie otwarcie pliku
Możesz również po prostu otworzyć plik `index.html` bezpośrednio w dowolnej przeglądarce (np. przeciągając plik na okno Chrome/Edge/Firefox).
