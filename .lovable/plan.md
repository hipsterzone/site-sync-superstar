
## Obiettivo (in base alle tue 5 richieste)
1) In hero, “Scorri nel nostro Eden” **centrato in basso** e con **movimento** (parallax + bobbing).
2) Ripristinare/estendere le **animazioni di entrata nello scroll** su **tutte le sezioni** e anche sugli **elementi interni** (stagger).
3) Inserire **“La storia dell’EDEN”** (versione **media narrativa**) **prima** della sezione “La cucina di Miriam”.
4) Spostare il **modulo Eventi** (quello “Richiedi una consulenza”) **sotto Recensioni**.
5) Aggiungere metodi di contatto “robusti” (WhatsApp + alternative) così, anche se qualcosa blocca l’invio, l’utente **riesce comunque a contattare**.

---

## Stato attuale (da codebase)
- “Scorri nel nostro Eden” esiste: `.hero-scroll` è già `left:50%` + `translateX(-50%)`, e ha anche `parallax-layer` con `data-parallax="0.18"`.
- Reveal-on-scroll esiste già:
  - Hook `useRevealOnScroll(".reveal-on-scroll")` con `IntersectionObserver`.
  - CSS `.reveal-on-scroll` + `.reveal-on-scroll.visible`.
  - Stagger esiste (`.reveal-stagger`) ma oggi è “specializzato” soprattutto per la gallery.
- Il “modulo” vero e proprio è quello della sezione **Eventi** (`#eventi`), non esiste un secondo form nella sezione Contatti (lì ci sono info + map + CTA).

---

## Modifiche da implementare (dettaglio)

### A) Hero: “Scorri nel nostro Eden” centrato + movimento (parallax + bobbing)
**File:** `src/styles/eden.css`
1. Aggiungere un’animazione dedicata a `.hero-scroll` (es. `scrollBobbing`) che muove leggermente su/giù e fa respirare l’opacità.
2. Fare attenzione a non “rompere” il parallax allo scroll già esistente:
   - Soluzione: animare con `translateY()` via keyframes ma applicandola su un wrapper interno oppure usando `transform` in modo composito (perché `.parallax-layer` già usa `transform: translate3d(0,var(--parallaxY),0)`).
   - Approccio più sicuro: **aggiungere un inner wrapper** dentro `.hero-scroll` in JSX (es. `.hero-scroll-inner`) e animare quello, lasciando `.parallax-layer` gestire il transform principale.

**File:** `src/components/eden/EdenLanding.tsx`
3. Modificare markup:
   - da:
     ```tsx
     <div className="hero-scroll parallax-layer" data-parallax="0.18">...</div>
     ```
   - a:
     ```tsx
     <div className="hero-scroll parallax-layer" data-parallax="0.18">
       <div className="hero-scroll-inner">...</div>
     </div>
     ```
   così il parallax resta su `.hero-scroll`, e il bobbing su `.hero-scroll-inner`.

**Acceptance criteria**
- Sempre centrato in basso (desktop + mobile).
- Si muove chiaramente (bobbing) anche a pagina ferma.
- Durante scroll, continua ad avere il “parallax” leggero.

---

### B) Animazioni di entrata nello scroll: estese a tutte le sezioni + elementi interni (stagger)
**File:** `src/components/eden/EdenLanding.tsx`
1. Potenziare la logica reveal per replicare il comportamento dell’HTML sorgente:
   - quando un `.reveal-on-scroll` diventa `visible`, assegnare automaticamente `--i` ai figli di ogni `.reveal-stagger` interno (come fa l’HTML: indicizzazione per delay).
2. Unificare/semplificare:
   - oggi hai già:
     - `useRevealOnScroll(".reveal-on-scroll")`
     - un secondo `IntersectionObserver` per `.reveal-stagger`
   - Implementazione proposta:
     - mantenere `useRevealOnScroll`, ma **quando un elemento entra**, oltre a fare `.classList.add("visible")`, eseguire anche:
       - per ogni `.reveal-stagger` dentro quel blocco: assegna `--i` a ciascun child element (solo nodi elemento).
     - A questo punto, l’observer separato `.reveal-stagger` diventa opzionale: possiamo rimuoverlo o lasciarlo solo per casi particolari. L’obiettivo è evitare doppioni e rendere il comportamento “globale”.

**File:** `src/components/eden/EdenLanding.tsx` (markup)
3. Aggiungere classi `reveal-stagger` + `stagger-item` dove serve:
   - Sezione EDEN (i “3 punti”): mettere `.reveal-stagger` sul contenitore e `.stagger-item` su ogni `.eden-point`.
   - Recensioni: mettere `.reveal-stagger` su `.reviews-grid` e `.stagger-item` su ogni `.review-card`.
   - Contatti: mettere `.reveal-stagger` su `.contact-list` e `.stagger-item` su ogni `.c-item` (e opzionalmente sulla card indicazioni).
   - Qualsiasi altra griglia/card del layout che deve entrare “a cascata”.

