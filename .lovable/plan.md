
## Obiettivo (solo questa richiesta)
Spostare “Scorri nel nostro Eden” **più a sinistra**, mantenendolo **in basso** e “al centro dell’hero” (cioè: centrato *visivamente* ma con un offset a sinistra), senza rompere:
- parallax già attivo su `.hero-scroll.parallax-layer`
- bobbing già attivo su `.hero-scroll-inner`
- responsività (desktop + mobile)

Hai scelto: **offset -24px**.

---

## Diagnosi (perché ora “sembra non centrato”)
Nel CSS attuale (`src/styles/eden.css`) `.hero-scroll` è:
- `left: 50%`
- `transform: translateX(-50%)`

Questo centra matematicamente il blocco, ma **la percezione visiva** può risultare “troppo a destra” perché:
- il contenuto dell’hero (logo + badge) non è perfettamente “centrato ottico”
- letter-spacing + indicator circolare possono dare un peso visivo diverso
- su alcune viewport il “centro ottico” non coincide col 50% della pagina

Soluzione: aggiungere un **offset controllato** verso sinistra, lasciando invariato parallax/bobbing.

---

## Modifiche previste (minime e sicure)

### 1) Aggiungere un offset CSS dedicato (configurabile)
**File:** `src/styles/eden.css`

- Introdurre una variabile CSS, ad esempio:
  - `--hero-scroll-x: -24px;` (valore approvato)
- Applicarla alla trasformazione orizzontale di `.hero-scroll` in modo che resti centrato ma “tirato” a sinistra:

Esempio concettuale:
```css
.hero-scroll{
  left: 50%;
  transform: translateX(calc(-50% + var(--hero-scroll-x)));
}
```

Note importanti:
- L’offset è applicato solo all’asse X: il parallax usa `--parallaxY` (asse Y) quindi **non c’è conflitto**.
- Il bobbing rimane su `.hero-scroll-inner`, quindi **nessun conflitto** con `transform` di `.hero-scroll`.

### 2) Responsività (mobile)
Sempre in `src/styles/eden.css`, aggiungere un media rule per ridurre l’offset su schermi piccoli, così non “scappa” troppo:
- Desktop: `--hero-scroll-x: -24px;`
- Mobile (es. max-width 700px): `--hero-scroll-x: -12px;` (o 0 se vuoi centratura perfetta su mobile)

---

## Test end-to-end (obbligatorio)
1) Vai su `/` e controlla in hero:
   - CTA “Scorri nel nostro Eden” è **più a sinistra** ma resta **in basso** e “al centro visivo”
   - bobbing attivo (si muove su/giù)
2) Scroll leggero:
   - parallax continua a funzionare (si sposta leggermente rispetto allo scroll)
3) Mobile (<700px):
   - CTA non risulta troppo spostata; resta equilibrata e leggibile

---

## File coinvolti
- `src/styles/eden.css` (solo CSS; non serve toccare `EdenLanding.tsx` perché markup e bobbing sono già corretti)

