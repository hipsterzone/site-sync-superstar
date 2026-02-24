
## Diagnosi (perché “manca tutto”)
Dai file attuali vedo che **gli effetti ci sono nel codice** (canvas foglie/glow, aurora, LED overlay, parallax, cucina atmo, gallery, form eventi, ecc.) e che gli asset base (`public/eden/*`) esistono.

Quindi quando in preview “mancano foglie, cambio colore, sezione modulo sotto, sfondo”, le cause più probabili sono:

1) **Il file HTML di riferimento non è presente nel progetto**
- `public/eden/nuovo_1-2.html` **non esiste** (tool: “File not found”).
- Senza quella “source of truth” non posso “leggere l’altra parte dell’HTML” e verificare cosa esattamente manca (markup + classi + assets + immagini di sfondo).

2) **Gli stili globali del template Vite/Tailwind stanno interferendo**
- Anche se `eden.css` imposta `body.eden-body { background: ... }`, potrebbero esserci regole globali che:
  - limitano la larghezza (tipo `#root { max-width/padding }` del template),
  - applicano background/overflow che “uccidono” il full-bleed,
  - mettono z-index/stacking che copre canvas e overlay.

3) **Il riferimento “foglie” nel tuo feedback sembra riferirsi a PNG decorativi (leaf.png / leaf-source.png), ma nel nostro porting le foglie sono attualmente disegnate su canvas**
- Se su GitHub le foglie sono **immagini decorative** (non canvas-shapes), dobbiamo portare anche quel layer/markup CSS (e non solo “foglie in canvas”).

---

## Cosa farò (piano operativo per riportare tutto 1:1)

### Step 1 — Ripristinare la “source of truth” (HTML GitHub) nel progetto
Obiettivo: avere un file HTML da diffare in modo deterministico.

- Opzione A (consigliata): **aggiungere nel progetto** `public/eden/nuovo_1-2.html` (o l’HTML giusto) esattamente come su GitHub.
- Opzione B: se non vuoi committarlo, mi dai **URL raw GitHub** del file (raw.githubusercontent.com) e lo userò per estrarre:
  - markup mancante (es. foglie PNG, background layers, moduli)
  - classi esatte
  - eventuali nuove immagini/asset usati
  - eventuali script/logic originali

Deliverable: HTML di riferimento disponibile → posso fare porting 1:1 reale (non “a memoria”).

---

### Step 2 — Forzare il layout full-bleed (fix “manca lo sfondo / manca tutto”)
Obiettivo: eliminare qualsiasi “cornice template” attorno al sito EDEN.

Azioni:
- In `eden.css` aggiungere regole **solo quando EDEN è montato**, ad esempio:
  - `body.eden-body #root { max-width: none; padding: 0; margin: 0; width: 100%; }`
  - assicurare `#root` e wrapper non taglino `position: fixed` layers
- Verificare stacking context:
  - `#eden-hero-canvas` deve stare dietro (z-index negativo) ma non “sparire”
  - `.page` deve avere contenuto sopra
- Verificare che `overflow-x: hidden` non nasconda il canvas/overlay (che sono `fixed`).

Deliverable: lo sfondo (canvas + aurora + gradienti) torna visibile a schermo intero.

---

### Step 3 — Reintrodurre le “foglie” come in GitHub (se sono PNG/layer CSS)
Obiettivo: replicare esattamente “le foglie” che vedi nella versione GitHub.

Azioni (dipendono dall’HTML sorgente):
- Se GitHub usa immagini:
  - aggiungere nel markup (`EdenLanding.tsx`) un layer decorativo tipo:
    - `<img class="leaf leaf--1" src="/eden/leaf.png" ... />`
    - `<img class="leaf leaf--source" src="/eden/leaf-source.png" ... />`
  - portare CSS posizionamento + animazioni (drift, blur, opacity, mix-blend)
- Se GitHub usa canvas:
  - confrontare i parametri (count, size, speed, colori) e allinearli
  - eventualmente sostituire le “foglie shape” con sprite PNG drawImage (più 1:1).

Deliverable: foglie identiche per numero/posizione/animazione rispetto a GitHub.

---

### Step 4 — “Cambio colore” / cambio atmosfera: allineamento 1:1
Obiettivo: ottenere il cambio colore esatto che ti manca (probabilmente legato a Mare/Terra o a sezioni).

Azioni:
- Dal tuo codice già esiste `data-mood={activeTab}` e CSS per `.cucina-atmo--mare/--terra`.
- Se su GitHub il cambio colore coinvolge **anche lo sfondo globale** (hero/canvas/aurora), porterò:
  - classi su `body` o su `.eden-theme` (es. `theme-mare` / `theme-terra`)
  - aggiornamento dei CSS variables (`--eden-emerald`, `--eden-gold`, gradienti) in base al mood
  - eventuale crossfade cinematica (opacity + filter + transition timing)

Deliverable: quando passi Mare/Terra (o quando scrolli nella sezione), i colori e l’atmosfera cambiano esattamente come in GitHub.

---

### Step 5 — “Sezione del modulo sotto” (quale modulo?)
Nel tuo `EdenLanding.tsx` c’è già una sezione eventi con form (`#eventi`), ma tu dici che “manca la sezione del modulo sotto”: quindi su GitHub c’è **un altro blocco** (o una posizione diversa) che ora non stai vedendo.

Azioni:
- Con l’HTML sorgente, identificherò il blocco (“modulo”):
  - se è un form diverso (contatti, newsletter, prenota, ecc.)
  - se è un “module section” grafico (cards/moduli)
  - se è semplicemente posizionato sotto un’altra sezione (ordine differente)
- Poi:
  - porto markup 1:1 dentro `EdenLanding.tsx`
  - porto CSS 1:1 dentro `eden.css`
  - collego eventuale logica (floating labels / validation / reveal)

Deliverable: la sezione modulo appare nello stesso punto e con lo stesso stile della versione GitHub.

---

### Step 6 — Verifica tecnica (per evitare “si vede bianco / non parte niente”)
Checklist rapida da fare subito dopo l’implementazione:
- Background: canvas + aurora + LED visibili (nessun layer coperto)
- Foglie visibili (canvas o PNG)
- Parallax: attivo su scroll (non su mouse)
- Sezioni: Eden, Cucina, Gallery, Eventi (modulo), Recensioni, Contatti presenti
- Mobile: menu apre/chiude, nav non rompe layout
- Nessun errore console (specialmente su canvas/clipboard)

---

## Informazioni minime che mi servono per chiudere 1:1 senza andare “a tentativi”
Senza questo, posso solo “provare fix generici”, ma tu chiedi 1:1.

1) Incolla qui il **link GitHub esatto** (repo + path del file HTML) oppure forniscimi il **raw URL** del file.
2) Dimmi qual è la “sezione del modulo sotto” (nome sezione o screenshot): è il form eventi? un form contatti? prenota?

---

## File che toccherò quando implemento
- `src/styles/eden.css`
  - override full-bleed `#root` quando EDEN è montato
  - layer foglie (se PNG) + animazioni
  - mood/color crossfade globale
  - eventuali sezioni mancanti portate dall’HTML
- `src/components/eden/EdenLanding.tsx`
  - inserimento markup foglie/layers (se previsti in HTML)
  - applicazione classi mood globali
  - inserimento sezione “modulo sotto” 1:1 (ordine e markup)
- `public/eden/*`
  - aggiunta HTML di riferimento e qualsiasi asset extra usato dal GitHub

