
## Obiettivo (questa richiesta)
1) Rendere **lo sfondo di tutto il sito (compreso l’hero)** chiaramente “vivo”: animazione **leggera ma continua**.
2) Aggiungere effetti che ricordano **luci LED a schiera**, con tonalità **tra giallo e bianco**, senza coprire i contenuti.

Nota: nella codebase EDEN hai già 3 layer “background” globali (tutti `position: fixed`):
- `#eden-hero-canvas` (foglie + glow disegnati via canvas, e un background CSS statico)
- `.hero-aurora` (drift animato)
- `.eden-led` (glow giallo/bianco animato, ma oggi ha `z-index: -1` e può risultare quasi invisibile)

Quindi il lavoro sarà soprattutto: **renderli più visibili + aggiungere l’effetto “schiera LED”**.

---

## Cosa cambierò (design)
### A) Animazione “sfondo” più percepibile ma elegante
**File:** `src/styles/eden.css`

1) **Animare anche il background CSS del canvas**
- Oggi il canvas ha un `background:` con 3 radial gradient + night, ma è statico.
- Aggiungo:
  - `background-size` più grande (es. 160%–220%)
  - una keyframe `edenBgShift` che muove lentamente `background-position` (40–70s) con easing morbido
- Risultato: anche quando foglie/glow sono discreti, lo “sfondo” respira.

2) **Rendere `.eden-led` davvero visibile sopra lo sfondo ma sotto i contenuti**
- Attualmente `.eden-led` ha `z-index: -1`: su alcuni browser/stacking context rischia di stare “sotto” il canvas o sotto il contesto della pagina e sparire.
- La porto nello “strato background” corretto:
  - `.page` resta sopra (già `z-index: 1`)
  - canvas/aurora/led rimangono dietro ai contenuti ma visibili
- Mantengo `pointer-events: none` e blend `screen` per non “sporcare” la UI.

3) **Riduzione motion**
- Estendo la regola `@media (prefers-reduced-motion: reduce)` per disattivare anche le nuove animazioni (bg shift + led strips).

---

### B) Effetto “LED a schiera” (giallo/bianco) – nuovo layer, leggero
**File:** `src/styles/eden.css`

Obiettivo: un effetto che ricorda una **barra di LED** (micro punti/segmenti ripetuti), con:
- luce calda (giallo/bianco)
- lieve movimento (scorrimento quasi impercettibile)
- un minimo di “flicker” controllato (molto basso, per non sembrare discoteca)

Implementazione proposta (senza cambiare JSX):
1) Riutilizzo il div già esistente `.eden-led`
2) Creo le “schiere” usando pseudo-elementi:
- `.eden-led::before` = **strisce LED orizzontali** (ripetizione) + glow
- `.eden-led::after` = **accenti LED diagonali/soft** per dare profondità (sempre caldo)

Tecnica CSS:
- `repeating-linear-gradient(...)` per simulare i segmenti
- `filter: blur(...)` + `opacity` bassa (0.08–0.18)
- `mix-blend-mode: screen` (coerente con l’effetto luce)
- animazioni:
  - `edenLedBars` (sposta lentamente `background-position-x` tipo 18–30s)
  - `edenLedFlicker` (micro variazione opacità 6–11s, ampiezza minima)

---

## Eventuale (solo se serve) piccola modifica JSX
Probabilmente **non serve**, perché `.eden-led` esiste già.
Se vogliamo un controllo più fine (top/bottom separati), potrei aggiungere 1–2 div:
- `.eden-led-bars-top`
- `.eden-led-bars-bottom`
ma prima proverò con `::before/::after` su `.eden-led` per non toccare la struttura.

File (solo se necessario): `src/components/eden/EdenLanding.tsx`

---

## Checklist qualità (per evitare “copre tutto” o “non si vede”)
1) **Leggibilità**: testo in hero + sezioni resta leggibile (nessun “velo” giallo).
2) **Coerenza**: LED presenti anche quando scrolli (layer `fixed`).
3) **Prestazioni**: animazioni solo su proprietà “cheap” (opacity / background-position / transform), niente repaint pesanti.
4) **Accessibilità**: `prefers-reduced-motion` disattiva le animazioni nuove.

---

## Test end-to-end (obbligatorio)
1) Apri `/` e fai scroll fino in fondo: lo sfondo resta **animato** per tutto il sito.
2) In hero: si vedono chiaramente (ma soft) le **luci LED** giallo/bianco “a schiera”.
3) Verifica mobile: non deve diventare troppo brillante (controllerò opacità in media query se necessario).
4) Attiva “Reduce motion” (se puoi) e verifica che le animazioni si fermino.

---

## File coinvolti
- `src/styles/eden.css` (principale)
- `src/components/eden/EdenLanding.tsx` (solo se serve aggiungere layer separati; al momento penso di no)
