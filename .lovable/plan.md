
## Cosa vuoi ottenere (sul modulo “Richiedi una consulenza” in `src/components/eden/EdenLanding.tsx`)
1) La richiesta deve diventare **un messaggio WhatsApp** che includa **tutte le scelte e i campi compilati**.
2) Tutti i campi devono essere **obbligatori** (incluse le “chips” dell’occasione).
3) Il bottone **“Invia la richiesta”** deve **aprire WhatsApp** con il messaggio già pronto.
4) Sotto al bottone principale vanno rimossi:
   - “Apri WhatsApp”
   - “Copia messaggio”
   Deve rimanere **solo “Chiama”**.

Nota: gran parte della logica “messaggio WhatsApp con campi + validazione” è già presente (funzioni `getEventPayloadFromForm`, `validateEventPayload`, `buildEventMessage`, `prepareEventWhatsApp`, `onEventSubmit`). Faremo quindi un adeguamento mirato su UI/obbligatorietà e comportamento.

---

## Stato attuale (da codice)
Nel blocco Eventi Premium (linee ~1522+):
- Il form è `ref={eventFormRef}` e i valori vengono letti via `querySelector`.
- `validateEventPayload` già rende **di fatto obbligatori**: tipo, nome, tel, ospiti, note.
- “Invia la richiesta” (`onEventSubmit`) **apre già WhatsApp** con URL `https://wa.me/393497152524?text=...`.
- In basso c’è `ep-fallbacks` con 3 azioni: Apri WhatsApp / Copia messaggio / Chiama.

---

## Modifiche richieste (design + UX)
### A) Rendere obbligatoria anche la selezione “occasione” a livello HTML
Attualmente l’occasione è obbligatoria via JS (`validateEventPayload`), ma non via HTML.
Faremo entrambe:
- Lasciamo la validazione JS (serve comunque).
- Aggiungiamo `required` su **una** delle radio (pattern HTML standard): basta mettere `required` sul primo input `name="tipo"` per forzare la selezione nel gruppo.

### B) Rendere i campi “veramente” campi form (migliora autofill/semantica)
Senza stravolgere struttura/stile:
- Aggiungere `name="nome"` a `#ep-nome`
- `name="tel"` a `#ep-tel`
- `name="ospiti"` a `#ep-ospiti`
- `name="note"` a `#ep-note`
Questo non cambia il layout ma migliora accessibilità e compilazione.

### C) “Invia la richiesta” = WhatsApp (già ok), ma messaggio deve includere le scelte
Il messaggio già include:
- Occasione (tipo)
- Nome
- Telefono
- Ospiti
- Dettagli (note)

Intervento minimo:
- Eventualmente rinominare intestazione messaggio per renderla più “commerciale”/chiara (es. “Richiesta consulenza eventi · EDEN”).
- Aggiungere una riga “Canale: WhatsApp” o simile solo se la vuoi (facoltativo). (Di base non serve.)

### D) Rimuovere i bottoni sotto: lasciare solo “Chiama”
Modifica UI:
- Sostituire il blocco:
  ```tsx
  <div className="ep-fallbacks">
    [Apri WhatsApp]
    [Copia messaggio]
    [Chiama]
  </div>
  ```
  con:
  ```tsx
  <div className="ep-fallbacks" aria-label="Contatto telefonico">
    <a className="ep-fallback" href="tel:+393497152524">Chiama</a>
  </div>
  ```
Oppure, se vuoi ancora un layout più pulito, togliamo completamente `ep-fallbacks` e mettiamo “Chiama” come link secondario vicino al bottone principale (ma tu hai chiesto “sotto rimane solo chiama”, quindi lo lasciamo sotto).

### E) Obbligatorietà “hard” + messaggio coerente = miglioramento validazione (senza introdurre nuove librerie)
Già c’è una validazione manuale; la rendiamo più robusta:
- `ospiti`: garantire che sia un numero > 0 (o almeno “>= 1”), non solo stringa non vuota.
- `tel`: trim + limite già c’è; aggiungere controllo minimo lunghezza (es. >= 6) per evitare valori troppo corti.
- Se errore: già c’è `toast({ variant: "destructive" })` → manteniamo.

(Se in futuro vuoi, possiamo migrare a `react-hook-form` + `zod` per una validazione ancora più pulita, ma non è necessario per questa richiesta.)

---

## File da modificare
1) **`src/components/eden/EdenLanding.tsx`**
   - Aggiornare inputs radio/text/textarea (required/name)
   - Aggiornare UI del blocco “ep-fallbacks” lasciando solo “Chiama”
   - (Opzionale) micro-tuning su `buildEventMessage` e `validateEventPayload` per numeric checks

---

## Checklist test end-to-end (importante)
1) Vai in Home → scorri a “Eventi & Private Parties” → compila il form:
   - Prova a cliccare “Invia la richiesta” senza selezionare l’occasione: deve bloccare e mostrare errore.
   - Prova senza nome / tel / ospiti / note: deve bloccare e mostrare errore.
2) Compila tutto correttamente → “Invia la richiesta”:
   - Deve aprire una nuova scheda WhatsApp con messaggio precompilato.
   - Il messaggio deve contenere **Occasione, Nome, Telefono, Ospiti, Dettagli**.
3) Verifica che sotto al bottone principale ci sia **solo “Chiama”** (niente “Apri WhatsApp”, niente “Copia messaggio”).
4) Mobile: ripetere test per assicurarsi che WhatsApp si apra correttamente e che il layout resti pulito.

---

## Dettagli tecnici (per trasparenza)
- Non useremo `action` del form: continueremo con `window.open(waUrl, "_blank", "noopener")`.
- `required` sul gruppo radio: HTML supporta la validazione se almeno uno dei radio con lo stesso `name` ha `required`.
- Continuiamo a usare `encodeURIComponent(msg)` (già presente) per evitare problemi con caratteri speciali nel testo WhatsApp.
