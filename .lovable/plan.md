
## Obiettivo (pagina /masseria-petrullo)
Creare per **Masseria Petrullo** la “stessa cosa” come impostazione della Locanda (coerenza EDEN), ma con contenuti più snelli:
1) **Tasto “← Torna a EDEN”** che porta sempre a `/`
2) **Hero bella** con:
   - **logo EDEN** (lo stesso della home: `/eden/eden-hero-logo.png`)
   - scritta sotto: **MASSERIA PETRULLO** (confermato)
   - CTA: **WhatsApp** + **Vedi galleria** (confermato)
3) **Galleria “un po’ disordinata”** stile **Polaroid wall** (confermato)
4) Sotto la galleria un testo secco:
   - “Solo per eventi privati. Minimo 50 persone.”

Vincolo: tutto deve restare **inerente al sito principale** (font, colori, atmosfera EDEN).

---

## Esplorazione (stato attuale)
- `src/pages/MasseriaPetrullo.tsx` è ancora placeholder (titolo + “pagina in arrivo”).
- `src/pages/LocandaEden.tsx` ha già:
  - header pagina con back a `/`
  - hero con aurora e CTA
  - galleria con classi `.gallery-grid` / `.gallery-item`
- `src/styles/eden.css` contiene già:
  - palette e font EDEN
  - stili galleria (masonry)
  - stili “locanda-*” (header + hero + CTA) riutilizzabili come pattern.

---

## Design (come la facciamo “EDEN” ma diversa dalla Locanda)
### Header pagina (coerente)
- Replico lo **stesso pattern** della Locanda:
  - header fisso con pill “← Torna a EDEN”
  - titolo a destra “Masseria Petrullo” (solo desktop; su mobile può sparire come già fatto per Locanda)

### Hero Masseria (bella ma “modificabile”)
- Creo una hero dedicata `masseria-hero` con:
  - aurora/gradiente coerenti (stesso mood EDEN, ma con una variante più “campagna/verde-oro” molto soft)
  - logo `/eden/eden-hero-logo.png`
  - titolo grande serif: **MASSERIA PETRULLO**
  - sottotitolo breve (testo realistico ma neutro, facile da cambiare)
  - CTA row:
    - **Richiedi info su WhatsApp** (messaggio precompilato per eventi privati, minimo 50 persone)
    - **Vedi galleria** (ancora a `#gallery`)

### Galleria “disordinata” = Polaroid wall
- Non uso la galleria “masonry pulita” della Locanda: qui la faccio volutamente più “viva”.
- Implementazione:
  - grid responsiva (2–4 colonne a seconda del viewport)
  - ogni card stile “polaroid”:
    - bordo chiaro/perla, background “paper”
    - ombra più presente + leggero highlight
    - **rotazioni/offset leggeri** alternati (tramite classi o CSS variables per item)
  - Mantengo overlay/titoli opzionali, ma più discreti (focus sulle foto)

### Testo finale (vincolo eventi)
- Sotto la galleria, dentro un contenitore `eden-shell`, metto una riga ben leggibile:
  - “Solo per eventi privati. Minimo 50 persone.”
- Stile: uppercase soft / letter-spacing, colore `--eden-text-soft`, centrato.

---

## Piano di implementazione (step-by-step)

### 1) Aggiornare `src/pages/MasseriaPetrullo.tsx`
Sostituire il placeholder con una pagina completa in stile EDEN:

**A. Hook globali EDEN**
- Tenere l’attuale `useEffect` che aggiunge/rimuove `eden-html` e `eden-body`.

**B. WhatsApp URL (precompilato)**
- Creare `waUrl` con `useMemo`, come in Locanda, usando lo stesso numero:
  - `https://wa.me/393497152524?text=${encodeURIComponent(msg)}`
- Messaggio consigliato (realistico e coerente con richiesta):
  ```text
  Ciao EDEN, vorrei informazioni per un EVENTO PRIVATO presso MASSERIA PETRULLO.
  
  Data:
  Orario:
  Numero ospiti (min. 50):
  Nome:
  Note:
  ```

**C. Layout pagina**
- `<main className="page masseria-page">`

**D. Header**
- Copiare il pattern Locanda:
  - `<header className="masseria-header"> ... <Link to="/" className="masseria-back">...</Link> ... </header>`

