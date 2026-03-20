import { DEFAULT_STATE } from './init.js'
import { BASE_ACTION_STATUSES, BASE_ACTION_STATUS_IDS, createDefaultStatuses } from './init.js'

const clone = (value) => JSON.parse(JSON.stringify(value))
const DEFAULT_CUSTOM_STATUS_NAME = 'Nuovo Status'
const DEFAULT_CUSTOM_STATUS_DESCRIPTION = 'Descrizione dello status.'
const DEFAULT_INVENTORY_ITEM_NAME = ''
const DEFAULT_INVENTORY_ITEM_DESCRIPTION = ''
const DEFAULT_INVENTORY_ITEM_QUANTITY = '1'
const DEFAULT_EQUIPMENT_BONUS = '+0'

const coerceString = (value, fallback = '') => (typeof value === 'string' ? value : fallback)

const coerceNumericId = (value, fallback) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

const sanitizeDeathSaveCount = (value) => {
  const normalizedValue = typeof value === 'string' ? value : `${value ?? ''}`
  return sanitizeUnsignedNumber(normalizedValue, 3) || '0'
}

const sanitizeWeakeningLevel = (value) => {
  const normalizedValue = typeof value === 'string' ? value : `${value ?? ''}`
  return sanitizeUnsignedNumber(normalizedValue, 6) || '0'
}

const getIpcRenderer = () => {
  if (typeof window === 'undefined') return null
  try {
    const electron = window.require ? window.require('electron') : null
    return electron?.ipcRenderer ?? null
  } catch {
    return null
  }
}

const normalizeStatuses = (statuses) => {
  const defaultStatuses = createDefaultStatuses()
  if (!Array.isArray(statuses)) return defaultStatuses

  const savedBaseStatuses = new Map()
  const customStatuses = []
  const usedIds = new Set(defaultStatuses.map((status) => status.id))

  statuses.forEach((status, index) => {
    if (!status || typeof status !== 'object') return

    const resolvedId = typeof status.id === 'string' || typeof status.id === 'number'
      ? String(status.id)
      : ''

    if (BASE_ACTION_STATUS_IDS.has(resolvedId)) {
      savedBaseStatuses.set(resolvedId, status)
      return
    }

    const nextId = resolvedId && !usedIds.has(resolvedId)
      ? resolvedId
      : `status-custom-${index + 1}`

    usedIds.add(nextId)
    customStatuses.push({
      id: nextId,
      name: typeof status.name === 'string' ? status.name : DEFAULT_CUSTOM_STATUS_NAME,
      description: typeof status.description === 'string' ? status.description : DEFAULT_CUSTOM_STATUS_DESCRIPTION,
      active: Boolean(status.active),
      custom: true
    })
  })

  const baseStatuses = BASE_ACTION_STATUSES.map((status) => ({
    ...status,
    active: Boolean(savedBaseStatuses.get(status.id)?.active),
    custom: false
  }))

  return [...baseStatuses, ...customStatuses]
}

const normalizeInventoryEntries = (entries, listName) => {
  if (!Array.isArray(entries)) return []

  return entries.flatMap((entry, index) => {
    const fallbackId = Date.now() + index
    const id = coerceNumericId(entry?.id, fallbackId)

    if (listName === 'proficiencies') {
      return [{
        id,
        name: coerceString(entry?.name, coerceString(entry?.label)),
        description: coerceString(entry?.description, coerceString(entry?.value))
      }]
    }

    if (listName === 'items') {
      const quantity = sanitizeUnsignedNumber(coerceString(entry?.quantity, coerceString(entry?.value))) || DEFAULT_INVENTORY_ITEM_QUANTITY
      if (quantity === '0') return []
      return [{
        id,
        name: coerceString(entry?.name, coerceString(entry?.label)),
        quantity
      }]
    }

    return [{
      id,
      name: coerceString(entry?.name, coerceString(entry?.label)),
      bonus: sanitizeSignedNumber(coerceString(entry?.bonus, coerceString(entry?.value))) || DEFAULT_EQUIPMENT_BONUS
    }]
  })
}

