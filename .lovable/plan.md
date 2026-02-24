
## Obiettivo
Aggiungere **tutti gli effetti mancanti** per ottenere una replica **1:1 rispetto a `public/eden/nuovo_1-2.html` del repo GitHub**, portandoli in **React nativo** dentro:
- `src/components/eden/EdenLanding.tsx`
- `src/styles/eden.css`

## Cosa manca oggi (gap rilevati confrontando il tuo `EdenLanding.tsx`/`eden.css` con `nuovo_1-2.html`)
Nel file HTML GitHub sono presenti effetti/elementi che **nel tuo React non ci sono** (o sono diversi):

1) **Header completo con navigazione**
- Logo immagine (`/eden/eden-logo.jpg`) + testo
- **Menu button** mobile (`header-menu-btn`) che apre/chiude la nav
- Nav con link interni: `#eden #cucina #gallery #eventi #recensioni #contatti`
- CTA “Prenota” cliccabile (`tel:`)

2) **Hero: logo immagine + parallax scroll-driven**
- In HTML l’H1 contiene **immagine** `hero-logo` (`/eden/eden-hero-logo.png`), non testo “EDEN”
- Parallax basato su **scroll** (class `.parallax-layer` + `data-parallax="0.xx"`) applicato a:
  - `hero-blob-wrap`
  - `hero-content`
  - `hero-scroll-inner`
- Nel tuo React c’è invece parallax **su mousemove** (3D): va reso 1:1 con lo scroll-driven.

3) **Overlay/effetti globali extra**
- `<div class="eden-led" aria-hidden="true"></div>` (overlay LED) presente in HTML, assente nel tuo React/CSS.

4) **Cucina: mood/atmosfera Mare/Terra (background cinematic)**
- In HTML la sezione cucina ha:
  - `data-reveal="cucina"` e `data-mood="mare"`
  - wrapper atmosfere: `.cucina-atmo-wrap` con due layer `.cucina-atmo--mare` / `--terra`
  - `.cucina-reveal` (effetto reveal)
- Nel tuo React questi elementi non ci sono → mancano crossfade/atmosfera.

5) **Gallery completa + reveal stagger**
- In HTML la galleria ha **16 items** (non 6)
- Usa `.reveal-stagger` per l’entrata “a cascata”
- Il tuo React ha 6 items e reveal “manuale” solo sui 6 ref.

6) **Recensioni: card meta (stelle + badge) + follower counter**
- In HTML le review card includono: `.rc-meta`, `.rc-stars`, `.rc-badge`
- Il counter follower in HTML è “plain 8000” con `data-format="plain"` (non “20k”)
- Nel tuo React: review card senza meta + follower “+20k” (diverso da HTML).

7) **Contatti: Directions card + bottone copia indirizzo**
- In HTML non c’è il placeholder “Google Maps Embed”: c’è una **directions-card** con:
  - Link Google Maps
  - Bottone `data-copy-address` che copia indirizzo + mini toast
- Nel tuo React c’è un placeholder mappa e manca la copy-to-clipboard UX.

8) **FAB dock (floating action buttons)**
- In HTML esiste un dock fisso `.fab-dock` (WhatsApp / Chiama / Indicazioni)
- Nel tuo React/CSS non esiste.

9) **Footer avanzato + policy modal (placeholder)**
- In HTML footer non è “minimal”: ha grid colonne, social icons, legal links
- Include “Policy modal” (placeholder) con open/close
- Nel tuo React: footer minimal, niente modal.

---

## Strategia di implementazione (1:1 “da HTML a React”)
### A) Porting markup 1:1 (struttura)
1. **Aggiornare `EdenLanding.tsx`** per replicare la struttura HTML:
   - Inserire `skip-link` + `main` con `id="main-content"` e `tabIndex={-1}`
   - Aggiungere `eden-led`
   - Sostituire l’header attuale con quello dell’HTML:
     - logo `<img class="header-logo-img" src="/eden/eden-logo.jpg" ... />`
     - bottone menu mobile con `aria-expanded` e `aria-controls="header-nav"`
     - `<nav id="header-nav" class="header-nav">...</nav>`
   - Hero:
     - sostituire `<span>EDEN</span>` con `<img className="hero-logo" src="/eden/eden-hero-logo.png" ... />`
     - aggiungere wrapper `.hero-blob-wrap.parallax-layer` e `.hero-scroll-inner.parallax-layer` con `data-parallax`
   - Cucina:
     - aggiungere `.cucina-atmo-wrap`, due layer atmo, `.cucina-reveal`
     - riflettere lo stato tab anche su un attributo/prop (es. `data-mood`) per far funzionare il crossfade CSS
   - Gallery:
     - portare tutti i 16 items (stesse immagini/titoli/tag/categorie/sizeClass)
     - applicare `.reveal-stagger` a `.gallery-grid`
   - Recensioni:
     - aggiungere `.rc-meta` con stelle e badge
     - correggere contatore follower (8000 plain)
   - Contatti:
     - sostituire map placeholder con `.directions-card` e bottoni
     - link WhatsApp corretti (`wa.me/...`)
   - Aggiungere `.fab-dock` (fixed) e relativi link/azioni
   - Footer:
     - portare footer grid + social + legal links
     - aggiungere `Policy modal` placeholder markup

