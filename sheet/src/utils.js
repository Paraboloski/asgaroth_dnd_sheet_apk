import { DEFAULT_STATE } from './init.js'

const clone = (value) => JSON.parse(JSON.stringify(value))

const getIpcRenderer = () => {
  if (typeof window === 'undefined') return null
  try {
    const electron = window.require ? window.require('electron') : null
    return electron?.ipcRenderer ?? null
  } catch {
    return null
  }
}

export const createInitialCharacterState = () => clone(DEFAULT_STATE)

export const fetchCharacterState = async () => {
  const ipcRenderer = getIpcRenderer()
  if (!ipcRenderer?.invoke) return clone(DEFAULT_STATE)
  try {
    const state = await ipcRenderer.invoke('get-character-state')
    return state ? clone(state) : clone(DEFAULT_STATE)
  } catch {
    return clone(DEFAULT_STATE)
  }
}

export const saveCharacterState = async (state) => {
  const ipcRenderer = getIpcRenderer()
  if (!ipcRenderer?.invoke) return false
  try {
    return Boolean(await ipcRenderer.invoke('save-character-state', state))
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

  if (listName === 'items') {
    newItem.label = 'Nuovo Oggetto'
    newItem.value = 'x1'
    newItem.description = 'Descrizione...'
  } else {
    newItem.label = 'Nuovo:'
    newItem.value = 'Valore...'
  }

  return newItem
}

export const createActionEntry = (listName) => {
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