const normalizeSkillBonuses = (bonuses) => {
  if (!bonuses || typeof bonuses !== 'object') return {}

  return Object.fromEntries(
    Object.entries(bonuses).flatMap(([id, value]) => {
      if (typeof id !== 'string' || id.trim() === '') return []
      const sanitizedValue = sanitizeSignedNumber(typeof value === 'string' ? value : `${value ?? ''}`)
      return sanitizedValue ? [[id, sanitizedValue]] : []
    })
  )
}

export const normalizeCharacterState = (state) => {
  const fallback = {
    ...clone(DEFAULT_STATE),
    actions: {
      ...clone(DEFAULT_STATE.actions),
      statuses: createDefaultStatuses()
    }
  }
  if (!state || typeof state !== 'object') return fallback

  const normalized = {
    ...fallback,
    ...state,
    header: {
      ...fallback.header,
      ...(state.header && typeof state.header === 'object' ? state.header : {})
    },
    stats: {
      ...fallback.stats,
      ...(state.stats && typeof state.stats === 'object' ? state.stats : {})
    },
    combat: {
      ...fallback.combat,
      ...(state.combat && typeof state.combat === 'object' ? state.combat : {})
    },
    skills: state.skills && typeof state.skills === 'object' ? { ...state.skills } : fallback.skills,
    skillBonuses: normalizeSkillBonuses(state.skillBonuses),
    notes: {
      ...fallback.notes,
      ...(state.notes && typeof state.notes === 'object' ? state.notes : {})
    },
    inventory: {
      ...fallback.inventory,
      ...(state.inventory && typeof state.inventory === 'object' ? state.inventory : {}),
      proficiencies: normalizeInventoryEntries(state.inventory?.proficiencies, 'proficiencies'),
      items: normalizeInventoryEntries(state.inventory?.items, 'items'),
      equipment: normalizeInventoryEntries(state.inventory?.equipment, 'equipment')
    },
    actions: {
      ...fallback.actions,
      ...(state.actions && typeof state.actions === 'object' ? state.actions : {}),
      statuses: normalizeStatuses(state.actions?.statuses),
      attacks: Array.isArray(state.actions?.attacks)
        ? state.actions.attacks
        : fallback.actions.attacks,
      features: Array.isArray(state.actions?.features)
        ? state.actions.features
        : fallback.actions.features,
      traits: Array.isArray(state.actions?.traits)
        ? state.actions.traits
        : fallback.actions.traits
    }
  }

  if (typeof normalized.header.profileImage !== 'string') {
    normalized.header.profileImage = fallback.header.profileImage
  }

  normalized.header.level = sanitizeUnsignedNumber(
    typeof normalized.header.level === 'string' ? normalized.header.level : `${normalized.header.level ?? ''}`,
    20
  ) || fallback.header.level

  if (typeof normalized.notes.content !== 'string') {
    normalized.notes.content = fallback.notes.content
  }

  normalized.combat.honorScore = sanitizeUnsignedNumber(
    typeof normalized.combat.honorScore === 'string' ? normalized.combat.honorScore : `${normalized.combat.honorScore ?? ''}`
  ) || fallback.combat.honorScore
  normalized.combat.sanityScore = sanitizeUnsignedNumber(
    typeof normalized.combat.sanityScore === 'string' ? normalized.combat.sanityScore : `${normalized.combat.sanityScore ?? ''}`
  ) || fallback.combat.sanityScore
  normalized.combat.honor = formatSignedNumber(calculateModifier(normalized.combat.honorScore))
  normalized.combat.sanity = formatSignedNumber(calculateModifier(normalized.combat.sanityScore))
  normalized.combat.armorBonus = formatSignedNumber(calculateArmorBonusFromEquipment(normalized.inventory.equipment))
  normalized.combat.ac = `${10 + calculateModifier(normalized.stats.dex) + calculateArmorBonusFromEquipment(normalized.inventory.equipment)}`
  normalized.combat.speed = sanitizeUnsignedNumber(
    typeof normalized.combat.speed === 'string' ? normalized.combat.speed : `${normalized.combat.speed ?? ''}`
  ) || fallback.combat.speed
  normalized.combat.classPoints = sanitizeUnsignedNumber(
    typeof normalized.combat.classPoints === 'string' ? normalized.combat.classPoints : `${normalized.combat.classPoints ?? ''}`
  ) || fallback.combat.classPoints
  normalized.combat.heroPoints = sanitizeUnsignedNumber(
    typeof normalized.combat.heroPoints === 'string' ? normalized.combat.heroPoints : `${normalized.combat.heroPoints ?? ''}`
  ) || fallback.combat.heroPoints
  normalized.combat.weakeningLevel = sanitizeWeakeningLevel(normalized.combat.weakeningLevel)
  normalized.combat.occultBonus = sanitizeSignedNumber(
    typeof state.combat?.occultBonus === 'string' ? state.combat.occultBonus : `${state.combat?.occultBonus ?? ''}`
  ) || fallback.combat.occultBonus

  normalized.combat.deathSaveSuccesses = sanitizeDeathSaveCount(normalized.combat.deathSaveSuccesses)
  normalized.combat.deathSaveFailures = sanitizeDeathSaveCount(normalized.combat.deathSaveFailures)
  normalized.combat.profBonus = formatProficiencyBonus(normalized.header.level)
  normalized.combat.passive = `${calculatePassivePerception(
    normalized.stats,
    normalized.skills,
    normalized.skillBonuses,
    normalized.header.level,
    normalized.combat.weakeningLevel
  )}`
  normalized.combat.occult = formatOccultPerception(
    calculateModifier(normalized.stats.wis),
    parseSignedNumber(normalized.combat.sanity),
    calculateProficiencyBonus(normalized.header.level),
    parseSignedNumber(normalized.combat.occultBonus)
  )

  return normalized
}

