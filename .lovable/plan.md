
## Obiettivo (1:1 col repo)
Ripristinare **sfondo scuro** + **foglie animate del repo (sprite su canvas)** + **dimensione logo hero 1:1**, eliminando gli “esperimenti” non presenti nell’HTML sorgente.

Hai confermato:
- Sfondo: **1:1 fisso (HTML)**
- Foglie: **Sprite canvas (HTML)**
- Logo hero: **1:1 (HTML)**

---

## Diagnosi rapida (perché ora “manca tutto”)
1) **Foglie**: nel repo non sono “due PNG in overlay”, ma un’animazione **su canvas** che:
   - pre-carica `/eden/leaf-source.png`
   - rimuove lo sfondo a scacchi (key-out per bassa saturazione)
   - genera **sprite tintati** e li disegna per frame (`drawImage`) con opacità e dimensioni precise.
   
   Nel nostro `useHeroCanvas()` invece stiamo disegnando foglie vettoriali (bezier) + in più abbiamo aggiunto un layer DOM `.eden-leaves` con `<img>`: **non è 1:1**.

2) **Sfondo**: nell’HTML lo sfondo “vero” è il **background del canvas** `#eden-hero-canvas` con radial gradients hardcoded:
   - `#202b52`, `#133227`, `#411f22`, `#02040a`
   
   In `eden.css` oggi lo abbiamo reso “mood-driven” con variabili (`--eden-bg-nw/ne/sw`), quindi **non combacia** e può risultare “meno scuro / diverso”.

3) **Logo hero**: nell’HTML `.hero-logo` usa una **clamp specifica** + una clamp diversa in mobile; nel nostro `eden.css` è diventato `width: min(720px, 78vw)` → **scala in modo diverso** e può risultare “troppo grande”.

---

## Cosa implementerò (modifiche precise, 1:1)
### 1) Portare `useHeroCanvas()` 1:1 (sprite canvas + preload)
**File:** `src/components/eden/EdenLanding.tsx`

- Sostituire l’attuale `useHeroCanvas()` (foglie bezier) con la versione del repo:
  - variabili: `leafSprites`, `leafAspect`, `leafReady`
  - costanti: `LEAF_OPACITY = 0.42`, `LEAF_TINT_HUES = [115,123,131,139,147]`
  - funzioni: `clamp`, `buildLeafSprites(img)`, `drawLeaf(l)` che usa:
    - `baseH = 19.5` (come commento HTML: “Target requested: baseH = 19.50px”)
    - selezione sprite in base a `l.hue`
    - `ctx.globalAlpha = LEAF_OPACITY`
  - preload: `const leafImg = new Image(); leafImg.src = '/eden/leaf-source.png'`
    - `onload`: `buildLeafSprites(...)`, `resizeCanvas()`, `requestAnimationFrame(animate)`
    - `onerror`: fallback `resizeCanvas()` + `requestAnimationFrame(animate)` (le foglie non si vedranno se manca l’immagine, ma il resto sì)
- Tenere glows + wind-on-mouse identici al repo.
- Assicurare cleanup completo (removeEventListener, cancelAnimationFrame) per evitare leak.

**Risultato atteso:** foglie animate identiche (densità, dimensione, opacità, drift, wind su mouse) come nel repo.

---

### 2) Rimuovere il layer DOM “eden-leaves” (non presente nell’HTML)
**File:** `src/components/eden/EdenLanding.tsx`

- Eliminare questo blocco:
  ```tsx
  <div className="eden-leaves" ...>
    <img ... src="/eden/leaf.png" />
    <img ... src="/eden/leaf-source.png" />
  </div>
  ```
Perché nel repo le foglie sono **solo** canvas sprites, non overlay DOM.

**Risultato atteso:** niente “foglie finte” sovrapposte; tutto torna canvas-driven.

---

### 3) Ripristinare lo sfondo del canvas 1:1 (fisso, scurissimo)
**File:** `src/styles/eden.css`

- Aggiornare `#eden-hero-canvas { background: ... }` per matchare l’HTML:
  - usare HSL equivalenti ai 4 colori (convertiti) oppure mantenere i colori tramite `color-mix`/hex (ma in questo progetto preferiamo HSL).
  - mantenere esattamente la stessa struttura:
    - radial at `0 0`, `100% 0`, `0 100%` + base night.
- Rimuovere/neutralizzare le variabili “mood globale” (`--eden-bg-nw/ne/sw`) e le regole:
  - `.eden-theme[data-mood="mare"] { ... }`
  - `.eden-theme[data-mood="terra"] { ... }`
  
  Perché hai richiesto **sfondo 1:1 fisso** come l’HTML.

**Risultato atteso:** background identico al repo (stesso “nero” + stesse macchie colore in angoli).

---

### 4) Ripristinare dimensione logo hero 1:1 (desktop + mobile)
**File:** `src/styles/eden.css`

- Allineare `.hero-logo` a quanto c’è nell’HTML:
  - desktop: `width: clamp(320px, 40vw, 760px); max-width: 92vw;`
  - mobile (`@media (max-width:700px)`): `width: clamp(240px, 72vw, 440px);`
- Verificare anche eventuali padding/margini in `.hero-content` / `.hero-title` per evitare scaling percepito diverso.

**Risultato atteso:** logo “né troppo grande né troppo piccolo”, esattamente come repo.

---

### 5) Verifica “full-bleed” e stacking (perché se lo stacking è sbagliato sembra “manca tutto”)
**File:** `src/styles/eden.css`

- Confermare questi invarianti (già presenti ma li verificherò con ordine e specificità CSS):
  - `body.eden-body { background: #02040a; overflow-x:hidden; }`
  - `body.eden-body #root { max-width:none; padding:0; margin:0; }`
  - z-index background layers:
    - canvas: `z-index:-3`
    - aurora: `z-index:-2`
    - led: `z-index:-1`
    - contenuto `.page`: sopra
- Rimuovere eventuali regole duplicate/obsolete di `.eden-leaves` una volta eliminato il markup.

**Risultato atteso:** canvas/aurora/led visibili sempre e non “coperti” da altri layer.

---

## Test (obbligatorio, end-to-end)
1) Apri `/` e verifica:
   - sfondo scuro identico (angoli colorati + nero pieno)
   - foglie animate visibili (non statiche), con drift continuo
   - muovi il mouse sul hero: le foglie devono reagire (wind) come nel repo
2) Resize mobile (<700px):
   - logo hero ridimensionato come repo (clamp mobile)
   - nessun taglio del canvas, nessun “bianco” dietro
3) Scroll pagina:
   - il canvas resta fixed dietro (non scompare dopo hero)
   - performance ok (nessun lag evidente)
4) Console:
   - nessun errore su caricamento `/eden/leaf-source.png` (se 404, foglie non compariranno: lo segnalo subito)

---

## File che toccherò
- `src/components/eden/EdenLanding.tsx`
  - `useHeroCanvas()` 1:1 con sprite + preload
  - rimozione `.eden-leaves` DOM
- `src/styles/eden.css`
  - background canvas 1:1 fisso
  - `.hero-logo` clamp 1:1 (desktop + mobile)
  - pulizia CSS `.eden-leaves` e rimozione mood globale non presente nel repo

---

## Criteri di accettazione (non negoziabili)
- Sfondo: **stesso “nero”** e stessi radial come `public/eden/nuovo_1-2.html`
- Foglie: **animate su canvas con sprite** (non overlay immagini)
- Logo hero: **stessa dimensione** dell’HTML (clamp desktop + clamp mobile)
- Nessun effetto “mood globale” sul background (sfondo fisso come repo)
