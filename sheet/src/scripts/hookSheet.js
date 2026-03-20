import { useEffect, useMemo, useRef, useState } from 'react'
import {
  calculateArmorBonusFromEquipment,
  createInitialCharacterState,
  calculateModifier,
  calculatePassivePerception,
  calculateProficiencyBonus,
  formatProficiencyBonus,
  fetchCharacterState,
  normalizeCharacterState,
  saveCharacterState,
  showSaveSuccessMessage,
  notifyUnsavedChanges,
  addItem,
  createActionEntry,
  createInventoryItem,
  removeItemById,
  updateItemById
} from './utils'

const STATUS_EMOJIS_BY_ID = {
  'status-accecato': '🙈',
  'status-avvelenato': '🤢',
  'status-affascinato': '💘',
  'status-atterrato': '⬇️',
  'status-incosciente': '🧊',
  'status-incapacitato': '🚫',
  'status-invisibile': '👻',
  'status-pietrificato': '🪨',
  'status-spaventato': '😱',
  'status-trattenuto': '⛓️'
}

const CUSTOM_STATUS_EMOJI = '❔'
const STATUS_EMOJI_ROTATION_MS = 2000

export default function useCharacterSheet() {
  const initialStateRef = useRef(createInitialCharacterState())
  const [characterData, setCharacterData] = useState(() => initialStateRef.current)
  const characterDataRef = useRef(initialStateRef.current)
  const lastSavedRef = useRef(JSON.stringify(initialStateRef.current))
  const importInputRef = useRef(null)
  const [isBugModalOpen, setIsBugModalOpen] = useState(false)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [bugReporterName, setBugReporterName] = useState('')
  const [bugDescription, setBugDescription] = useState('')
  const [statusIndicatorId, setStatusIndicatorId] = useState(null)

  useEffect(() => {
    let isActive = true
    fetchCharacterState().then((state) => {
      if (!isActive) return
      setCharacterData(state)
      characterDataRef.current = state
      lastSavedRef.current = JSON.stringify(state)
    })
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    characterDataRef.current = characterData
  }, [characterData])

  const statModifiers = useMemo(() => {
    const modifiers = {}
    for (const key in characterData.stats) {
      modifiers[key] = calculateModifier(characterData.stats[key])
    }
    return modifiers
  }, [characterData.stats])

  const proficiencyBonusValue = useMemo(
    () => calculateProficiencyBonus(characterData.header.level),
    [characterData.header.level],
  )

  const weakeningLevelValue = useMemo(
    () => Number.parseInt(characterData.combat?.weakeningLevel ?? '0', 10) || 0,
    [characterData.combat?.weakeningLevel],
  )

  const passivePerceptionValue = useMemo(
    () => calculatePassivePerception(
      characterData.stats,
      characterData.skills,
      characterData.skillBonuses,
      characterData.header.level,
      characterData.combat?.weakeningLevel ?? '0'
    ),
    [
      characterData.stats,
      characterData.skills,
      characterData.skillBonuses,
      characterData.header.level,
      characterData.combat?.weakeningLevel
    ],
  )

  const armorBonusValue = useMemo(
    () => calculateArmorBonusFromEquipment(characterData.inventory?.equipment),
    [characterData.inventory?.equipment],
  )

  const serializedState = useMemo(() => JSON.stringify(characterData), [characterData])
  const activeStatuses = useMemo(() => {
    const statuses = Array.isArray(characterData.actions.statuses) ? characterData.actions.statuses : []

    return statuses
      .filter((status) => Boolean(status.active))
      .map((status) => ({
        id: String(status.id),
        name: status.name || 'Status',
        emoji: status.custom ? CUSTOM_STATUS_EMOJI : (STATUS_EMOJIS_BY_ID[String(status.id)] || CUSTOM_STATUS_EMOJI)
      }))
  }, [characterData.actions.statuses])

  const activeStatusIndicator = useMemo(() => {
    if (activeStatuses.length === 0) return null

    return activeStatuses.find((status) => status.id === statusIndicatorId) ?? activeStatuses[0]
  }, [activeStatuses, statusIndicatorId])

  const updateSectionField = (section, key, value) => {
    setCharacterData((prev) => {
      const nextState = {
        ...prev,
        [section]: { ...prev[section], [key]: value }
      }

      if (section === 'header' && key === 'level') {
        nextState.combat = {
          ...nextState.combat,
          profBonus: formatProficiencyBonus(value)
        }
      }

      return nextState
    })
  }

  const toggleSkill = (skillId) => {
    setCharacterData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [skillId]: !prev.skills[skillId] }
    }))
  }

  const updateSkillBonus = (skillId, value) => {
    setCharacterData((prev) => ({
      ...prev,
      skillBonuses: { ...prev.skillBonuses, [skillId]: value }
    }))
  }

  const flushActiveEditable = async () => {
    const activeElement = document.activeElement
    if (!(activeElement instanceof HTMLElement)) return
    if (!activeElement.isContentEditable) return

    activeElement.blur()
    await new Promise((resolve) => window.setTimeout(resolve, 0))
  }

  const handleSave = async () => {
    try {
      await flushActiveEditable()
      const stateToSave = characterDataRef.current
      const success = await saveCharacterState(stateToSave)
      if (success) {
        lastSavedRef.current = JSON.stringify(stateToSave)
        notifyUnsavedChanges(false)
        await showSaveSuccessMessage()
      } else {
        alert("Errore: Impossibile salvare la scheda. Controlla il processo principale di Electron.")
      }
    } catch {
      alert("Si è verificato un errore imprevisto durante il salvataggio.")
    }
  }

  const handleExport = () => {
    const fileName = `scheda-${new Date().toISOString().slice(0, 10)}.json`
    const payload = JSON.stringify(normalizeCharacterState(characterData), null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const isValidImport = (data) =>
    data &&
    typeof data === 'object' &&
    data.header &&
    data.stats &&
    data.combat &&
    (data.notes === undefined || (data.notes && typeof data.notes === 'object')) &&
    data.inventory &&
    Array.isArray(data.inventory.proficiencies) &&
    Array.isArray(data.inventory.items) &&
    Array.isArray(data.inventory.equipment) &&
    data.actions &&
    (data.actions.statuses === undefined || Array.isArray(data.actions.statuses)) &&
    Array.isArray(data.actions.attacks) &&
    Array.isArray(data.actions.features) &&
    Array.isArray(data.actions.traits)

  const handleImportFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (!isValidImport(parsed)) {
          alert('File JSON non valido o incompleto.')
          return
        }
        setCharacterData(normalizeCharacterState(parsed))
      } catch {
        alert('Impossibile leggere il file JSON.')
      } finally {
        event.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  const handleImport = () => {
    importInputRef.current?.click()
  }

  const submitBugReport = () => {
    const title = `Bug report - ${bugReporterName || 'Anonimo'}`
    const bodyLines = [
      `Nome: ${bugReporterName || 'Anonimo'}`,
      '',
      'Descrizione bug:',
      bugDescription || '(vuoto)'
    ]
    const issueUrl = `https://github.com/Paraboloski/role69/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(bodyLines.join('\n'))}`

    try {
      const electron = window.require ? window.require('electron') : null
      if (electron?.shell) {
        electron.shell.openExternal(issueUrl)
      } else {
        window.open(issueUrl, '_blank', 'noopener,noreferrer')
      }
    } catch {
      window.open(issueUrl, '_blank', 'noopener,noreferrer')
    }

    setIsBugModalOpen(false)
  }

  useEffect(() => {
    const hasUnsavedChanges = serializedState !== lastSavedRef.current
    notifyUnsavedChanges(hasUnsavedChanges)
  }, [serializedState])

  useEffect(() => {
    if (activeStatuses.length === 0) {
      setStatusIndicatorId(null)
      return
    }

    setStatusIndicatorId((currentId) => (
      activeStatuses.some((status) => status.id === currentId) ? currentId : activeStatuses[0].id
    ))
  }, [activeStatuses])

  useEffect(() => {
    if (activeStatuses.length <= 1) return undefined

    const intervalId = window.setInterval(() => {
      setStatusIndicatorId((currentId) => {
        const currentIndex = activeStatuses.findIndex((status) => status.id === currentId)
        const safeIndex = currentIndex === -1 ? 0 : currentIndex
        return activeStatuses[(safeIndex + 1) % activeStatuses.length].id
      })
    }, STATUS_EMOJI_ROTATION_MS)

    return () => window.clearInterval(intervalId)
  }, [activeStatuses])

  const addInventoryItem = (listName) => {
    const newItem = createInventoryItem(listName)
    setCharacterData((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [listName]: addItem(prev.inventory[listName], newItem)
      }
    }))
  }

  const removeInventoryItem = (listName, id) => {
    setCharacterData((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [listName]: removeItemById(prev.inventory[listName], id)
      }
    }))
  }

  const updateInventoryItem = (listName, id, field, newValue) => {
    setCharacterData((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [listName]: updateItemById(prev.inventory[listName], id, (item) => ({
          ...item,
          [field]: newValue
        }))
      }
    }))
  }

  const addActionEntry = (listName) => {
    const newRow = createActionEntry(listName)
    setCharacterData((prev) => ({
      ...prev,
      actions: {
        ...prev.actions,
        [listName]: addItem(prev.actions[listName], newRow)
      }
    }))
  }

  const removeActionEntry = (listName, id) => {
    setCharacterData((prev) => ({
      ...prev,
      actions: {
        ...prev.actions,
        [listName]: removeItemById(prev.actions[listName], id)
      }
    }))
  }

  const updateActionEntry = (listName, id, field, newValue) => {
    if (listName === 'statuses' && field === 'active' && newValue) {
      setStatusIndicatorId(String(id))
    }

    setCharacterData((prev) => ({
      ...prev,
      actions: {
        ...prev.actions,
        [listName]: updateItemById(prev.actions[listName], id, (item) => ({
          ...item,
          [field]: newValue
        }))
      }
    }))
  }

  return {
    characterData,
    importInputRef,
    isBugModalOpen,
    setIsBugModalOpen,
    isNotesOpen,
    setIsNotesOpen,
    bugReporterName,
    setBugReporterName,
    bugDescription,
    setBugDescription,
    activeStatuses,
    activeStatusIndicator,
    statModifiers,
    armorBonusValue,
    proficiencyBonusValue,
    weakeningLevelValue,
    passivePerceptionValue,
    handleSave,
    handleExport,
    handleImport,
    handleImportFile,
    submitBugReport,
    updateSectionField,
    toggleSkill,
    updateSkillBonus,
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItem,
    addActionEntry,
    removeActionEntry,
    updateActionEntry
  }
}
