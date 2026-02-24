
## Contesto (cosa ho trovato nel repo)
Nel repo `edenfoowine` non c’è (o non è indicato) un “sito pubblicato” esterno da clonare. Però c’è già una **conversione React nativa** della landing EDEN:

- `src/components/eden/EdenLanding.tsx` (landing completa, con interazioni JS portate in React)
- `src/styles/eden.css` (CSS portato 1:1 dall’HTML, con palette e font)
- asset in `public/eden/`:
  - `eden-logo.jpg`
  - `eden-hero-logo.png`
  - `leaf.png`
  - `leaf-source.png`
  - (oltre alla versione HTML statica `public/eden/nuovo_1-2.html`, utile come reference)

Dato che hai scelto **React nativo (conversione)** e **supporto link interni**, la strada più fedele e veloce è: **importare EdenLanding + eden.css + asset**, e far diventare `EdenLanding` la Home.

---

## Obiettivo
Portare nel tuo progetto attuale (Vite + React Router) la landing “EDEN” **UI 1:1**, in React nativo, con:
- anchor navigation (`#eden`, `#cucina`, `#gallery`, `#eventi`, `#recensioni`, `#contatti`)
- interazioni (menu mobile, tabs Mare/Terra, counters, reveal on scroll, gallery filter + lightbox, copy address, ecc.)
- asset identici (quelli presenti in `public/eden/` nel repo)

---

## Piano di implementazione (passi concreti)

### 1) Import “modulo EDEN” nel progetto corrente
Creerò/porterò questi file (copiandoli dal repo):
- `src/components/eden/EdenLanding.tsx`
- `src/styles/eden.css`

Note tecniche:
- `EdenLanding.tsx` importa `@/styles/eden.css` e usa `toast` da `@/hooks/use-toast` (che nel tuo progetto esiste già), quindi l’integrazione è lineare.
- Il CSS applica classi speciali a `html/body` (es. `eden-html`, `eden-body`) per ottenere lo stesso comportamento dell’HTML statico: controlleremo che queste classi vengano aggiunte/rimosse correttamente quando la pagina monta/smonta.

---

### 2) Import asset identici
Copierò dal repo dentro il tuo progetto:
- `public/eden/eden-logo.jpg`
- `public/eden/eden-hero-logo.png`
- `public/eden/leaf.png`
- `public/eden/leaf-source.png`

Opzionale ma utile come “golden reference”:
- `public/eden/nuovo_1-2.html` (non servirà per runtime, ma può essere usato per confronti 1:1 se vuoi)

---

### 3) Collegare la Home alla landing EDEN
Aggiornerò `src/pages/Index.tsx` per renderizzare:
- `<EdenLanding />`

Così:
- Resti su **Vite + React Router**
- La UI diventa “nativa” (niente iframe)
- Gli anchor link funzionano in-page (hash navigation) come nel markup originale

---

### 4) Gestione “link interni” e navigazione hash
Per supportare “anche pagine/link interni” (dato che la landing usa molti `href="#..."`):

- Verificherò che il click su anchor:
  - scrolli correttamente alla sezione (smooth)
  - non rompa il routing React Router
- Se necessario, aggiungerò un micro-helper (in `EdenLanding.tsx`) che:
  - intercetta i click sugli anchor `#...`
  - esegue `document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" })`
  - aggiorna l’URL con `history.replaceState` (opzionale) per mantenere la compatibilità “1:1” visiva e comportamentale

---

### 5) Metadati (title/description/OG) coerenti con EDEN
Allineerò `index.html` del progetto corrente a quanto emerge nel repo (almeno):
- `<title>Eden Food.Wine.Restaurant</title>`
- `meta description` in italiano
- eventuali `og:` e `twitter:` se vuoi che la condivisione social sia coerente

(Questo non cambia la UI, ma è parte del “clone” del sito visto dall’esterno.)

---

### 6) Verifica 1:1 (checklist)
Dopo l’integrazione farò un pass di controllo funzionale:
- Header: sticky + menu mobile (apri/chiudi) + CTA “Prenota”
- Hero: canvas/aurora/LED effects (se implementati in EdenLanding) + parallax layers
- Tabs Mare/Terra: switch, animazioni, counters prezzi
- Gallery: filtri + lightbox + caption
- Reviews: counters (4.5 / 4.9 / 8000)
- Contatti: pulsante copia indirizzo + link Maps + link WhatsApp/tel
- Responsive: 390px, 768px, 1024px, desktop

---

## Output atteso
- La route `/` mostra la landing EDEN completa in React nativo
- Gli asset locali `/eden/...` sono serviti dal tuo `public/eden`
- La UI risulta 1:1 rispetto a `nuovo_1-2.html` (stile + animazioni + layout + sezioni)

---

## Rischi/Note (trasparenti)
- Alcune immagini della gallery sono link Pexels esterni: sono “identiche” alla versione attuale del file, ma dipendono da risorse esterne (se un URL cambia, l’immagine potrebbe non caricarsi). Se vuoi “asset 100% locali”, in una fase successiva possiamo scaricare e mettere tutto in `public/eden/gallery/...`.
- Se il canvas effect dipende da `requestAnimationFrame`, verificherò che venga “cleanupato” su unmount per evitare consumi CPU se un domani aggiungi altre route.

