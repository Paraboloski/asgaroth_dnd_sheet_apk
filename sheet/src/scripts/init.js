export const BASE_ACTION_STATUSES = [
  {
    "id": "status-accecato",
    "name": "Accecato",
    "description": "Non vedi. Fallisci sempre prove basate sulla vista. Svantaggio ai TPC. Vantaggio ai tiri subiti.",
    "active": false,
    "custom": false
  },
  {
    "id": "status-avvelenato",
    "name": "Avvelenato",
    "description": "Svantaggio ai TPC e alle prove di caratteristica.",
    "active": false,
    "custom": false
  },
  {
    "id": "status-affascinato",
    "name": "Affascinato",
    "description": "Non puoi attaccare colui che ti ha affascinato, che avrà vantaggio nelle interazioni sociali contro di te.",
    "active": false,
    "custom": false
  },
  {
    "id": "status-atterrato",
    "name": "Atterrato",
    "description": "Movimento limitato, puoi solo strisciare. TPC subiti entro 1,5m hanno sempre vantaggio, altrimenti sempre svantaggio.",
    "active": false,
    "custom": false
  },
  {
    "id": "status-incosciente",
    "name": "Paralizzato",
    "description": "Incapace di agire. Fallisci sempre TS Forza/Destrezza. TPC subiti sempre con vantaggio.",
    "active": false,
    "custom": false
  },
  {
    "id": "status-incapacitato",
    "name": "Incapacitato",
    "description": "Non può compiere azioni o reazioni.",
    "active": false,
    "custom": false
  },
  {
    "id": "status-invisibile",
    "name": "Invisibile",
    "description": "Non visibile senza mezzi speciali. TPC sferrati con vantaggio, quelli subiti con svantaggio.",
    "active": false,
    "custom": false
  },
  {
    "id": "status-pietrificato",
    "name": "Pietrificato",
    "description": "Trasformato in pietra. Incapace di agire ma resistente ai danni.",
    "active": false,
    "custom": false
  },
  {
    "id": "status-spaventato",
    "name": "Spaventato",
    "description": "Svantaggio a prove e TPC in presenza della fonte. Non può avvicinarsi ad essa.",
    "active": false,
    "custom": false
  },
  {
    "id": "status-trattenuto",
    "name": "Trattenuto",
    "description": "Velocità 0m. TPC subiti con vantaggio. TPC sferrati con svantaggio. Svantaggio ai TS Destrezza.",
    "active": false,
    "custom": false
  }
]

export const BASE_ACTION_STATUS_IDS = new Set(BASE_ACTION_STATUSES.map((status) => status.id))

export const createDefaultStatuses = () => BASE_ACTION_STATUSES.map((status) => ({ ...status }))

export const DEFAULT_STATE = {
  header: {
    profileImage: '',
    name: 'Nome Personaggio',
    class1: 'Classe 1',
    class2: 'Classe 2',
    race: 'Razza',
    background: 'Background',
    alignment: 'Allineamento',
    level: '1',
    player: 'Tuo Nome'
  },
  stats: {
    str: '10',
    dex: '10',
    con: '10',
    int: '10',
    wis: '10',
    cha: '10'
  },
  combat: {
    ac: '10',
    armorBonus: '+0',
    speed: '9',
    maxHitPoints: '10',
    currentHitPoints: '10',
    temporaryHitPoints: '0',
    deathSaveSuccesses: '0',
    deathSaveFailures: '0',
    honorScore: '10',
    honor: '+0',
    sanityScore: '10',
    sanity: '+0',
    occult: '+2',
    occultBonus: '+0',
    passive: '10',
    profBonus: '+2',
    heroPoints: '0',
    classPoints: '0',
    weakeningLevel: '0'
  },
  skills: {},
  skillBonuses: {},
  notes: {
    content: ''
  },
  inventory: {
    proficiencies: [],
    items: [],
    equipment: []
  },
  actions: {
    statuses: [],
    attacks: [],
    features: [],
    traits: []
  }
}

export default DEFAULT_STATE