**E. Hero**
- Sezione:
  - `<section className="masseria-hero" aria-labelledby="masseria-hero-title">`
  - aurora `<div className="masseria-hero-aurora" aria-hidden="true" />`
  - contenuto:
    - `<img className="hero-logo" src="/eden/eden-hero-logo.png" ... />`
    - `<h1 className="masseria-title">MASSERIA PETRULLO</h1>`
    - `<p className="masseria-desc">...</p>`
    - CTA row:
      - `<a className="masseria-cta" href={waUrl} target="_blank" rel="noreferrer">Richiedi info su WhatsApp</a>`
      - `<a className="masseria-cta masseria-cta--ghost" href="#gallery">Vedi galleria</a>`

**F. Galleria polaroid**
- Sezione:
  - `<section id="gallery" className="masseria-gallery" aria-labelledby="masseria-gallery-title">`
- Dataset immagini “esempio” con 10–14 items (picsum seeds dedicati “eden-masseria-*”).
- Render:
  - `<div className="masseria-polaroid-grid">`
  - Ogni item:
    - wrapper con classi `masseria-polaroid` + una classe variante (es. `tilt-1..tilt-6`) oppure inline CSS vars (`--r`, `--x`, `--y`)
    - `<img ... />`
    - caption sotto (opzionale) in stile polaroid (testo piccolo, serif/sans mix)

**G. Testo vincolo eventi**
- Subito sotto la galleria:
  - `<section className="masseria-note">`
  - dentro `eden-shell`:
    - `<p className="masseria-note-text">Solo per eventi privati. Minimo 50 persone.</p>`

---

### 2) Aggiornare `src/styles/eden.css`
Aggiungere un blocco dedicato “MASSERIA” senza toccare Locanda/Home:

**Header**
- `.masseria-header`, `.masseria-header-inner`, `.masseria-back`, `.masseria-header-title`
  - copiare il look&feel di `.locanda-header` con piccole variazioni (accento più gold/emerald soft)

**Hero**
- `.masseria-hero`, `.masseria-hero-aurora`, `.masseria-hero-inner`, `.masseria-title`, `.masseria-desc`
- CTA
  - `.masseria-cta`, `.masseria-cta--ghost` (stessa ergonomia della locanda-cta, ma coerente con hero Masseria)

**Polaroid wall**
- `.masseria-polaroid-grid`
  - grid responsiva (gap più ampio, feel “gallery wall”)
- `.masseria-polaroid`
  - background perla/paper
  - border sottile
  - shadow più fotografica (drop shadow + glow leggero)
  - padding “cornice” (effetto polaroid)
- Rotazioni/offset:
  - classi tipo `.tilt-1 ... .tilt-6` con `transform: rotate(...) translate(...)`
  - su mobile ridurre tilt/offset per non rompere la leggibilità (media query)
- Hover:
  - al hover aumentare leggermente scale e riportare rotazione verso 0 (opzionale) per dare interazione premium

**Nota eventi**
- `.masseria-note`, `.masseria-note-text`
  - centrato, letter-spacing, colore soft, max-width controllato

---

## Verifiche end-to-end (obbligatorie)
1) Vai su `/masseria-petrullo`
2) Clic “← Torna a EDEN” ⇒ deve andare sempre a `/`
3) Hero:
   - logo EDEN visibile
   - titolo “MASSERIA PETRULLO”
   - bottoni: WhatsApp apre chat con messaggio precompilato; “Vedi galleria” scrolla a `#gallery`
4) Galleria:
   - effetto “polaroid wall” realmente disordinato ma elegante
   - su mobile: niente sovrapposizioni/overflow, rotazioni più leggere
5) Testo finale:
   - presente e leggibile: “Solo per eventi privati. Minimo 50 persone.”

---

## File coinvolti
- **EDIT** `src/pages/MasseriaPetrullo.tsx`
- **EDIT** `src/styles/eden.css`

---

## Dettagli tecnici (trasparenza)
- Routing già esistente in `src/App.tsx` (`/masseria-petrullo`)
- Logo hero: path pubblico già usato e “sicuro” → `/eden/eden-hero-logo.png`
- WhatsApp: `wa.me/393497152524` + `encodeURIComponent` per il testo
- “Polaroid wall”: implementata con CSS grid + transform per-item (classi o CSS variables) per ottenere disordine controllato senza JS complesso.
