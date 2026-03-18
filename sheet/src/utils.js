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

  normalized.combat.deathSaveSuccesses = sanitizeDeathSaveCount(normalized.combat.deathSaveSuccesses)
  normalized.combat.deathSaveFailures = sanitizeDeathSaveCount(normalized.combat.deathSaveFailures)

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

export const notifyUnsavedChanges = (hasUnsavedChanges) => {
  const ipcRenderer = getIpcRenderer()
  if (ipcRenderer?.send) {
    ipcRenderer.send('set-unsaved-changes', Boolean(hasUnsavedChanges))
  }
}

export const formatSignedNumber = (value) => (value >= 0 ? `+${value}` : value.toString())

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
  } else if (listName === 'features') {
    newRow.name = 'Nuovo Elemento'
    newRow.effect = 'Descrizione.'
  } else if (listName === 'traits') {
    newRow.name = 'Nuovo Tratto'
    newRow.description = 'Descrizione.'
  }

  return newRow
}
