
## Obiettivo
Aggiornare **/locanda-eden** (pagina “LOCANDA EDEN”) con:
1) **Tasto “Torna indietro”** che porta **sempre** alla Home (`/`).
2) **Hero “bella”** con:
   - lo **stesso logo EDEN** dell’hero della home (`/eden/eden-hero-logo.png`)
   - una scritta sotto tipo **“LOCANDA”** (stile simile alla home).
3) Sezioni sotto:
   - **Menù** (con contenuti “esempio realistici”)
   - **Carta Vini** (contenuti esempio)
   - **Galleria** (con immagini esempio)
   - **Tasto Prenota** che apre **WhatsApp** con **messaggio precompilato** sul **numero già usato nel sito**.

---

## Esplorazione (stato attuale)
- `src/pages/LocandaEden.tsx` è ancora placeholder (titolo + “pagina in arrivo”).
- Logo hero principale già presente in home: in `src/components/eden/EdenLanding.tsx`  
  `src="/eden/eden-hero-logo.png"`.
- Numero WhatsApp già usato nel progetto: `https://wa.me/393497152524` (in `EdenLanding.tsx`).
- In `src/styles/eden.css` esistono già:
  - la base tema EDEN (`.eden-theme`, palette, ecc.)
  - stili “sezione” (`.eden-shell`, `.eden-title`, `.eden-sub`, ecc.)
  - stili completi per una **gallery grid** (`.gallery-section`, `.gallery-grid`, `.gallery-item`, overlay, ecc.) riutilizzabili anche su Locanda.

---

## Decisioni confermate (dalle tue risposte)
- Tasto indietro: **sempre alla Home** (`/`)
- WhatsApp: **stesso numero esistente**
- Contenuti iniziali: **Esempi realistici** (poi li sostituiamo con i tuoi reali)

---

## Design / Approccio (senza stravolgere EDEN)
### Layout pagina
- Mantengo `eden-html` / `eden-body` come già fatto (così lo sfondo e i globals EDEN restano coerenti).
- Aggiungo un **header semplice di pagina** (non quello completo della home), con:
  - “← Torna a EDEN” (link interno a `/`)
  - opzionale micro-titolo “Locanda Eden” a destra (in stile soft)

### Hero Locanda
- Creo una sezione `locanda-hero` con:
  - sfondo coerente EDEN (gradiente notturno + aurora soft)
  - **logo**: `<img className="hero-logo" src="/eden/eden-hero-logo.png" ... />` per mantenere proporzioni/stile
  - sotto: “LOCANDA” (o “LOCANDA EDEN” se preferisci, ma per ora seguo la tua frase “Locanda quasi simile” → “LOCANDA” come sub-title)
  - breve descrizione 1 riga (esempio realistico) per dare “peso” alla hero

### Menù + Carta vini
- Struttura in due blocchi con card/colonne:
  - Menù: antipasti, primi, secondi, dessert (esempi)
  - Carta Vini: “Bollicine / Bianchi / Rossi / Rosati / Dessert” (esempi)
- Implementazione “data-driven”: array di sezioni e items in TS, poi map in UI (così sarà facile sostituire con i contenuti reali).

### Galleria
- Riutilizzo gli stili già presenti (`.gallery-grid`, `.gallery-item`, overlay).
- Inserisco 6–9 immagini “esempio” (URL esterni stabili) + titoli/tag.
  - Quando mi mandi le foto vere, sostituiamo gli URL con asset in `public/` o `src/assets/`.

### CTA Prenota WhatsApp
- Bottone “Prenota su WhatsApp” che apre:
  `https://wa.me/393497152524?text=<messaggio>`
- Messaggio precompilato (esempio realistico), tipo:
  ```
  Ciao EDEN, vorrei prenotare per la LOCANDA.
  Data:
  Orario:
  Persone:
  Nome:
  Note:
  ```
- Apertura in nuova tab con `target="_blank"` + `rel="noreferrer"`.

---

## Piano di implementazione (step-by-step)

### 1) Aggiornare `src/pages/LocandaEden.tsx` (da placeholder a pagina completa)
- Tenere l’`useEffect` che applica `eden-html` / `eden-body`.
- Sostituire il contenuto con:
  1) **Header pagina** (fixed o sticky):
     - `<Link to="/" className="locanda-back">← Torna a EDEN</Link>`
  2) **Hero Locanda**:
     - logo `/eden/eden-hero-logo.png` (stessa classe `hero-logo` per coerenza)
     - titolo/subtitolo (LOCANDA) + riga descrizione
     - CTA “Prenota su WhatsApp” (porta a `wa.me` con testo)
  3) **Sezione Menù**
  4) **Sezione Carta Vini**
  5) **Sezione Galleria** (grid già pronta in CSS)
  6) (Opzionale) ripetizione CTA “Prenota” a fine pagina (per conversione)

### 2) Aggiungere stili dedicati in `src/styles/eden.css`
Aggiungerò classi nuove senza toccare gli stili della home:
- `.locanda-header`, `.locanda-back` (aspetto “pill” soft, hover/focus accessibile)
- `.locanda-hero`, `.locanda-hero-inner`, `.locanda-kicker`, `.locanda-title`, `.locanda-desc`
- `.locanda-cta` (bottone WhatsApp coerente con EDEN: emerald glow, testo leggibile)
- `.locanda-menu-grid`, `.locanda-card`, `.locanda-card-title`, `.locanda-item`, `.locanda-item-name`, `.locanda-item-desc`, `.locanda-item-price`
- Piccole media query per mobile (padding e colonne)

### 3) Implementare dati “esempio realistici”
Dentro `LocandaEden.tsx`:
- costanti tipo:
  - `const menuSections = [...]`
  - `const wineSections = [...]`
  - `const galleryItems = [...]`
- (Importante) tenere i dati facilmente sostituibili quando mi dai:
  - piatti veri, prezzi veri
  - etichette vini
  - foto reali

---

## Verifiche end-to-end (obbligatorie)
1) Vai su `/locanda-eden`:
   - vedi subito il **tasto “← Torna a EDEN”**
   - clic → torna a `/`
2) Hero:
   - logo **identico** a quello della home (stesso file `/eden/eden-hero-logo.png`)
   - scritta “LOCANDA” sotto, ben leggibile su mobile/desktop
3) Sezioni:
   - Menù e Carta Vini visivamente “premium” e leggibili
   - Galleria: griglia funzionante (hover overlay su desktop)
4) Bottone WhatsApp:
   - clic → apre `wa.me/393497152524` con **testo precompilato**
   - verifica anche su mobile (apertura WhatsApp app / web)

---

## File coinvolti
- **EDIT** `src/pages/LocandaEden.tsx`
- **EDIT** `src/styles/eden.css`

---

## Dettagli tecnici (per trasparenza)
- Navigazione back: userò `Link` di `react-router-dom` verso `/` (come richiesto “sempre Home”).
- Logo hero: uso path pubblico `/eden/eden-hero-logo.png` (già usato e quindi “garantito” nel progetto).
- WhatsApp: URL `https://wa.me/393497152524?text=${encodeURIComponent(message)}` con `target="_blank"` e `rel="noreferrer"`.
- Galleria: riuso delle classi esistenti in `eden.css` per evitare duplicazioni e mantenere coerenza estetica EDEN.
