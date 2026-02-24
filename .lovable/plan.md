
## Obiettivo
Aggiungere una **intro cinematografica full-screen di 5 secondi** sulla home (`/`):
- **0s–2s:** video “black_hole_remix.mp4” in background (leggero, cinematic).
- **al 2° secondo:** compare il **logo allegato** (fade/scale-in, centrato).
- **al 5° secondo:** **bagliore** (flash morbido giallo/bianco stile LED) + dissolvenza dell’intro → si rivela il sito.
- In più: **Skip** e **progress bar 0–5s** (come hai chiesto).
- Riproduzione: **ogni visita/refresh** (come hai scelto).

---

## Scelte tecniche (perché così)
- Userò un **overlay fixed** sopra tutto (`position: fixed; inset:0; z-index` alto), così copre anche l’hero.
- Video in `<video>` **autoplay muted playsInline** per compatibilità (mobile/iOS blocca spesso autoplay con audio).
- La timeline (2s logo, 5s bagliore+exit) verrà gestita in modo robusto con:
  - un timer principale 5s per la fine
  - un timer a 2s per attivare il logo
  - una progress bar aggiornata con `requestAnimationFrame` (fluida)
- Durante l’intro: **scroll bloccato** (body `overflow: hidden`) per evitare che l’utente “scorra sotto” l’overlay.

---

## Esplorazione (stato attuale utile)
- La home renderizza solo `<EdenLanding />`.
- In `EdenLanding.tsx` lo sfondo è già composto da layer `fixed` (canvas/aurora/led) sotto la `.page`.
- Quindi l’intro va montata **dentro EdenLanding** ma **prima** del contenuto `.page` (o anche sopra tutto come primo figlio), con `z-index` superiore a header/page.

---

## Implementazione (passi)

### 1) Aggiungere gli asset al progetto
**Da copiare** dagli upload:
- `user-uploads://black_hole_remix.mp4` → `public/eden/intro/black_hole_remix.mp4`
- `user-uploads://52020869_1146026168899157_246046495860588544_n_1_1.png` → `public/eden/intro/eden-intro-logo.png`

Motivo: in intro userò URL diretti (`/eden/intro/...`) che funzionano bene per `<video>` e per caching statico.

---

### 2) Creare un componente dedicato: `EdenIntroOverlay`
**Nuovo file:** `src/components/eden/EdenIntroOverlay.tsx`

Responsabilità:
- Props:
  - `durationMs?: number` (default 5000)
  - `logoDelayMs?: number` (default 2000)
  - `onFinish?: () => void`
- Stato interno:
  - `isVisible` (overlay presente)
  - `showLogo` (true dopo 2s)
  - `isExiting` (true negli ultimi ~400–700ms per fade-out)
  - `progress` (0→1 per progress bar)
- Side effects:
  - blocco scroll: `document.body.style.overflow = "hidden"` quando overlay attivo; ripristino a fine/skip.
  - timer fine intro a 5s (e anche fallback se video non parte).
- UI:
  - `<video>` full-screen, `object-fit: cover`, `autoPlay muted playsInline preload="auto"`.
  - Logo overlay:
    - `<img src="/eden/intro/eden-intro-logo.png" ... />`
    - Animazione di ingresso: fade + slight scale + glow.
  - “Bagliore” al 5° secondo:
    - un layer `div` con gradient giallo/bianco + blur + animazione flash.
  - Skip:
    - button top-right (o bottom-right) con stile Eden (pill glass).
    - Click = chiude subito overlay (con micro fade-out 200–300ms) e sblocca scroll.
  - Progress bar:
    - sottile (bottom center), 0→100% in 5s.

---

### 3) Montare l’intro in `EdenLanding.tsx`
**File:** `src/components/eden/EdenLanding.tsx`

- Importare `EdenIntroOverlay`.
- Aggiungere stato:
  - `const [introDone, setIntroDone] = useState(false);`
- Render:
  - dentro `<div className="eden-theme" ...>` prima della `.page`:
    - `{!introDone && <EdenIntroOverlay onFinish={() => setIntroDone(true)} />}`
- Nota: dato che vuoi “ogni visita”, **non** userò `localStorage` per disabilitarla (ma potremo aggiungerlo in seguito se cambi idea).

---

### 4) CSS per intro (cinematic + LED warm)
**File:** `src/styles/eden.css`

Aggiungerò un blocco dedicato (in fondo) con classi tipo:
- `.eden-intro` (overlay root: fixed, full screen, z-index alto, background fallback nero)
- `.eden-intro-video`
- `.eden-intro-logo` + `.eden-intro-logo.is-visible` (entra al 2s)
- `.eden-intro-glow` (flash al 5s)
- `.eden-intro-skip`
- `.eden-intro-progress` + `.eden-intro-progress-bar`

Keyframes:
- `introLogoIn` (opacity 0→1, scale 0.98→1, glow)
- `introGlowFlash` (brevissimo flash morbido 250–450ms, giallo/bianco, stile LED)
- `introFadeOut` (overlay opacity 1→0 negli ultimi ~500ms)

Accessibilità:
- `@media (prefers-reduced-motion: reduce)`:
  - ridurre o disabilitare animazioni aggressive (logo entra più semplice; glow attenuato).
- Overlay con `aria-label="Intro EDEN"` e pulsante skip accessibile.

---

## Comportamento temporale (timeline precisa)
```text
t=0.0  Overlay ON, video autoplay muted, progress=0%
t=2.0  showLogo=true  (logo appare con introLogoIn)
t=4.7  isExiting=true (prepara fade out)
t=5.0  glow flash + overlay fadeOut + onFinish() → sito visibile
```

---

## Audio (manca la tua risposta: cosa farò di default)
Per evitare blocchi su mobile: **muted di default**.
Se vuoi audio, lo aggiungiamo in un secondo step con “Tap to unmute” (richiede interazione).

---

## Test end-to-end (obbligatorio)
1) Apri `/` (desktop): l’intro dura 5s, il logo entra al 2°, al 5° c’è bagliore e appare il sito.
2) Premi **Skip**: chiude subito e lo scroll torna attivo.
3) Guarda la **progress bar**: arriva a fine in 5s e resta fluida.
4) Mobile (iOS/Android): il video deve partire **muted**; se non parte, l’overlay deve comunque finire a 5s (timer) senza bloccare l’utente.
5) Verifica che header/hero/sfondi non “saltino” e che dopo l’intro l’esperienza sia normale.

---

## File coinvolti
- **NEW** `src/components/eden/EdenIntroOverlay.tsx`
- **EDIT** `src/components/eden/EdenLanding.tsx`
- **EDIT** `src/styles/eden.css`
- **ADD** `public/eden/intro/black_hole_remix.mp4`
- **ADD** `public/eden/intro/eden-intro-logo.png`
