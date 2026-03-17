import { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import Header from './components/Header'
import Stats from './components/Stats'
import SavingThrows from './components/SavingThrows'
import Combat from './components/Combat'
import Inventory from './components/Inventory'
import Actions from './components/Actions'
import {
  createInitialCharacterState,
  calculateModifier,
  parseSignedNumber,
  fetchCharacterState,
  saveCharacterState,
  notifyUnsavedChanges,
  addItem,
  createActionEntry,
  createInventoryItem,
  removeItemById,
  updateItemById
} from './utils'

export default function App() {
  const initialStateRef = useRef(createInitialCharacterState())
  const [characterData, setCharacterData] = useState(() => initialStateRef.current)
  const lastSavedRef = useRef(JSON.stringify(initialStateRef.current))
  const importInputRef = useRef(null)
  const [isBugModalOpen, setIsBugModalOpen] = useState(false)
  const [bugReporterName, setBugReporterName] = useState('')
  const [bugDescription, setBugDescription] = useState('')

  useEffect(() => {
    let isActive = true
    fetchCharacterState().then((state) => {
      if (!isActive) return
      setCharacterData(state)
      lastSavedRef.current = JSON.stringify(state)
    })
    return () => {
      isActive = false
    }
  }, [])

  const statModifiers = useMemo(() => {
    const modifiers = {}
    for (const key in characterData.stats) {
      modifiers[key] = calculateModifier(characterData.stats[key])
    }
    return modifiers
  }, [characterData.stats])

  const proficiencyBonusValue = useMemo(
    () => parseSignedNumber(characterData.combat.profBonus),
    [characterData.combat.profBonus],
  )

  const serializedState = useMemo(() => JSON.stringify(characterData), [characterData])

  const updateSectionField = (section, key, value) => {
    setCharacterData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }))
  }

  const toggleSkill = (skillId) => {
    setCharacterData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [skillId]: !prev.skills[skillId] }
    }))
  }

  const handleSave = async () => {
    const success = await saveCharacterState(characterData)
    if (success) {
      lastSavedRef.current = serializedState
      window.ipcRenderer.send('set-unsaved-changes', false);
      alert("Scheda salvata con successo! Puoi chiudere l'app.")
      return
    }
  }

  const handleExport = () => {
    const fileName = `scheda-${new Date().toISOString().slice(0, 10)}.json`
    const payload = JSON.stringify(characterData, null, 2)
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
    data.inventory &&
    Array.isArray(data.inventory.proficiencies) &&
    Array.isArray(data.inventory.items) &&
    Array.isArray(data.inventory.equipment) &&
    data.actions &&
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
        setCharacterData(parsed)
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

  const openBugReport = () => {
    const title = `Bug report - ${bugReporterName || 'Anonimo'}`
    const bodyLines = [
      `Nome: ${bugReporterName || 'Anonimo'}`,
      '',
      'Descrizione bug:',
      bugDescription || '(vuoto)'
    ]
    const issueUrl = `https://github.com/Paraboloski/asgaroth_dnd_sheet_apk/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(bodyLines.join('\n'))}`

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
  }

  useEffect(() => {
    const hasUnsavedChanges = serializedState !== lastSavedRef.current
    notifyUnsavedChanges(hasUnsavedChanges)
  }, [serializedState])

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

  return (
    <div className="app">
      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />
      <Navbar
        onSave={handleSave}
        onExport={handleExport}
        onImport={handleImport}
        onReportBug={() => setIsBugModalOpen(true)}
      />
      {isBugModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsBugModalOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Report a bug</h2>
              <button className="icon-btn icon-btn--remove" onClick={() => setIsBugModalOpen(false)} aria-label="Chiudi">×</button>
            </div>
            <div className="modal-body">
              <label className="modal-label" htmlFor="bug-reporter-name">Nome</label>
              <input
                id="bug-reporter-name"
                className="modal-input"
                type="text"
                value={bugReporterName}
                onChange={(event) => setBugReporterName(event.target.value)}
              />
              <label className="modal-label" htmlFor="bug-description">Descrizione bug</label>
              <textarea
                id="bug-description"
                className="modal-textarea"
                rows={6}
                value={bugDescription}
                onChange={(event) => setBugDescription(event.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn--reset" onClick={() => setIsBugModalOpen(false)}>Annulla</button>
              <button
                className="btn btn--save"
                onClick={() => {
                  openBugReport()
                  setIsBugModalOpen(false)
                }}
              >
                Pubblica su GitHub
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="sheet" id="dynamic-sheet-content">
        <Header headerData={characterData.header} onFieldChange={updateSectionField} />
        <div className="sheet-grid">
          <section className="sheet-column">
            <Stats stats={characterData.stats} modifiers={statModifiers} onFieldChange={updateSectionField} />
            <SavingThrows
              skillsData={characterData.skills}
              modifiers={statModifiers}
              proficiencyBonus={proficiencyBonusValue}
              onToggleSkill={toggleSkill}
            />
            <Inventory
              inventoryData={characterData.inventory}
              onAddItem={addInventoryItem}
              onRemoveItem={removeInventoryItem}
              onUpdateItem={updateInventoryItem}
            />
          </section>
          <section className="sheet-column">
            <Combat
              combatData={characterData.combat}
              initiativeModifier={statModifiers.dex}
              onFieldChange={updateSectionField}
            />
            <Actions
              actionsData={characterData.actions}
              onAddRow={addActionEntry}
              onRemoveRow={removeActionEntry}
              onUpdateRow={updateActionEntry}
            />
          </section>
        </div>
      </main>
    </div>
  )
}