**File:** `src/styles/eden.css`
4. Verificare che esistano regole coerenti per:
   - `.reveal-stagger .stagger-item { opacity:0; transform: ... }`
   - `.reveal-stagger.visible .stagger-item { opacity:1; transform: ...; transition-delay: calc(var(--i) * Xms) }`
   Se alcune regole non coprono i nuovi elementi, aggiungerle mantenendo timing/easing già presenti nello stylesheet EDEN.

**Acceptance criteria**
- Ogni sezione principale entra con reveal.
- Dentro EDEN/Recensioni/Contatti i card entrano con **stagger** (uno dopo l’altro), senza scatti e senza “apparire già visibili”.

---

### C) Inserire “La storia dell’EDEN” (media narrativa) prima della cucina
**File:** `src/components/eden/EdenLanding.tsx`
1. Inserire una nuova sezione tra BLOCCO 2 (EDEN) e BLOCCO 3 (CUCINA):
   - id: `storia` (o `storia-eden`, scegliamo `storia` per semplicità)
   - classi: `story-section reveal-on-scroll`
2. Contenuto (media narrativa), struttura proposta:
   - Kicker (tipo “La storia”)
   - Titolo (H2)
   - 2–3 paragrafi narrativi
   - micro-timeline / “capitoli” (3 step) in stile premium (stagger)

**File:** `src/styles/eden.css`
3. Aggiungere lo styling della nuova sezione riusando pattern esistenti:
   - shell simile a `eden-shell`/`gallery-shell`
   - griglia due colonne (testo + “timeline card”)
   - supporto reveal/stagger integrato (coerente con punto B)

**In più (navigazione)**
4. Opzionale ma consigliato: aggiungere link “Storia” nella navbar (tra Eden e Cucina) per coerenza.

**Acceptance criteria**
- La sezione appare esattamente nel punto richiesto (prima di “La cucina di Miriam”).
- È animata in entrata come le altre (reveal + eventuale stagger).
- Tipografia/spacing coerenti col resto del tema EDEN.

---

### D) Spostare il modulo Eventi sotto Recensioni
**File:** `src/components/eden/EdenLanding.tsx`
1. Spostare l’intero BLOCCO 5 `#eventi` (sezione `ep-section`) **dopo** BLOCCO 6 `#recensioni` e **prima** BLOCCO 7 `#contatti`.
2. Verificare che:
   - gli anchor `href="#eventi"` continuino a funzionare (funzioneranno comunque, solo che porteranno più giù).
   - eventuali reveal/stagger associati alla sezione Eventi continuino a triggerare correttamente (con observer).

**Acceptance criteria**
- Dopo Recensioni, la sezione successiva è Eventi (con form), poi Contatti.

---

### E) Metodo di contatto WhatsApp + alternative “anti-problemi” per il modulo
Il form Eventi oggi apre WhatsApp con `wa.me` + testo precompilato (ok), ma nella pratica possono esserci blocchi (popup blocker, browser in-app, ecc).

**File:** `src/components/eden/EdenLanding.tsx`
1. Rendere “a prova di blocchi”:
   - aggiungere sotto al bottone “Invia la richiesta” una riga di fallback:
     - Link diretto: “Apri WhatsApp” (stesso messaggio, stesso numero)
     - “Copia messaggio” (clipboard) così l’utente può incollare manualmente su WhatsApp
     - opzionale: “Chiama” (tel:)
2. Validazione:
   - mantenere le validazioni già presenti prima di generare il messaggio (e continuare a fare `encodeURIComponent`).
   - imporre limiti di lunghezza (nome/tel/note) per evitare URL troppo lunghi e contenuti strani.

**File:** `src/styles/eden.css`
3. Stilizzare questi fallback come mini-link/pill coerenti con la UI.

**Acceptance criteria**
- Se “Invia la richiesta” non apre la nuova scheda, l’utente ha comunque:
  - un link WhatsApp cliccabile
  - un bottone copia-testo funzionante
  - un link telefono

---

## File che toccherò
- `src/components/eden/EdenLanding.tsx`
  - wrapper per animazione hero scroll
  - reveal logic: assegnazione `--i` ai gruppi stagger
  - aggiunta classi `reveal-stagger/stagger-item` su elementi interni (eden points, reviews, contatti)
  - nuova sezione “storia”
  - spostamento sezione `#eventi` sotto recensioni
  - fallback contatti (whatsapp/copia/chiama) nel form eventi
- `src/styles/eden.css`
  - keyframes + classi per bobbing hero scroll (su wrapper interno)
  - eventuali estensioni CSS per stagger su card (se mancanti)
  - styling nuova sezione story

---

## Test end-to-end (che farai in preview)
1) Hero: verifica “Scorri nel nostro Eden” centrato in basso + bobbing visibile, e che allo scroll si muova anche col parallax.
2) Scroll completo pagina: ogni sezione entra con reveal; in EDEN/Recensioni/Contatti vedi stagger delle card.
3) Dopo “Recensioni” trovi “Eventi” (form) e poi “Contatti”.
4) Form Eventi:
   - clic “Invia la richiesta” → si apre WhatsApp con testo
   - se blocca, prova “Apri WhatsApp” e “Copia messaggio” (incolla in WhatsApp)
   - prova anche su mobile.