export const createInitialCharacterState = () => normalizeCharacterState(clone(DEFAULT_STATE))
export const createNormalizedCharacterState = () => normalizeCharacterState(clone(DEFAULT_STATE))

export const fetchCharacterState = async () => {
  const ipcRenderer = getIpcRenderer()
  if (!ipcRenderer?.invoke) return createNormalizedCharacterState()
  try {
    const state = await ipcRenderer.invoke('get-character-state')
    return normalizeCharacterState(state)
  } catch {
    return createNormalizedCharacterState()
  }
}

export const saveCharacterState = async (state) => {
  const ipcRenderer = getIpcRenderer()
  if (!ipcRenderer?.invoke) return false
  try {
    return Boolean(await ipcRenderer.invoke('save-character-state', normalizeCharacterState(state)))
  } catch {
    return false
  }
}

export const showSaveSuccessMessage = async () => {
  const ipcRenderer = getIpcRenderer()
  if (!ipcRenderer?.invoke) {
    alert("Scheda salvata con successo! Puoi chiudere l'app.")
    return
  }

  try {
    await ipcRenderer.invoke('show-save-success-message')
  } catch {
    alert("Scheda salvata con successo! Puoi chiudere l'app.")
  }
}

export const notifyUnsavedChanges = (hasUnsavedChanges) => {
  const ipcRenderer = getIpcRenderer()
  if (ipcRenderer?.send) {
    ipcRenderer.send('set-unsaved-changes', Boolean(hasUnsavedChanges))
  }
}

export const formatSignedNumber = (value) => (value >= 0 ? `+${value}` : value.toString())

export const calculateProficiencyBonus = (level) => {
  const parsedLevel = Number.parseInt(level, 10)
  const normalizedLevel = Number.isFinite(parsedLevel)
    ? Math.min(Math.max(parsedLevel, 1), 20)
    : 1

  return Math.floor((normalizedLevel - 1) / 4) + 2
}

export const formatProficiencyBonus = (level) => formatSignedNumber(calculateProficiencyBonus(level))

export const calculateArmorBonusFromEquipment = (equipment = []) => {
  if (!Array.isArray(equipment)) return 0

  return equipment.reduce((total, item) => total + parseSignedNumber(item?.bonus ?? '+0'), 0)
}

export const calculateWeakeningPenalty = (weakeningLevel) => {
  const parsedLevel = Number.parseInt(weakeningLevel, 10)
  if (!Number.isFinite(parsedLevel)) return 0
  return Math.max(0, Math.min(parsedLevel, 6))
}

