const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const Database = require('better-sqlite3');

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS header (
    id INTEGER PRIMARY KEY,
    profile_image TEXT,
    name TEXT,
    class1 TEXT,
    class2 TEXT,
    race TEXT,
    background TEXT,
    alignment TEXT,
    level TEXT,
    player TEXT
  );
  CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY,
    str TEXT,
    dex TEXT,
    con TEXT,
    int TEXT,
    wis TEXT,
    cha TEXT
  );
  CREATE TABLE IF NOT EXISTS combat (
    id INTEGER PRIMARY KEY,
    ac TEXT,
    armor_bonus TEXT,
    speed TEXT,
    max_hit_points TEXT,
    current_hit_points TEXT,
    temporary_hit_points TEXT,
    death_save_successes TEXT,
    death_save_failures TEXT,
    honor_score TEXT,
    honor TEXT,
    sanity_score TEXT,
    sanity TEXT,
    occult TEXT,
    occult_bonus TEXT,
    passive TEXT,
    prof_bonus TEXT,
    hero_points TEXT,
    class_points TEXT,
    weakening_level TEXT
  );
  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    proficient INTEGER NOT NULL DEFAULT 0,
    bonus TEXT
  );
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY,
    content TEXT
  );
  CREATE TABLE IF NOT EXISTS inventory_proficiencies (
    id INTEGER PRIMARY KEY,
    label TEXT,
    value TEXT,
    name TEXT,
    description TEXT
  );
  CREATE TABLE IF NOT EXISTS inventory_items (
    id INTEGER PRIMARY KEY,
    label TEXT,
    value TEXT,
    description TEXT,
    name TEXT,
    quantity TEXT
  );
  CREATE TABLE IF NOT EXISTS inventory_equipment (
    id INTEGER PRIMARY KEY,
    label TEXT,
    value TEXT,
    name TEXT,
    description TEXT,
    bonus TEXT
  );
  CREATE TABLE IF NOT EXISTS actions_attacks (
    id INTEGER PRIMARY KEY,
    name TEXT,
    bonus TEXT,
    damage TEXT,
    notes TEXT
  );
  CREATE TABLE IF NOT EXISTS actions_features (
    id INTEGER PRIMARY KEY,
    name TEXT,
    effect TEXT
  );
  CREATE TABLE IF NOT EXISTS actions_traits (
    id INTEGER PRIMARY KEY,
    name TEXT,
    description TEXT
  );
  CREATE TABLE IF NOT EXISTS actions_statuses (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    active INTEGER NOT NULL DEFAULT 0,
    custom INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
`;

const ensureColumn = (database, tableName, columnName, definition) => {
  const columns = database.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some((column) => column.name === columnName);
  if (!hasColumn) {
    database.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
};

const applyMigrations = (database) => {
  ensureColumn(database, 'header', 'profile_image', 'TEXT');
  ensureColumn(database, 'combat', 'death_save_successes', 'TEXT');
  ensureColumn(database, 'combat', 'death_save_failures', 'TEXT');
  ensureColumn(database, 'combat', 'armor_bonus', 'TEXT');
  ensureColumn(database, 'combat', 'honor_score', 'TEXT');
  ensureColumn(database, 'combat', 'sanity_score', 'TEXT');
  ensureColumn(database, 'combat', 'occult_bonus', 'TEXT');
  ensureColumn(database, 'combat', 'class_points', 'TEXT');
  ensureColumn(database, 'combat', 'weakening_level', 'TEXT');
  ensureColumn(database, 'skills', 'bonus', 'TEXT');
  database.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY,
      content TEXT
    );
  `);
  ensureColumn(database, 'notes', 'content', 'TEXT');
  ensureColumn(database, 'inventory_proficiencies', 'name', 'TEXT');
  ensureColumn(database, 'inventory_proficiencies', 'description', 'TEXT');
  ensureColumn(database, 'inventory_items', 'name', 'TEXT');
  ensureColumn(database, 'inventory_items', 'quantity', 'TEXT');
  ensureColumn(database, 'inventory_equipment', 'name', 'TEXT');
  ensureColumn(database, 'inventory_equipment', 'description', 'TEXT');
  ensureColumn(database, 'inventory_equipment', 'bonus', 'TEXT');
  database.exec(`
    UPDATE inventory_proficiencies
    SET
      name = COALESCE(name, label, ''),
      description = COALESCE(description, value, '')
    WHERE name IS NULL OR description IS NULL;

    UPDATE inventory_items
    SET
      name = COALESCE(name, label, ''),
      quantity = COALESCE(quantity, value, '0'),
      description = COALESCE(description, '')
    WHERE name IS NULL OR quantity IS NULL OR description IS NULL;

    UPDATE inventory_equipment
    SET
      name = COALESCE(name, label, ''),
      description = COALESCE(description, ''),
      bonus = COALESCE(bonus, value, '+0')
    WHERE name IS NULL OR description IS NULL OR bonus IS NULL;
  `);
  database.exec(`
    CREATE TABLE IF NOT EXISTS actions_statuses (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      active INTEGER NOT NULL DEFAULT 0,
      custom INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);
  ensureColumn(database, 'actions_statuses', 'description', 'TEXT');
  ensureColumn(database, 'actions_statuses', 'active', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(database, 'actions_statuses', 'custom', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(database, 'actions_statuses', 'sort_order', 'INTEGER NOT NULL DEFAULT 0');
};

const seedFromState = (database, state) => {
  const run = database.transaction(() => {
    database.exec(`
      DELETE FROM header;
      DELETE FROM stats;
      DELETE FROM combat;
      DELETE FROM skills;
      DELETE FROM notes;
      DELETE FROM inventory_proficiencies;
      DELETE FROM inventory_items;
      DELETE FROM inventory_equipment;
      DELETE FROM actions_attacks;
      DELETE FROM actions_features;
      DELETE FROM actions_traits;
      DELETE FROM actions_statuses;
    `);

    database.prepare(`
      INSERT INTO header (id, profile_image, name, class1, class2, race, background, alignment, level, player)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      state.header.profileImage ?? '',
      state.header.name,
      state.header.class1,
      state.header.class2,
      state.header.race,
      state.header.background,
      state.header.alignment,
      state.header.level,
      state.header.player
    );

    database.prepare(`
      INSERT INTO stats (id, str, dex, con, int, wis, cha)
      VALUES (1, ?, ?, ?, ?, ?, ?)
    `).run(
      state.stats.str,
      state.stats.dex,
      state.stats.con,
      state.stats.int,
      state.stats.wis,
      state.stats.cha
    );

    database.prepare(`
      INSERT INTO combat (
        id, ac, armor_bonus, speed, max_hit_points, current_hit_points, temporary_hit_points,
        death_save_successes, death_save_failures,
        honor_score, honor, sanity_score, sanity,
        occult, occult_bonus, passive, prof_bonus, hero_points, class_points, weakening_level
      )
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      state.combat.ac,
      state.combat.armorBonus,
      state.combat.speed,
      state.combat.maxHitPoints,
      state.combat.currentHitPoints,
      state.combat.temporaryHitPoints,
      state.combat.deathSaveSuccesses,
      state.combat.deathSaveFailures,
      state.combat.honorScore,
      state.combat.honor,
      state.combat.sanityScore,
      state.combat.sanity,
      state.combat.occult,
      state.combat.occultBonus,
      state.combat.passive,
      state.combat.profBonus,
      state.combat.heroPoints,
      state.combat.classPoints,
      state.combat.weakeningLevel
    );

    const insertSkill = database.prepare('INSERT OR REPLACE INTO skills (id, proficient, bonus) VALUES (?, ?, ?)');
    const skillIds = new Set([
      ...Object.keys(state.skills || {}),
      ...Object.keys(state.skillBonuses || {})
    ]);
    skillIds.forEach((id) => {
      const proficient = Boolean(state.skills?.[id]);
      const bonus = typeof state.skillBonuses?.[id] === 'string' ? state.skillBonuses[id].trim() : '';
      if (!proficient && bonus === '') return;
      insertSkill.run(id, proficient ? 1 : 0, bonus);
    });

    database.prepare(`
      INSERT INTO notes (id, content)
      VALUES (1, ?)
    `).run(state.notes?.content ?? '');

    const insertProficiency = database.prepare(
      'INSERT INTO inventory_proficiencies (id, label, value, name, description) VALUES (?, ?, ?, ?, ?)'
    );
    state.inventory.proficiencies.forEach((item) => {
      insertProficiency.run(item.id, item.name, item.description, item.name, item.description);
    });

    const insertItem = database.prepare(
      'INSERT INTO inventory_items (id, label, value, description, name, quantity) VALUES (?, ?, ?, ?, ?, ?)'
    );
    state.inventory.items.forEach((item) => {
      insertItem.run(item.id, item.name, item.quantity, item.description ?? '', item.name, item.quantity);
    });

    const insertEquipment = database.prepare(
      'INSERT INTO inventory_equipment (id, label, value, name, description, bonus) VALUES (?, ?, ?, ?, ?, ?)'
    );
    state.inventory.equipment.forEach((item) => {
      insertEquipment.run(item.id, item.name, item.bonus, item.name, item.description ?? '', item.bonus);
    });

    const insertAttack = database.prepare(
      'INSERT INTO actions_attacks (id, name, bonus, damage, notes) VALUES (?, ?, ?, ?, ?)'
    );
    state.actions.attacks.forEach((attack) => {
      insertAttack.run(attack.id, attack.name, attack.bonus, attack.damage, attack.notes);
    });

    const insertFeature = database.prepare(
      'INSERT INTO actions_features (id, name, effect) VALUES (?, ?, ?)'
    );
    state.actions.features.forEach((feature) => {
      insertFeature.run(feature.id, feature.name, feature.effect);
    });

    const insertTrait = database.prepare(
      'INSERT INTO actions_traits (id, name, description) VALUES (?, ?, ?)'
    );
    state.actions.traits.forEach((trait) => {
      insertTrait.run(trait.id, trait.name, trait.description);
    });

    const insertStatus = database.prepare(
      'INSERT INTO actions_statuses (id, name, description, active, custom, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const statuses = Array.isArray(state.actions?.statuses) ? state.actions.statuses : [];
    statuses.forEach((status, index) => {
      insertStatus.run(
        String(status.id),
        status.name,
        status.description,
        status.active ? 1 : 0,
        status.custom ? 1 : 0,
        index
      );
    });
  });

  run();
};

const resolveDefaultState = async () => {
  const statePath = path.join(__dirname, '..', 'src', 'scripts', 'init.js');
  const module = await import(pathToFileURL(statePath).href);
  return module.DEFAULT_STATE || module.default;
};

const seedDatabaseFile = async (dbPath = path.join(__dirname, 'db.sqlite'), state) => {
  const resolvedState = state ?? (await resolveDefaultState());
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  const db = new Database(dbPath);
  db.exec(SCHEMA_SQL);
  applyMigrations(db);
  seedFromState(db, resolvedState);
  db.close();
  return dbPath;
};

if (require.main === module) {
  seedDatabaseFile()
    .then((dbPath) => {
      console.log(`db.sqlite rigenerato in ${dbPath}`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  SCHEMA_SQL,
  applyMigrations,
  seedFromState,
  seedDatabaseFile
};
