const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const dbUtils = require(path.join(__dirname, '..', 'db', 'schema.cjs'));
const { SCHEMA_SQL, applyMigrations, seedFromState } = dbUtils;

let mainWindow;
let hasUnsavedChanges = false;
let Database = null;
let db = null;
let didWarnMissingDb = false;

try {
  Database = require('better-sqlite3');
} catch {
  Database = null;
}

const DEFAULT_STATE_KEY = 'initial_state';
const BUNDLED_DB_RELATIVE = path.join('db', 'db.sqlite');

const getBundledDbBuffer = () => {
  const bundledPath = path.join(app.getAppPath(), BUNDLED_DB_RELATIVE);
  try {
    return fs.readFileSync(bundledPath);
  } catch {
    return null;
  }
};

const ensureUserDb = () => {
  const dbPath = path.join(app.getPath('userData'), 'sheet.sqlite');
  if (!fs.existsSync(dbPath)) {
    const buffer = getBundledDbBuffer();
    if (buffer) {
      fs.writeFileSync(dbPath, buffer);
    } else if (app.isPackaged && !didWarnMissingDb) {
      didWarnMissingDb = true;
      dialog.showErrorBox(
        'Database mancante',
        `db/db.sqlite non trovato nel pacchetto.\n\n` +
        `Assicurati che "db/db.sqlite" sia incluso nei file di build.`
      );
    }
  }
  return dbPath;
};

const hasTable = (database, tableName) => Boolean(
  database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName)
);


const maybeMigrateFromKv = (database) => {
  if (!hasTable(database, 'kv')) return false;
  const row = database.prepare('SELECT value FROM kv WHERE key = ?').get(DEFAULT_STATE_KEY);
  if (!row?.value) return false;
  try {
    const parsed = JSON.parse(row.value);
    seedFromState(database, parsed);
    return true;
  } catch {
    return false;
  }
};

const ensureSeedData = (database) => {
  const headerRow = database.prepare('SELECT 1 FROM header LIMIT 1').get();
  const statsRow = database.prepare('SELECT 1 FROM stats LIMIT 1').get();
  const combatRow = database.prepare('SELECT 1 FROM combat LIMIT 1').get();
  if (headerRow && statsRow && combatRow) return;
  if (maybeMigrateFromKv(database)) return;
};

const getDatabase = () => {
  if (!Database) return null;
  if (db) return db;
  const dbPath = ensureUserDb();
  const instance = new Database(dbPath);
  instance.exec(SCHEMA_SQL);
  applyMigrations(instance);
  ensureSeedData(instance);
  db = instance;
  return db;
};