export const calculateSkillTotal = (
  statModifier,
  isProficient,
  proficiencyBonus,
  manualBonus = 0,
  weakeningLevel = 0
) => statModifier + (isProficient ? proficiencyBonus : 0) + manualBonus - calculateWeakeningPenalty(weakeningLevel)

export const calculatePassivePerception = (
  stats,
  skills,
  skillBonuses,
  level,
  weakeningLevel = 0
) => {
  const wisdomModifier = calculateModifier(stats?.wis ?? '10')
  const proficiencyBonus = calculateProficiencyBonus(level)
  const manualBonus = parseSignedNumber(skillBonuses?.perception ?? '+0')
  const skillTotal = calculateSkillTotal(
    wisdomModifier,
    Boolean(skills?.perception),
    proficiencyBonus,
    manualBonus,
    weakeningLevel
  )
  return skillTotal + 10
}

export const calculateOccultPerception = (
  wisdomModifier,
  sanityModifier,
  proficiencyBonus,
  clickBonus = 0
) => wisdomModifier - sanityModifier + proficiencyBonus + clickBonus

export const formatOccultPerception = (
  wisdomModifier,
  sanityModifier,
  proficiencyBonus,
  clickBonus = 0
) => formatSignedNumber(calculateOccultPerception(
  wisdomModifier,
  sanityModifier,
  proficiencyBonus,
  clickBonus
))

export const calculateModifier = (score) => {
  const parsedScore = parseInt(score, 10)
  if (Number.isNaN(parsedScore)) return 0
  return Math.floor((parsedScore - 10) / 2)
}

export const parseSignedNumber = (bonusText) => {
  const match = bonusText.match(/-?\d+/)
  return match ? parseInt(match[0], 10) : 0
}

export const sanitizeUnsignedNumber = (value, maxValue = 999) => {
  const match = value.match(/\d+/)
  if (!match) return ''
  const number = Math.min(parseInt(match[0], 10), maxValue)
  return `${number}`
}

export const sanitizeSignedNumber = (value, maxValue = 999) => {
  const match = value.match(/[+-]?\d+/)
  if (!match) return ''
  const parsedNumber = parseInt(match[0], 10)
  const clamped = Math.min(Math.abs(parsedNumber), maxValue)
  return parsedNumber >= 0 ? `+${clamped}` : `-${clamped}`
}

export const clampCurrentHitPoints = (currentValue, maxValue, maxLimit = 999) => {
  if (!maxValue) return currentValue
  const current = currentValue ? parseInt(currentValue, 10) : 0
  const max = maxValue ? parseInt(maxValue, 10) : 0
  return `${Math.min(current, max, maxLimit)}`
}

export const addItem = (list, item) => [...list, item]

export const removeItemById = (list, id) => list.filter((item) => item.id !== id)

export const updateItemById = (list, id, updateFn) =>
  list.map((item) => (item.id === id ? updateFn(item) : item))

export const createInventoryItem = (listName) => {
  const newItem = { id: Date.now() }

  if (listName === 'proficiencies') {
    newItem.name = DEFAULT_INVENTORY_ITEM_NAME
    newItem.description = DEFAULT_INVENTORY_ITEM_DESCRIPTION
  } else if (listName === 'items') {
    newItem.name = DEFAULT_INVENTORY_ITEM_NAME
    newItem.quantity = DEFAULT_INVENTORY_ITEM_QUANTITY
  } else {
    newItem.name = DEFAULT_INVENTORY_ITEM_NAME
    newItem.bonus = DEFAULT_EQUIPMENT_BONUS
  }

  return newItem
}

export const createActionEntry = (listName) => {
  if (listName === 'statuses') {
    return {
      id: `status-custom-${Date.now()}`,
      name: DEFAULT_CUSTOM_STATUS_NAME,
      description: DEFAULT_CUSTOM_STATUS_DESCRIPTION,
      active: false,
      custom: true
    }
  }

  const newRow = { id: Date.now() }

  if (listName === 'attacks') {
    newRow.name = 'Nuovo Attacco'
    newRow.bonus = '+0'
    newRow.damage = '1d?'
    newRow.notes = '-'
  } else {
    newRow.name = 'Nuovo Elemento'
    newRow.description = 'Descrizione.'
  }

  return newRow
}
