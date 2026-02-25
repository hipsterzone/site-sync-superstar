
## Obiettivo
Rendere cliccabili i due “tastini” nell’Hero:
- **“Adelfia · Puglia”** → porta alla pagina **LOCANDA EDEN**
- **“Food · Wine · Eventi”** → porta alla pagina **MASSERIA PETRULLO**

Vincoli richiesti:
- **Testo identico** sui tastini (non cambiamo le scritte).
- Trasformarli in elementi cliccabili (stile “pill button”).
- **Cambiare i colori**:
  - **LOCANDA**: “color biscotto” + **gradiente verde** coerente col sito.
  - **MASSERIA PETRULLO**: **bianco** + gradiente **verde erba** con **un po’ di giallo**.
- Le due pagine “vere” le faremo più tardi: per ora creo **pagine placeholder** minime così i link funzionano.

---

## Esplorazione (stato attuale)
- I due tastini sono in `src/components/eden/EdenLanding.tsx`:
  ```tsx
  <div className="hero-badge-row">
    <div className="hero-pill">Adelfia · Puglia</div>
    <div className="hero-pill">Food · Wine · Eventi</div>
  </div>
  ```
- Router attuale in `src/App.tsx`:
  - Route `/` → `Index`
  - Catch-all `*` → `NotFound`
- Stile pill attuale in `src/styles/eden.css` (`.hero-pill`).

---

## Chiarimenti (assunzioni operative, senza bloccarti)
Se non mi dici diversamente:
- I link saranno in **stessa tab** (normale navigazione interna).
- Gli URL saranno “puliti” e stabili:
  - `/locanda-eden`
  - `/masseria-petrullo`

---

## Design / Approccio
1) **Convertire** i due `<div className="hero-pill">` in link interni React Router:
   - uso `Link` oppure il tuo wrapper `NavLink` (già presente in repo) per navigazione SPA senza refresh.
2) **Aggiungere due nuove route** in `App.tsx` per non finire su NotFound.
3) **Creare due nuove pagine placeholder** (minime, senza definire ancora il layout finale) con titolo:
   - “LOCANDA EDEN”
   - “MASSERIA PETRULLO”
4) **Aggiornare CSS**:
   - mantenere lo stile “pill” esistente (padding, border-radius, blur, shadow, typography)
   - cambiare solo **colori/sfondi** con due varianti dedicate, senza stravolgere dimensioni e spacing.

---

## Piano di modifica (step-by-step)

### 1) Routing: aggiungere le route nuove
**File:** `src/App.tsx`
- Aggiungere:
  - `<Route path="/locanda-eden" element={<LocandaEden />} />`
  - `<Route path="/masseria-petrullo" element={<MasseriaPetrullo />} />`
- Importare i due componenti pagina.

### 2) Creare le due pagine placeholder (minime)
**Nuovi file (in `src/pages/`):**
- `src/pages/LocandaEden.tsx`
- `src/pages/MasseriaPetrullo.tsx`

Contenuto:
- layout essenziale coerente con EDEN (possiamo anche riusare `eden-theme` o una semplice sezione con sfondo scuro).
- heading grande + testo “Pagina in arrivo” (placeholder), così:
  - il link funziona
  - non stiamo “decidendo” ancora il design finale (come richiesto)

### 3) Rendere cliccabili i due tastini nell’Hero
**File:** `src/components/eden/EdenLanding.tsx`
- Sostituire i due `<div className="hero-pill">` con:
  - `<Link to="/locanda-eden" className="hero-pill hero-pill--locanda">Adelfia · Puglia</Link>`
  - `<Link to="/masseria-petrullo" className="hero-pill hero-pill--masseria">Food · Wine · Eventi</Link>`
- Nota: testo identico, solo wrapper cliccabile + classi colore.

### 4) CSS: nuove varianti colore (senza cambiare dimensioni)
**File:** `src/styles/eden.css`
- Lasciare invariata `.hero-pill` per sizing/shape.
- Aggiungere:
  - `.hero-pill--locanda`:
    - base “biscotto” (caldo, vicino a `--eden-gold` / pearl warm)
    - overlay gradient verde “del sito” (emerald) leggero
  - `.hero-pill--masseria`:
    - base più bianca/pearl
    - gradient verde erba (più saturo) + accento giallo tenue
- Aggiungere anche stati `:hover` / `:focus-visible` (accessibilità) senza cambiare dimensioni:
  - leggera variazione di luminosità
  - ring/outline coerente con `--eden-emerald`

---

## Test end-to-end (obbligatorio)
1) Vai su `/` e clicca:
   - “Adelfia · Puglia” → deve andare su `/locanda-eden`
   - “Food · Wine · Eventi” → deve andare su `/masseria-petrullo`
2) Verifica che i tastini:
   - siano chiaramente cliccabili (cursor, hover)
   - mantengano lo stesso testo
   - abbiano i colori richiesti (LOCANDA biscotto+verde, MASSERIA bianco+verde erba+un po’ giallo)
3) Prova refresh diretto su:
   - `/locanda-eden`
   - `/masseria-petrullo`
   Deve caricare la pagina placeholder (non NotFound).
4) Test mobile: i due pill restano ben leggibili e tappabili.

---

## File coinvolti
- **EDIT** `src/App.tsx`
- **EDIT** `src/components/eden/EdenLanding.tsx`
- **EDIT** `src/styles/eden.css`
- **NEW** `src/pages/LocandaEden.tsx`
- **NEW** `src/pages/MasseriaPetrullo.tsx`