const readInitialStateFromDb = () => {
  const database = getDatabase();
  if (!database) return null;

  const headerRow = database.prepare(`
    SELECT profile_image, name, class1, class2, race, background, alignment, level, player
    FROM header LIMIT 1
  `).get();
  const statsRow = database.prepare(`
    SELECT str, dex, con, int, wis, cha
    FROM stats LIMIT 1
  `).get();
  const combatRow = database.prepare(`
    SELECT ac, speed, max_hit_points, current_hit_points, temporary_hit_points,
           death_save_successes, death_save_failures,
           honor_score, honor, sanity_score, sanity,
           occult, occult_bonus, passive, prof_bonus, hero_points
    FROM combat LIMIT 1
  `).get();
  const notesRow = database.prepare('SELECT content FROM notes LIMIT 1').get();

  if (!headerRow || !statsRow || !combatRow) return null;

  const skillsRows = database.prepare('SELECT id, proficient, bonus FROM skills').all();
  const skills = {};
  const skillBonuses = {};
  skillsRows.forEach((row) => {
    skills[row.id] = Boolean(row.proficient);
    if (typeof row.bonus === 'string' && row.bonus.trim() !== '') {
      skillBonuses[row.id] = row.bonus;
    }
  });

  const proficiencies = database.prepare(
    "SELECT id, COALESCE(name, label, '') AS name, COALESCE(description, value, '') AS description FROM inventory_proficiencies ORDER BY id"
  ).all();
  const items = database.prepare(
    "SELECT id, COALESCE(name, label, '') AS name, COALESCE(quantity, value, '0') AS quantity FROM inventory_items ORDER BY id"
  ).all();
  const equipment = database.prepare(
    "SELECT id, COALESCE(name, label, '') AS name, COALESCE(bonus, value, '+0') AS bonus FROM inventory_equipment ORDER BY id"
  ).all();

  const attacks = database.prepare(
    'SELECT id, name, bonus, damage, notes FROM actions_attacks ORDER BY id'
  ).all();
  const statuses = database.prepare(
    'SELECT id, name, description, active, custom FROM actions_statuses ORDER BY sort_order, id'
  ).all().map((status) => ({
    ...status,
    active: Boolean(status.active),
    custom: Boolean(status.custom)
  }));
  const features = database.prepare(
    'SELECT id, name, effect FROM actions_features ORDER BY id'
  ).all();
  const traits = database.prepare(
    'SELECT id, name, description FROM actions_traits ORDER BY id'
  ).all();

  return {
    header: {
      profileImage: headerRow.profile_image,
      name: headerRow.name,
      class1: headerRow.class1,
      class2: headerRow.class2,
      race: headerRow.race,
      background: headerRow.background,
      alignment: headerRow.alignment,
      level: headerRow.level,
      player: headerRow.player
    },
    stats: {
      str: statsRow.str,
      dex: statsRow.dex,
      con: statsRow.con,
      int: statsRow.int,
      wis: statsRow.wis,
      cha: statsRow.cha
    },
    combat: {
      ac: combatRow.ac,
      speed: combatRow.speed,
      maxHitPoints: combatRow.max_hit_points,
      currentHitPoints: combatRow.current_hit_points,
      temporaryHitPoints: combatRow.temporary_hit_points,
      deathSaveSuccesses: combatRow.death_save_successes,
      deathSaveFailures: combatRow.death_save_failures,
      honorScore: combatRow.honor_score,
      honor: combatRow.honor,
      sanityScore: combatRow.sanity_score,
      sanity: combatRow.sanity,
      occult: combatRow.occult,
      occultBonus: combatRow.occult_bonus,
      passive: combatRow.passive,
      profBonus: combatRow.prof_bonus,
      heroPoints: combatRow.hero_points
    },
    skills,
    skillBonuses,
    notes: {
      content: notesRow?.content ?? ''
    },
    inventory: {
      proficiencies,
      items,
      equipment
    },
    actions: {
      statuses,
      attacks,
      features,
      traits
    }
  };
};

const writeCharacterStateToDb = (state) => {
  const database = getDatabase();
  if (!database) return false;
  try {
    seedFromState(database, state);
    return true;
  } catch {
    return false;
  }
};

ipcMain.on('set-unsaved-changes', (_event, value) => {
  hasUnsavedChanges = Boolean(value);
});

ipcMain.handle('get-character-state', () => {
  try {
    return readInitialStateFromDb() || null;
  } catch {
    return null;
  }
});

ipcMain.handle('save-character-state', (_event, state) => writeCharacterStateToDb(state));

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Scheda D&D",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  Menu.setApplicationMenu(null);

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const appPath = app.getAppPath();
    const asarPath = appPath.endsWith('.asar') ? appPath : path.join(process.resourcesPath, 'app.asar');
    const candidates = [
      path.join(asarPath, 'dist', 'index.html'),
      path.join(asarPath, 'index.html'),
      path.join(process.resourcesPath, 'dist', 'index.html'),
    ];
    const indexPath = candidates.find((candidate) => fs.existsSync(candidate));
    if (indexPath) {
      mainWindow.loadFile(indexPath);
    } else {
      dialog.showErrorBox(
        'Errore di caricamento',
        `Nessun index.html trovato.\nControllati:\n${candidates.join('\n')}`
      );
    }
  }

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    dialog.showErrorBox(
      'Errore di caricamento \n${errorCode}',
      `Impossibile caricare l'app.\n${errorDescription}\nURL: ${validatedURL}`
    );
  });

  mainWindow.maximize();

  mainWindow.on('close', (event) => {
    if (!hasUnsavedChanges) return;
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'warning',
      buttons: ['Annulla', 'Chiudi senza salvare'],
      defaultId: 0,
      cancelId: 0,
      title: 'Modifiche non salvate',
      message: 'Hai modifiche non salvate. Vuoi chiudere senza salvare?'
    });
    if (choice === 0) {
      event.preventDefault();
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (db) {
    db.close();
    db = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
