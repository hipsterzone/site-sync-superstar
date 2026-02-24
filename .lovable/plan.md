
## Obiettivo
Ricreare **1:1 la UI** del sito (aspetto + layout + pagine) **senza collegare GitHub** e restando su **Vite + React Router**, copiando **asset e contenuti identici** *solo se recuperabili dal sito pubblicato*.

## Vincolo / prerequisito
Hai scelto “Da sito pubblicato”, ma al momento hai fornito solo il link GitHub.  
Per procedere serve **l’URL del sito online** (dominio/preview) da clonare visivamente.

## Piano di implementazione (UX + funzionalità)
### 1) Raccolta struttura del sito (dal sito pubblicato)
- Prendere l’URL pubblico e:
  - Mappare tutte le pagine principali (menu/footers, sezioni, eventuali pagine interne).
  - Identificare componenti ripetuti (header, navbar, footer, hero, cards, CTA, griglie, modali).

**Deliverable:** elenco route (es. `/`, `/about`, `/products`, ecc.) + inventario componenti UI.

### 2) Riproduzione layout globale 1:1
- Creare il “frame” del sito:
  - Header/navigation identici (stati hover/active, dropdown se presenti).
  - Footer identico.
  - Spaziature, container widths, responsive breakpoints (mobile/tablet/desktop).

**Deliverable:** layout coerente e riutilizzabile su tutte le pagine.

### 3) Tema e stile (design system) 1:1
- Allineare:
  - Palette colori (anche gradienti), tipografia, pesi, letter-spacing.
  - Componenti base (bottoni, input, badge, card, link, separatori).
  - Animazioni/transizioni (hover, opening menu, ecc.).

**Deliverable:** UI kit interno che replica il look&feel.

### 4) Implementazione pagine (UI-only)
- Per ogni pagina:
  - Ricostruire sezioni in ordine identico.
  - Inserire testi/immagini uguali (se disponibili via sito).
  - Riprodurre componenti come slider/carousel, accordion, tabs, ecc. dove presenti (solo lato UI).

**Deliverable:** tutte le route navigabili e visivamente 1:1.

### 5) Asset “identici” (quando possibile)
- Recuperare e integrare:
  - Immagini, icone, fonts (se caricati pubblicamente e legalmente riutilizzabili).
  - Favicon e immagini social (OG) se pubbliche.

**Nota:** se alcuni asset non sono accessibili dal sito (protetti/ottimizzati/blocked), li sostituiamo temporaneamente con placeholder *finché non li fornisci tu*.

### 6) Verifica 1:1 e rifiniture
- Checklist finale:
  - Pixel-check sezioni chiave (hero, header, footer, cards).
  - Responsive check (mobile/tablet/desktop).
  - Consistenza spaziature e tipografia.
  - Performance base (immagini, lazy load se necessario).

**Deliverable:** “clone” UI pronto.

## Cosa mi serve da te (1 cosa sola)
- Incolla qui **l’URL del sito pubblicato** che vuoi ricreare 1:1.

<lov-actions>
  <lov-suggestion message="Testa il sito end-to-end (navigazione tra pagine, responsive mobile/desktop, hover/stati attivi) per verificare che sia davvero 1:1.">Verify that it works</lov-suggestion>
  <lov-suggestion message="Aggiungi tutte le route principali e una navbar identica (con stati active, dropdown e versione mobile hamburger) usando React Router.">Ricrea navigazione completa</lov-suggestion>
  <lov-suggestion message="Replica il tema 1:1 (colori HSL, font, bottoni, card, spaziature) creando un design system riutilizzabile.">Tema e UI kit 1:1</lov-suggestion>
  <lov-suggestion message="Importa e ottimizza gli asset (immagini, favicon, font) e sostituisci eventuali risorse non accessibili con placeholder finché non le fornisci.">Gestione asset identici</lov-suggestion>
  <lov-suggestion message="Aggiungi una pagina 'Styleguide' interna per confrontare componenti (bottoni, headings, cards) e velocizzare i micro-aggiustamenti 1:1.">Pagina Styleguide</lov-suggestion>
</lov-actions>
