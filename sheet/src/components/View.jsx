import Navbar from './Navbar'
import Header from './Header'
import Stats from './Stats'
import SavingThrows from './SavingThrows'
import Combat from './Combat'
import Inventory from './Inventory'
import Actions from './Actions'
import Notes from './Notes'
import Editable from './Editable'
import ClassLevelInput from './ClassLevelInput'

import { useState } from 'react'

function MobileSection({ title, children, defaultOpen = false, className = '' }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const resolvedClassName = className ? `mobile-section ${className}` : 'mobile-section'

  return (
    <section className={resolvedClassName}>
      <button
        type="button"
        className="mobile-section__summary"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span className="mobile-section__title">{title}</span>
        <span className="mobile-section__arrow" aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="mobile-section__body">
          {children}
        </div>
      )}
    </section>
  )
}

export default function CharacterSheetView({
  appClassName = 'app',
  sheetState,
  theme = 'dark',
  onToggleTheme,
  renderToolbar,
  allowProfileImageUpload = true,
  showProfileImage = true,
  mobileCollapsibleSections = false
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

  const statsSection = (
    <Stats stats={characterData.stats} modifiers={statModifiers} onFieldChange={updateSectionField} />
  )

  const savingThrowsSection = (
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
      hideSectionHeader={mobileCollapsibleSections}
    />
  )

  const inventorySection = (
    <Inventory
      inventoryData={characterData.inventory}
      onAddItem={addInventoryItem}
      onRemoveItem={removeInventoryItem}
      onUpdateItem={updateInventoryItem}
    />
  )

  const proficienciesSection = (
    <Inventory
      inventoryData={characterData.inventory}
      onAddItem={addInventoryItem}
      onRemoveItem={removeInventoryItem}
      onUpdateItem={updateInventoryItem}
      showItems={false}
      showEquipment={false}
    />
  )

  const combatSection = (
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
  )

  const actionsSection = (
    <Actions
      actionsData={characterData.actions}
      weakeningLevel={weakeningLevelValue}
      onAddRow={addActionEntry}
      onRemoveRow={removeActionEntry}
      onUpdateRow={updateActionEntry}
    />
  )

  const statusesSection = (
    <Actions
      actionsData={characterData.actions}
      weakeningLevel={weakeningLevelValue}
      onAddRow={addActionEntry}
      onRemoveRow={removeActionEntry}
      onUpdateRow={updateActionEntry}
      showAttacks={false}
      showFeatures={false}
      showTraits={false}
      showFactions={false}
    />
  )

  const actionEntriesSection = (
    <Actions
      actionsData={characterData.actions}
      weakeningLevel={weakeningLevelValue}
      onAddRow={addActionEntry}
      onRemoveRow={removeActionEntry}
      onUpdateRow={updateActionEntry}
      showStatuses={false}
      showTraits={false}
    />
  )

  const psychologicalProfileSection = (
    <Actions
      actionsData={characterData.actions}
      weakeningLevel={weakeningLevelValue}
      onAddRow={addActionEntry}
      onRemoveRow={removeActionEntry}
      onUpdateRow={updateActionEntry}
      showStatuses={false}
      showAttacks={false}
      showFeatures={false}
      showFactions={false}
    />
  )

  const inventoryItemsSection = (
    <Inventory
      inventoryData={characterData.inventory}
      onAddItem={addInventoryItem}
      onRemoveItem={removeInventoryItem}
      onUpdateItem={updateInventoryItem}
      showProficiencies={false}
    />
  )

  const class1Level = Number.parseInt(characterData.header.class1Level ?? '0', 10) || 0
  const class2Level = Number.parseInt(characterData.header.class2Level ?? '0', 10) || 0
  const resolvedClass1Name = characterData.header.class1?.trim() || 'Classe 1'
  const resolvedClass2Name = characterData.header.class2?.trim() || 'Classe 2'
  const class1Min = class2Level > 0 ? 0 : 1
  const class2Min = class1Level > 0 ? 0 : 1
  const class1Max = Math.max(0, 20 - class2Level)
  const class2Max = Math.max(0, 20 - class1Level)

  const infographicSection = (
    <div className="infographic-grid">
      <div className="infographic-pill infographic-pill--class">
        <Editable
          className="infographic-pill__name"
          value={characterData.header.class1}
          defaultValue="Classe 1"
          nativeInput
          autoWidth
          onChange={(val) => updateSectionField('header', 'class1', val)}
        />
        <ClassLevelInput
          className="sheet-class-level-input infographic-pill__level"
          value={characterData.header.class1Level ?? '1'}
          min={class1Min}
          max={class1Max}
          onCommit={(nextValue) => updateSectionField('header', 'class1Level', nextValue)}
          ariaLabel={`Livello di ${resolvedClass1Name}`}
          title={`Livelli assegnabili a ${resolvedClass1Name}: da ${class1Min} a ${class1Max}`}
        />
      </div>
      <div className="infographic-pill infographic-pill--class">
        <Editable
          className="infographic-pill__name"
          value={characterData.header.class2}
          defaultValue="Classe 2"
          nativeInput
          autoWidth
          onChange={(val) => updateSectionField('header', 'class2', val)}
        />
        <ClassLevelInput
          className="sheet-class-level-input infographic-pill__level"
          value={characterData.header.class2Level ?? '0'}
          min={class2Min}
          max={class2Max}
          onCommit={(nextValue) => updateSectionField('header', 'class2Level', nextValue)}
          ariaLabel={`Livello di ${resolvedClass2Name}`}
          title={`Livelli assegnabili a ${resolvedClass2Name}: da ${class2Min} a ${class2Max}`}
        />
      </div>
      <label className="infographic-card">
        <span className="infographic-label">Razza</span>
        <Editable
          className="infographic-input"
          value={characterData.header.race}
          defaultValue="Razza"
          nativeInput
          onChange={(val) => updateSectionField('header', 'race', val)}
        />
      </label>
      <label className="infographic-card">
        <span className="infographic-label">Origine</span>
        <Editable
          className="infographic-input"
          value={characterData.header.background}
          defaultValue="Origine"
          nativeInput
          onChange={(val) => updateSectionField('header', 'background', val)}
        />
      </label>
      <label className="infographic-card infographic-card--full">
        <span className="infographic-label">Allineamento</span>
        <Editable
          className="infographic-input"
          value={characterData.header.alignment}
          defaultValue="Allineamento"
          nativeInput
          onChange={(val) => updateSectionField('header', 'alignment', val)}
        />
      </label>
    </div>
  )

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
          showHeaderFields={!mobileCollapsibleSections}
        />
        <div className="sheet-grid">
          {mobileCollapsibleSections ? (
            <>
              <MobileSection title="Infografica" className="mobile-section--infographic">
                {infographicSection}
              </MobileSection>
              <MobileSection title="Statistiche" className="mobile-section--stats">
                {statsSection}
              </MobileSection>
              <MobileSection title="Combattimento" className="mobile-section--combat">
                {combatSection}
              </MobileSection>
              <MobileSection title="Tiri salvezza" className="mobile-section--saving-throws">
                {savingThrowsSection}
              </MobileSection>
              <MobileSection title="Competenze e linguaggi" className="mobile-section--proficiencies">
                {proficienciesSection}
              </MobileSection>
              <MobileSection title="Inventario" className="mobile-section--inventory">
                {inventoryItemsSection}
              </MobileSection>
              <MobileSection title="Status & condizioni" className="mobile-section--statuses">
                {statusesSection}
              </MobileSection>
              <MobileSection title="Azioni" className="mobile-section--actions">
                {actionEntriesSection}
              </MobileSection>
              <MobileSection title="Profilo psicologico" className="mobile-section--psychological">
                {psychologicalProfileSection}
              </MobileSection>
            </>
          ) : (
            <>
              <section className="sheet-column">
                {statsSection}
                {savingThrowsSection}
                {inventorySection}
              </section>
              <section className="sheet-column">
                {combatSection}
                {actionsSection}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
