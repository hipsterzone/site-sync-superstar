
## Obiettivo
Ripristinare **visibilità reale** (in app React) di:
- **sfondo 1:1** (radial gradients + night) come `public/eden/nuovo_1-2.html`
- **foglie che cadono** (sprite su canvas da `leaf-source.png`) come nell’HTML

In questo momento il tuo codice **è molto vicino/identico** all’HTML, quindi se “non si vede”, il problema è quasi certamente **di stacking/stacking-context** (z-index negativo che finisce dietro il background del body/app) oppure di **caricamento sprite** non verificato.

---

## 1) Verifica tecnica (prima di toccare look & feel)
### 1.1 Controllo asset
- Confermato: `public/eden/leaf-source.png` esiste nel progetto.
- Implementerò un controllo runtime: se l’immagine non carica o `leafReady` resta `false`, lo segnalo in modo chiaro (console warning + piccolo badge debug opzionale).

### 1.2 Controllo stacking (causa #1 quando “manca tutto”)
Nel tuo CSS il canvas è:
- `position: fixed`
- `z-index: -3`

Questo **in molte app React** può finire “dietro” il background del `body/#root` se manca uno stacking context “contenitore” stabile (nel file HTML statico spesso funziona, dentro un’app con altri CSS può sparire).

**Fix 1: creare uno stacking context dedicato per EDEN**:
- `.eden-theme { position: relative; z-index: 0; }` (crea stacking context)
- `.page { position: relative; z-index: 1; }` (contenuto sopra)
- mantenere canvas/aurora/led dietro ma *dentro* lo stacking context EDEN:
  - `#eden-hero-canvas { z-index: -3 }`
  - `.hero-aurora { z-index: -2 }`
  - `.eden-led { z-index: -1 }`

Questo preserva la logica 1:1 dell’HTML, ma evita che il canvas finisca “sotto al mondo”.

---

## 2) Foglie “che cadono”: rendere diagnosticabile e impossibile da “sparire”
Il codice foglie in `useHeroCanvas()` è già 1:1 con `nuovo_1-2.html` (build sprite, tint, opacity, animate loop). Se non le vedi, voglio eliminare le due possibilità più comuni:

### 2.1 Se il canvas non è visibile
- Risolto dallo Step 1.2 (stacking context).

### 2.2 Se `leafReady` non diventa mai true
Aggiungerò:
- un `console.warn` se dopo X secondi `leafReady === false`
- log dell’esito di:
  - `leafImg.onload` (ok)
  - `leafImg.onerror` (errore)
- (opzionale) un piccolo indicatore invisibile in produzione ma attivabile con querystring tipo `?edenDebug=1` per mostrarti:
  - “Leaf sprite: loaded/failed”
  - “Canvas size: w×h”
  - “Leaves count: N”

Così non si va più “a sensazione”: o lo sprite carica e le foglie si disegnano, oppure lo vediamo subito.

---

## 3) Sfondo 1:1: bloccare qualunque override “app-level”
Lo sfondo nel tuo `eden.css` è già corretto e coerente con l’HTML:
- `#eden-hero-canvas { background: radial... + hsl(var(--eden-night)) }`
- tokens `--eden-bg-nw/ne/sw` corrispondono ai colori `#202b52 / #133227 / #411f22`

Per evitare che qualunque CSS globale (Tailwind base / tema) lo alteri, farò:
- consolidamento delle regole “EDEN only” (tutte sotto `body.eden-body` / `.eden-theme`)
- controllo che nessun’altra regola assegni `background` a `canvas` o sovrascriva `#eden-hero-canvas`

---

## 4) Test end-to-end (criteri “si vede / non si vede”)
Dopo le modifiche, verifichiamo in preview:
1) **Apri “/”** e controlla subito:
   - background: macchie colore negli angoli + nero pieno (non grigio/flat)
2) **Foglie**:
   - devono vedersi chiaramente in movimento continuo (caduta + sway)
   - muovendo il mouse sul hero devono “deviare” (wind)
3) **Console**:
   - nessun errore di caricamento `/eden/leaf-source.png`
   - se c’è errore, deve apparire il warning “Leaf sprite failed to load” (diagnosi immediata)

---

## File che leggerò/aggiornerò in implementazione
- `src/styles/eden.css`
  - aggiunta stacking context su `.eden-theme`
  - z-index/position “a prova di app” mantenendo la gerarchia 1:1
- `src/components/eden/EdenLanding.tsx`
  - aggiunta diagnostica minima su caricamento leaf sprite (warn/log + debug opzionale)

---

## Definition of Done (accettazione)
- Sfondo identico al repo **visibile sempre**
- Foglie sprite **visibili e animate** (non “forse”)
- Se qualcosa fallisce (asset, canvas size, stacking), esiste un segnale chiaro che lo indica (non più tentativi)
