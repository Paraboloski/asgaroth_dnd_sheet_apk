# ROLE69

Scheda personaggio per D&D 5e parzialmente automatizzata per contesti online.

## Indice

1. [Panoramica introduttiva e descrizione rapida](#panoramica-introduttiva-e-descrizione-rapida)
2. [Come scaricarla su PC](#come-scaricarla-su-pc)
3. [Come usarla da browser/mobile](#come-usarla-da-browsermobile)
4. [Troubleshooting utente](#troubleshooting-utente)
5. [Build, deploy e release](#build-deploy-e-release)

## Panoramica introduttiva e descrizione rapida

Scheda digitale per D&D 5e pensata per essere veloce da usare durante la sessione e semplice da portare tra dispositivi.

Funzionalita principali:

- modifica diretta dei campi della scheda;
- salvataggio locale sul dispositivo;
- export e import in `JSON` per una più semplice distribuzione;
- stampa in `PDF`;
- supporto browser, mobile e desktop;
- tema chiaro/scuro;
- calcoli automatici per modificatori, bonus competenza, Classe Armatura, vari ed eventuali.

La versione browser salva i dati localmente nel browser. La versione desktop salva i dati in un database SQLite locale.

Funzionamento dell'applicativo garantito anche offline.

## Come scaricarla su PC

Se vuoi usare l'app come programma desktop:

1. vai nella pagina delle [release](`https://github.com/Paraboloski/role69/releases`):


2. scarica il file adatto al tuo sistema operativo:

- Windows: `Scheda-DnD-Setup-<version>.exe`
- macOS: `Scheda-DnD-macos-<version>.dmg`
- Linux: `Scheda-DnD-linux-<version>.AppImage`

3. installa o avvia il file scaricato

## Come usarla da browser/mobile

Versione [web pubblicata](`https://paraboloski.github.io/role69/`):

### Browser

Apri il link e compila la scheda direttamente nella pagina.

### Mobile / PWA

Apri lo stesso link dal telefono e, se vuoi, installa la web app con:

- `Aggiungi a schermata Home` / `Installa app`

### Flusso d'uso consigliato

1. compila i campi della scheda
2. premi `Salva` per rendere persistenti le modifiche
3. usa `JSON` per fare backup o trasferire la scheda
4. usa `PDF` se vuoi una versione stampabile

## Troubleshooting utente

### Ho modificato la scheda ma al riavvio non trovo nulla

Probabilmente non hai premuto `Salva`. Le modifiche si vedono subito a schermo, ma diventano permanenti solo dopo il salvataggio.

### Ho importato un file JSON ma dopo il refresh ho perso tutto

Dopo l'import devi ancora premere `Salva`, altrimenti i dati restano solo nella sessione corrente.

### Su telefono non vedo la foto profilo

E normale: nella vista mobile l'immagine profilo non viene mostrata e non puo essere caricata.

### Non riesco a caricare una foto

Controlla che il file sia:

- in formato `JPG`, `PNG` o `WebP`
- piu piccolo di `2 MB`
- caricato dalla vista desktop

## Build, deploy e release

Il codice dell'app si trova nella cartella [`sheet`](./sheet).

### Setup locale

```bash
cd sheet
npm install --legacy-peer-deps
```

### Sviluppo

Avvio web:

```bash
npm run dev
```

Avvio Electron:

```bash
npm run electron:dev
```

### Build

Build web:

```bash
npm run build
```

Build desktop:

```bash
npm run electron:build
```

Rigenerazione database seed:

```bash
npm run db:seed
```

Pulizia artefatti:

```bash
npm run clean
```

### Deploy e release

La pipeline GitHub Actions e definita in [`.github/workflows/build.yml`](./.github/workflows/build.yml).

Il workflow parte quando viene pubblicato un tag nel formato:

```bash
v*.*.*
```

Esempio:

```bash
git tag v1.2.0
git push origin v1.2.0
```

La pipeline:

- crea o aggiorna la release GitHub
- builda i pacchetti desktop per Windows, macOS e Linux
- pubblica la build web su GitHub Pages

La configurazione di build desktop e in [`sheet/package.json`](./sheet/package.json), mentre la configurazione PWA/web e in [`sheet/vite.config.js`](./sheet/vite.config.js).
