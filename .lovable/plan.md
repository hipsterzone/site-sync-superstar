
## Problema reale (perché ora non builda)
L’errore `TS1128: Declaration or statement expected` in fondo al file (`EdenLanding.tsx(2437,1)`) è causato da **codice duplicato/incollato dopo la chiusura del componente**.

Nel file succede questo:
- A **riga ~1523** il componente `export default function EdenLanding()` **finisce** (c’è `);` e subito dopo `}`).
- Subito dopo, a **riga ~1526**, riparte **un secondo blocco** di codice (di una versione precedente) con:
  - `const galleryItems = useMemo(...)`
  - `useEffect(...)` (parallax mousemove 3D)
  - altra logica/markup
- Quel blocco è **fuori da qualsiasi funzione/componente**, quindi TypeScript va in parsing “sporco” e spara l’errore alla fine del file.

👉 Quindi il fix è: **tenere una sola versione del componente** ed eliminare tutto ciò che sta dopo la prima chiusura corretta.

---

## Obiettivo del fix
1) Ripristinare un file TSX valido eliminando il “secondo componente fantasma” incollato sotto.  
2) Far tornare il build verde senza cambiare la UI già corretta (quella inclusa nella prima `return` che arriva fino alla Policy Modal / FAB dock / footer).

---

## Piano di intervento (veloce e sicuro)
### Step 1 — Tagliare il blocco duplicato in coda al file
Nel file `src/components/eden/EdenLanding.tsx`:
- Individuare questo punto (già presente):
  - fine `return (...)` + `);`
  - **`}`** che chiude il componente (intorno a **riga 1523**)
- **Eliminare tutto** ciò che segue, cioè da subito dopo quella `}` fino alla fine del file (oggi arriva a riga 2437).

Concretamente:
- Cancellare da circa **riga 1525** (dove ricomincia `const galleryItems: GalleryItem[] = useMemo(`) fino alla fine.

Questo rimuove:
- la vecchia `galleryItems` duplicata
- il vecchio parallax mousemove 3D duplicato
- la vecchia logica duplicata
- il vecchio footer minimal duplicato

### Step 2 — Verifica rapida che resti UNA sola definizione di galleryItems
Dopo il taglio:
- La `galleryItems` “buona” deve rimanere **solo** dentro `EdenLanding()` (quella che parte a circa riga ~500, già corretta con 16 elementi).
- Confermare che nel file non esistano altre `const galleryItems` duplicate.

### Step 3 — Build check
- Ricompilare: l’errore `TS1128` deve sparire immediatamente (era sintassi/file-structure).
- Aprire `/` e fare una smoke test:
  - menu mobile
  - tabs Mare/Terra + atmo crossfade
  - gallery filter + lightbox + ESC
  - copia indirizzo (mini toast)
  - FAB dock
  - policy modal (overlay + ESC)

---

## Nota (perché è successo)
Questo tipo di errore succede quasi sempre quando:
- si incolla un “pezzo grosso” di componente
- si chiude `}` troppo presto
- e resta codice React hooks (`useEffect`, `useMemo`) fuori da una funzione.

Qui infatti si vede chiaramente: a riga ~1523 il componente è già chiuso, ma sotto ci sono ancora hooks e costanti.

---

## Criteri di accettazione
- `npm run build` / build Lovable senza errori TypeScript
- `EdenLanding.tsx` termina subito dopo la `}` del componente (niente codice dopo)
- UI invariata rispetto a prima del crash (tutti gli effetti che abbiamo portato restano)

---

<lov-actions>
  <lov-open-history>View History</lov-open-history>
  <lov-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</lov-link>

  <lov-suggestion message="Testa end-to-end su desktop e mobile: menu (apri/chiudi), link #sezioni, parallax scroll, tabs Mare/Terra, filtri gallery + lightbox (ESC/overlay), copia indirizzo (toast), FAB dock e policy modal.">Verify that it works</lov-suggestion>
  <lov-suggestion message="Rendi locali tutte le 16 immagini della gallery (scarico e sposto in public/eden/gallery/...) e aggiorno i src per una replica 100% indipendente da Pexels.">Localizza immagini gallery</lov-suggestion>
  <lov-suggestion message="Aggiungi una route /prenota con un form (stile EDEN) e collega tutti i CTA “Prenota” al form invece del tel:.">Pagina Prenota</lov-suggestion>
  <lov-suggestion message="Ottimizza performance senza cambiare resa: lazy-load immagini sotto la piega, preload hero logo, e riduzione peso asset locali.">Ottimizzazione performance</lov-suggestion>
  <lov-suggestion message="Allinea SEO/OG al 100% con l’HTML sorgente (title, description, og:image, twitter cards) e verifica la preview social.">SEO & OG 1:1</lov-suggestion>
</lov-actions>
