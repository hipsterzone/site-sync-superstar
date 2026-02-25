
## Obiettivo (modifica richiesta)
1) Cambiare **le scritte** sui due tastini dell’hero in:
- **LOCANDA EDEN**
- **MASSERIA PETRULLO**

2) Rendere i **colori più accesi** (più saturi/visibili).

3) Sistemare il **colore del testo** (e, se serve, micro-ombra) in modo che sia **abbinato** e **non dia fastidio** rispetto allo sfondo scelto (leggibilità + armonia).

> Vincolo: non cambiamo struttura/layout del blocco hero; interveniamo solo su **testi** e **color palette** dei due pill.

---

## Esplorazione (stato attuale)
- In `src/components/eden/EdenLanding.tsx` i due pill sono già link cliccabili, ma con testo:
  - “Adelfia · Puglia”
  - “Food · Wine · Eventi”
- In `src/styles/eden.css` esistono già:
  - `.hero-pill` (stile base)
  - `.hero-pill--locanda` (biscotto + verde, ma attualmente soft)
  - `.hero-pill--masseria` (bianco + verde/giallo, ma attualmente soft)

---

## Design (come li rendo più “accesi” senza risultare aggressivi)
### Testo
- Sostituisco **solo** il contenuto testuale dei due `<Link>`:
  - `LOCANDA EDEN`
  - `MASSERIA PETRULLO`

### Colori (più accesi + testo abbinato)
Intervengo **solo** sulle classi variante:
- `.hero-pill--locanda`
  - Background più “biscotto” (più presente) + gradiente verde EDEN più saturo (alpha più alta).
  - Testo: **scuro caldo** (marrone/ebano) per non “vibrare” su fondi chiari; opzionale `text-shadow` molto leggero per definizione.
- `.hero-pill--masseria`
  - Base più bianca/perla + gradiente **verde erba** più saturo + accento **giallo** più evidente (ma non neon).
  - Testo: **scuro profondo** (eden-night) per contrasto pulito; `text-shadow` minimale se serve.

### Accessibilità (focus/hover)
- Mantengo gli effetti esistenti (hover lift) e aggiusto:
  - `border-color` un filo più coerente col nuovo schema
  - `focus-visible` invariato (già buono)

---

## Piano di implementazione (step-by-step)

### 1) Aggiornare le scritte dei tastini
**File:** `src/components/eden/EdenLanding.tsx`
- Individuare il blocco:
  - `<Link to="/locanda-eden" className="hero-pill hero-pill--locanda">...</Link>`
  - `<Link to="/masseria-petrullo" className="hero-pill hero-pill--masseria">...</Link>`
- Sostituire i testi con:
  - `LOCANDA EDEN`
  - `MASSERIA PETRULLO`
- Nessun’altra modifica (stesse classi, stessi link, stesso layout).

### 2) Rendere i colori più accesi e sistemare il colore del testo
**File:** `src/styles/eden.css`
- Aggiornare **solo** questi selettori (già presenti):
  - `.hero-pill--locanda`
  - `.hero-pill--masseria`
- Modifiche previste:
  - aumentare l’intensità dei gradient (alpha più alta / stop più “decisi”)
  - ritoccare `border-color` per accompagnare meglio il nuovo background
  - impostare `color` del testo per massima armonia/leggibilità (scuro caldo su locanda, scuro profondo su masseria)
  - (se necessario) aggiungere `text-shadow` molto sottile per rendere il testo più “fermo” sul gradiente, senza cambiare dimensioni o spessori.

> Nota: non tocco `.hero-pill` base (padding, radius, font-size, letter-spacing, ecc.) quindi non cambiano dimensioni/altezza dei pill.

---

## Test end-to-end (obbligatorio)
1) Su `/` verifica che i pill mostrino **esattamente**:
   - “LOCANDA EDEN”
   - “MASSERIA PETRULLO”
2) Clic:
   - LOCANDA EDEN → `/locanda-eden`
   - MASSERIA PETRULLO → `/masseria-petrullo`
3) Controllo visivo:
   - colori più accesi rispetto a prima
   - testo non “vibra” col fondo (leggibile, non fastidioso)
4) Mobile:
   - leggibilità ok e tap target invariato.

---

## File coinvolti
- **EDIT** `src/components/eden/EdenLanding.tsx` (solo testo dei due link)
- **EDIT** `src/styles/eden.css` (solo regole colore per `.hero-pill--locanda` e `.hero-pill--masseria`)