### B) Porting CSS 1:1 (effetti)
2. **Aggiornare `src/styles/eden.css`** importando le sezioni mancanti dall’HTML:
   - `.eden-led`
   - `.parallax-layer` + `--parallaxY`
   - Header nav responsive + stato “open” (classe tipo `.nav-open` o `.header-nav.open`) + animazioni
   - Cucina atmo (`.cucina-atmo-wrap`, crossfade mare/terra, reveal overlay)
   - `.reveal-stagger` (stagger via CSS + class `.visible` sul parent oppure class su children)
   - Review meta styles (`.rc-meta`, `.rc-stars`, `.rc-badge`)
   - Directions card (`.directions-card`, `.eden-btn`, etc.)
   - Mini toast (`.mini-toast`) per “copia indirizzo”
   - FAB dock (`.fab-dock`, `.fab-btn`)
   - Footer grid + social + legal + policy modal

> Nota: oggi `eden.css` non contiene nessuna di queste classi: verranno aggiunte mantenendo intatte le parti già presenti.

### C) Logica JS/React per gli effetti (event listeners & state)
3. **Menu mobile**
- Stato React `isNavOpen`
- Toggle su click: classi CSS (es. `nav-open` su `.header-inner` o su `body`) + `aria-expanded`

4. **Parallax scroll-driven (1:1)**
- Rimuovere/parcheggiare l’attuale mousemove transform su `heroContentRef`
- Implementare un hook `useScrollParallax()`:
  - seleziona tutti gli elementi `.parallax-layer[data-parallax]`
  - su `scroll` (con `requestAnimationFrame`) calcola `--parallaxY = scrollY * factor * -1` (stesso verso del sito)
  - applica via `el.style.setProperty("--parallaxY", `${value}px`)`
- Cleanup su unmount

5. **Reveal stagger**
- Estendere `useRevealOnScroll` o creare `useRevealStaggerOnScroll()`:
  - quando il container con `.reveal-stagger` diventa visibile:
    - aggiunge `visible` al container
    - in alternativa (più 1:1) aggiunge `visible` ai children con delay `index * 90/100ms`
- Riutilizzare `IntersectionObserver` già presente

6. **Cucina mood**
- Quando cambia tab, aggiornare attributo (es. `data-mood="mare|terra"`) sulla sezione cucina
- CSS gestisce opacità/blur tra `.cucina-atmo--mare` e `--terra`

7. **Lightbox**
- Già presente: aggiungere (per 1:1) supporto:
  - `Escape` per chiudere
  - blocco scroll background quando open (`body` class)

8. **Copy address + mini toast**
- Implementare `handleCopyAddress()` con `navigator.clipboard.writeText(...)`
- Mostrare mini toast (state `copyToastVisible`) per ~1.5s **oppure** usare `toast()` già integrato, ma se vuoi 1:1 visivo useremo `.mini-toast`.

9. **Policy modal**
- Stato `policyOpen`
- Open via click su link “Privacy/Cookie/Policy” nel footer
- Close via backdrop click + `Escape`
- Trap focus (minimo) e restore focus al trigger (per accessibilità)

10. **Counters**
- Adeguare follower a `8000` plain con prefisso `+` come in HTML (niente `k`)
- Mantenere decimali per 4.5/4.9 con virgola (già ok)

---

## File coinvolti (modifiche previste)
- `src/components/eden/EdenLanding.tsx`
  - header/nav/menu
  - hero logo + parallax scroll
  - cucina atmo DOM
  - gallery items 16 + reveal-stagger
  - review meta + counters fix
  - contatti directions card + copy
  - fab dock
  - footer grid + policy modal
  - gestione Escape, body scroll lock, aria, cleanup listeners
- `src/styles/eden.css`
  - aggiunta blocchi CSS mancanti per tutti gli effetti sopra

---

## Criteri di accettazione (verifica 1:1)
1. Header: su mobile il pulsante “Menu” apre/chiude la nav con animazione e aria aggiornati
2. Hero: logo immagine grande, parallax su scroll identico (blob/content/scroll hint)
3. LED overlay visibile come in GitHub
4. Cucina: cambio Mare/Terra cambia anche l’atmosfera di fondo con crossfade
5. Gallery: 16 immagini, filtri funzionanti, reveal stagger e lightbox come in HTML
6. Recensioni: stelle + “Cliente verificato” presenti; counter follower arriva a +8000
7. Contatti: directions card, link Maps, bottone copia indirizzo con feedback (mini toast)
8. FAB dock: bottoni flottanti WhatsApp/Call/Directions presenti e cliccabili
9. Footer: grid + social + legal; policy modal apre/chiude correttamente (click backdrop + ESC)

---

## Chiarimenti minimi (solo per evitare ambiguità)
Dato che chiedi “tutti gli effetti 1:1 come su GitHub”, procederò assumendo come riferimento **`public/eden/nuovo_1-2.html`** (quello contiene FAB dock, policy modal, directions card, ecc.).
Se tu intendevi un *altro* file/branch/pagina “altra parte del link”, dimmi quale path preciso nel repo (es. `public/eden/qualcosa.html`) così lo uso come sorgente di verità.
