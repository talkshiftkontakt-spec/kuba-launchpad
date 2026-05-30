# Podsumowanie i Przewodnik: Launchpad Aplikacji

Stworzyliśmy w pełni funkcjonalną, zoptymalizowaną, a zarazem wizualnie zjawiskową aplikację **Launchpad**, która służy jako Twój osobisty pulpit nawigacyjny do codziennej pracy. Została zaprojektowana w prestiżowej, jasnej estetyce marki **LingoLogy** (kremowo-miętowe tło z szlachetnymi akcentami i subtelnymi, żywymi gradientami) i zoptymalizowana tak, aby mogła działać nieprzerwanie w tle.

---

## 🎨 Co zrobiliśmy (Przegląd Aplikacji)

Aplikacja składa się z trzech ściśle powiązanych ze sobą komponentów:
1. **[index.html](file:///C:/Users/kubas/Documents/antigravity/blissful-borg/index.html)**: Semantyczna struktura o wysokiej dostępności i szybkości ładowania, wczytująca czcionki *Outfit* i *Inter* oraz zestaw ikon *FontAwesome*.
2. **[style.css](file:///C:/Users/kubas/Documents/antigravity/blissful-borg/style.css)**: Kompletny system graficzny LingoLogy Light Mode bazujący na zmiennych CSS. Zawiera m.in.:
   - **Pastelowe, animowane tło**: Pływające, półprzezroczyste miętowo-błękitne kule światła poruszające się powoli w tle.
   - **Czyste, białe kafelki (iOS style)**: Kapsuły o wysokiej przejrzystości z ultra-cienką miętową ramką (`rgba(13, 148, 136, 0.12)`) i bardzo miękkim cieniem.
   - **Responsywną siatkę (Grid)**: Elastyczny układ o automatycznie dopasowywanej wysokości dla zawartości kart.
3. **[app.js](file:///C:/Users/kubas/Documents/antigravity/blissful-borg/app.js)**: Logika biznesowa napisana w czystym, ultraszybkim Vanilla JS bez zewnętrznych frameworków.

---

## 🚀 Główne Funkcje Launchpada

### 1. Dedykowane Kafelki Aplikacji
*   **Lingology.pl**: Osadzony na głębokim, morskim gradiencie (`gradient-lingology`). Wykorzystuje Twoje ciemne logo (`assets/lingology-logo-dark.png`) – biała ścieżka na morskim tle, które wygląda jak profesjonalna ikona aplikacji iOS.
*   **Lingology.app**: Osadzony na szmaragdowym gradiencie (`gradient-emerald`). Wykorzystuje jasne logo (`assets/lingology-logo-light.png`) – morska ścieżka na białym tle, dając piękny kontrast.
*   **TutorApp Dashboard**: Oznaczony ciepłym gradientem zachodzącego słońca (`gradient-tutor`) z **własną, osobną ikoną czapki studenckiej (Graduation Cap)**.
*   **Dynamiczne zachowanie**: Wszystkie karty otwierają się automatycznie w **nowej karcie** (`target="_blank"`), pozostawiając Twój Launchpad nienaruszony.

### 2. Zintegrowane Notatki "Co jest do poprawy" w Każdym Projekcie
Pod każdym kafelkiem projektu zintegrowaliśmy dedykowaną strefę szybkich poprawek:
*   **Działanie**: Kliknięcie przycisku `📝 Notatki do poprawy` w stopce karty płynnie rozwinie (wysunie z dołu) pole tekstowe (textarea).
*   **Wskaźnik statusu**: Jeśli w projekcie znajdują się zapisane poprawki, przy nagłówku pojawi się pulsująca, pomarańczowa kropka sygnalizująca zaległe zadania.
*   **Autosave z Debounce**: Wpisanie dowolnej poprawki automatycznie zapisuje się w `localStorage` (z ładną kontrolką "Zapisano" w rogu).
*   **Bezpieczeństwo kliknięć**: Pisanie w notatniku ani klikanie w pole tekstowe **nigdy nie odpali** linku aplikacji (pełna izolacja kliknięć i skrótów klawiszowych podczas pisania).

### 3. Pełna Synchronizacja z LocalStorage (Dodawanie i Usuwanie)
*   Możesz w każdej chwili kliknąć przycisk **"Dodaj aplikację"** w prawym górnym rogu.
*   Otworzy się elegancki szklany modal, w którym wpiszesz nazwę, adres URL, wybierzesz ikonę (emoji, np. `💬`, `📚`, lub nazwę ikony FontAwesome, np. `fa-solid fa-gamepad`) oraz jeden z 5 przygotowanych, neonowych gradientów.
*   System jest wyposażony w **inteligentną synchronizację**: podczas każdego odświeżenia automatycznie aktualizuje domyślne aplikacje (np. poprawki ikon/adresów z kodu), zachowując Twoje notatki oraz wszystkie ręcznie dodane linki.
*   Aplikacje dodane przez Ciebie mają na karcie (po najechaniu myszką) przycisk **kosza 🗑️**, który pozwala na ich natychmiastowe usunięcie.

### 4. Szybkie Wyszukiwanie (Błyskawiczne Filtrowanie)
*   Wystarczy zacząć pisać w pasku wyszukiwania na górze. Aplikacja natychmiast odfiltruje kafelki po nazwie lub adresie URL.

### 5. Inteligentny Sidebar
*   **Szybki Notes (Scratchpad)**: Notatnik zapamiętujący każdą wpisaną literę w czasie rzeczywistym. Posiada mechanizm **debounce**, pokazuje status zapisu ("Zapisywanie..." / "Zapisano") oraz licznik znaków. Możesz go też wyczyścić jednym przyciskiem.
*   **Zegar i dynamiczne powitanie**: W prawym górnym rogu znajduje się precyzyjny zegar sekundy-po-sekundzie wraz z pełną polską datą. Powitanie w logo zmienia się automatycznie w zależności od pory dnia (np. *"Dzień dobry, Kuba! 🌅"*, *"Miłego popołudnia! ☀️"*, *"Dobry wieczór, Kuba! 🌙"*, *"Dobrej nocy, Kuba! 🌌"*).

---

## 🎹 Super-wygodne Skróty Klawiszowe

Stworzyliśmy system sterowania klawiaturą, abyś mógł obsługiwać pulpit bez dotykania myszki:

*   ⌨️ **Klawisze `1` do `9`**: Natychmiast otwiera w nowej zakładce aplikację o danym numerze (widocznym w rogu kafelka). Idealne do błyskawicznego odpalania Lingology czy TutorApp!
*   ⌨️ **Klawisz `/`**: Automatycznie skupia kursor (focus) na pasku wyszukiwania i zaznacza tekst, umożliwiając natychmiastowe wpisanie szukanej frazy.
*   ⌨️ **Klawisz `N` lub `n`**: Błyskawicznie otwiera modal dodawania nowej aplikacji.
*   ⌨️ **Klawisz `Esc`**: Zamyka otwarty modal, czyści wyszukiwarkę i usuwa z niej fokus, lub zamyka aktualnie edytowaną notatkę w kafelku.

---

## 🛠️ Jak Uruchomić i Korzystać?

Możesz uruchomić aplikację na trzy sposoby:

### Sposób 1: Live na Vercel (Zalecany i najwygodniejszy! 🚀)
Twój Launchpad jest już w pełni wdrożony w chmurze i dostępny 24/7 pod adresem:
👉 **[https://kuba-launchpad.vercel.app/](https://kuba-launchpad.vercel.app/)**
*(Dodaj ten adres do zakładek na swoim pasku i korzystaj bez obciążania komputera!).*

### Sposób 2: Live na GitHub Pages
Aplikacja jest również stale hostowana pod adresem:
👉 **[https://talkshiftkontakt-spec.github.io/kuba-launchpad/](https://talkshiftkontakt-spec.github.io/kuba-launchpad/)**

### Sposób 3: Bezpośrednie otwarcie pliku
Możesz również po prostu otworzyć plik `index.html` bezpośrednio w dowolnej przeglądarce (np. przeciągając plik na okno Chrome/Edge/Firefox).
