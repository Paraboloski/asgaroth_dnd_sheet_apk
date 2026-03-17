const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const Database = require('better-sqlite3');

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS header (
    id INTEGER PRIMARY KEY,
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
    speed TEXT,
    max_hit_points TEXT,
    current_hit_points TEXT,
    temporary_hit_points TEXT,
    honor TEXT,
    sanity TEXT,
    occult TEXT,
    passive TEXT,
    prof_bonus TEXT,
    hero_points TEXT
  );
  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    proficient INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS inventory_proficiencies (
    id INTEGER PRIMARY KEY,
    label TEXT,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS inventory_items (
    id INTEGER PRIMARY KEY,
    label TEXT,
    value TEXT,
    description TEXT
  );
  CREATE TABLE IF NOT EXISTS inventory_equipment (
    id INTEGER PRIMARY KEY,
    label TEXT,
    value TEXT
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
`;

const seedFromState = (database, state) => {
  const run = database.transaction(() => {
    database.exec(`
      DELETE FROM header;
      DELETE FROM stats;
      DELETE FROM combat;
      DELETE FROM skills;
      DELETE FROM inventory_proficiencies;
      DELETE FROM inventory_items;
      DELETE FROM inventory_equipment;
      DELETE FROM actions_attacks;
      DELETE FROM actions_features;
      DELETE FROM actions_traits;
    `);

    database.prepare(`
      INSERT INTO header (id, name, class1, class2, race, background, alignment, level, player)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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
        id, ac, speed, max_hit_points, current_hit_points, temporary_hit_points,
        honor, sanity, occult, passive, prof_bonus, hero_points
      )
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      state.combat.ac,
      state.combat.speed,
      state.combat.maxHitPoints,
      state.combat.currentHitPoints,
      state.combat.temporaryHitPoints,
      state.combat.honor,
      state.combat.sanity,
      state.combat.occult,
      state.combat.passive,
      state.combat.profBonus,
      state.combat.heroPoints
    );

    const insertSkill = database.prepare('INSERT OR REPLACE INTO skills (id, proficient) VALUES (?, ?)');
    Object.entries(state.skills || {}).forEach(([id, proficient]) => {
      insertSkill.run(id, proficient ? 1 : 0);
    });

    const insertProficiency = database.prepare(
      'INSERT INTO inventory_proficiencies (id, label, value) VALUES (?, ?, ?)'
    );
    state.inventory.proficiencies.forEach((item) => {
      insertProficiency.run(item.id, item.label, item.value);
    });

    const insertItem = database.prepare(
      'INSERT INTO inventory_items (id, label, value, description) VALUES (?, ?, ?, ?)'
    );
    state.inventory.items.forEach((item) => {
      insertItem.run(item.id, item.label, item.value, item.description);
    });

    const insertEquipment = database.prepare(
      'INSERT INTO inventory_equipment (id, label, value) VALUES (?, ?, ?)'
    );
    state.inventory.equipment.forEach((item) => {
      insertEquipment.run(item.id, item.label, item.value);
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
  });

  run();
};

const resolveDefaultState = async () => {
  const statePath = path.join(__dirname, '..', 'src', 'init.js');
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
  seedFromState,
  seedDatabaseFile
};
