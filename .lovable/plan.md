
## Obiettivo
Sostituire **solo**:
- il **logo dell’hero**
- il **logo dell’intro**

con il nuovo file caricato (`user-uploads://transparent-Photoroom.png`), **senza modificare nessuna dimensione, altezza, CSS o markup**. Quindi: sostituzione “a parità di path”.

---

## Stato attuale (riferimenti in codice)
- Hero logo in `src/components/eden/EdenLanding.tsx`:
  - `<img className="hero-logo" src="/eden/eden-hero-logo.png" ... />`
- Intro logo in `src/components/eden/EdenIntroOverlay.tsx`:
  - `<img ... src="/eden/intro/eden-intro-logo.png" ... />`

Questi path puntano a file presenti in:
- `public/eden/eden-hero-logo.png`
- `public/eden/intro/eden-intro-logo.png`

---

## Strategia (zero modifiche di layout)
Per garantire che **non cambi nulla** (né classi, né CSS, né attributi), farò una sostituzione “in place” dei file in `public/`:

1) Copiare il nuovo logo dentro:
   - `public/eden/eden-hero-logo.png` (sovrascrive l’attuale hero logo)
2) Copiare lo stesso nuovo logo dentro:
   - `public/eden/intro/eden-intro-logo.png` (sovrascrive l’attuale intro logo)

In questo modo:
- **nessuna modifica** a `EdenLanding.tsx`
- **nessuna modifica** a `EdenIntroOverlay.tsx`
- **nessuna modifica** a `eden.css`
- cambiano solo i contenuti dei due file immagine.

---

## Passi di implementazione (precisi)
1) Sovrascrivere `public/eden/eden-hero-logo.png` con `user-uploads://transparent-Photoroom.png`
2) Sovrascrivere `public/eden/intro/eden-intro-logo.png` con `user-uploads://transparent-Photoroom.png`

---

## Verifiche end-to-end (obbligatorie)
1) Su `/` fai **refresh**:
   - parte l’intro: al secondo 2 compare il **nuovo logo**
2) Arrivato il sito:
   - nell’hero, il logo è **quello nuovo**
3) Premi **Skip**:
   - l’intro si chiude e l’hero mostra sempre il nuovo logo
4) Controlla desktop + mobile:
   - nessun cambiamento di layout “tecnico” (stessi CSS/markup); la resa dipende solo dall’immagine sostituita.

---

## File coinvolti
- `public/eden/eden-hero-logo.png` (sostituzione contenuto)
- `public/eden/intro/eden-intro-logo.png` (sostituzione contenuto)
