import Navbar from './Navbar'
import Header from './Header'
import Stats from './Stats'
import SavingThrows from './SavingThrows'
import Combat from './Combat'
import Inventory from './Inventory'
import Actions from './Actions'
import Notes from './Notes'

export default function CharacterSheetView({
  appClassName = 'app',
  sheetState,
  theme = 'dark',
  onToggleTheme,
  renderToolbar,
  allowProfileImageUpload = true,
  showProfileImage = true
}) {
  const {
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
  } = sheetState

  return (
    <div className={appClassName} data-theme={theme}>
      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />
      {renderToolbar ? renderToolbar({
        onSave: handleSave,
        onExport: handleExport,
        onImport: handleImport,
        onOpenNotes: () => setIsNotesOpen(true),
        onReportBug: () => setIsBugModalOpen(true),
        theme,
        onToggleTheme
      }) : (
        <Navbar
          onSave={handleSave}
          onExport={handleExport}
          onImport={handleImport}
          onOpenNotes={() => setIsNotesOpen(true)}
          onReportBug={() => setIsBugModalOpen(true)}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
      )}
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
              <button className="btn btn--save" onClick={submitBugReport}>
                Pubblica su GitHub
              </button>
            </div>
          </div>
        </div>
      )}
      <Notes
        isOpen={isNotesOpen}
        notesData={characterData.notes}
        onClose={() => setIsNotesOpen(false)}
        onChange={(value) => updateSectionField('notes', 'content', value)}
      />
      <main className="sheet" id="dynamic-sheet-content">
        <Header
          headerData={characterData.header}
          onFieldChange={updateSectionField}
          activeStatuses={activeStatuses}
          activeStatusIndicator={activeStatusIndicator}
          allowProfileImageUpload={allowProfileImageUpload}
          showProfileImage={showProfileImage}
        />
        <div className="sheet-grid">
          <section className="sheet-column">
            <Stats stats={characterData.stats} modifiers={statModifiers} onFieldChange={updateSectionField} />
            <SavingThrows
              skillsData={characterData.skills}
              skillBonuses={characterData.skillBonuses}
              modifiers={statModifiers}
              proficiencyBonus={proficiencyBonusValue}
              weakeningLevel={weakeningLevelValue}
              onToggleSkill={toggleSkill}
              onSkillBonusChange={updateSkillBonus}
              deathSaveSuccesses={characterData.combat.deathSaveSuccesses}
              deathSaveFailures={characterData.combat.deathSaveFailures}
              onDeathSaveChange={(field, value) => updateSectionField('combat', field, value)}
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
              armorBonus={armorBonusValue}
              dexterityModifier={statModifiers.dex}
              initiativeModifier={statModifiers.dex}
              wisdomModifier={statModifiers.wis}
              proficiencyBonus={proficiencyBonusValue}
              passivePerception={passivePerceptionValue}
              onFieldChange={updateSectionField}
            />
            <Actions
              actionsData={characterData.actions}
              weakeningLevel={weakeningLevelValue}
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
