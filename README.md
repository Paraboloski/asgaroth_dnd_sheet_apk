# Asgaroth D&D Character Sheet

Una soluzione leggera e standalone per la gestione della scheda personaggio di D&D 5e. Progettata per essere rapida, parzialmente automatizzata e utilizzabile ovunque: **Desktop e Mobile.**

---

## Caratteristiche principali

-  **Multi-piattaforma:** Usala nel browser, installala come App sul telefono o scarica la versione Desktop.
-  **Salvaggio Locale:** I dati rimangono sul tuo dispositivo (Database SQLite per Desktop / LocalStorage per Web).
- **Automazione Intelligente:** Calcolo automatico di modificatori, bonus competenza e tiri salvezza.
- **Offline First:** Una volta caricata o installata, funziona senza connessione internet.
- **Print Ready:** Layout ottimizzato per la stampa della scheda in formato A4.

---

## Installazione Mobile 

Non serve passare dagli store! 
1. Apri [il link dell'app](https://paraboloski.github.io/asgaroth_dnd_sheet_apk/) dal browser del tuo smartphone (Chrome su Android o Safari su iOS).
2. Clicca su **"Aggiungi a schermata Home"** (o l'icona "Installa App").
3. La troverai direttamente tra le tue applicazioni.

---

## Download Desktop (Windows, macOS, Linux)

Se preferisci un'applicazione standalone per il tuo computer:

1. Vai nella sezione **[Releases](https://github.com/Paraboloski/asgaroth_dnd_sheet_apk/releases)**.
2. Scarica il file adatto al tuo sistema operativo:
   - **Windows**: `*.exe` (Installer)
   - **macOS**: `.dmg`
   - **Linux**: `.AppImage`
3. Installa e avvia.

---

##  Guida Rapida

- **Modifica:** Clicca su qualsiasi campo di testo per aggiornare i valori.
- **Salvataggio:** Usa il tasto **Salva** nella toolbar in alto per rendere permanenti le modifiche.
- **Import/Export:** Puoi esportare la tua scheda in un file `.json` per trasferirla da un dispositivo all'altro.
- **Bug Report:** Qualcosa non va? Usa il tasto **Report a bug** per aprire direttamente una segnalazione su GitHub.

---

## Sviluppo

L'applicazione è sviluppata con **React + Vite** e **Electron**. 
Se vuoi contribuire o compilare il codice localmente:

```bash
# Installa le dipendenze
npm install

# Avvia in modalità sviluppo (Web)
npm run dev

# Avvia in modalità sviluppo (Electron)
npm run electron:dev