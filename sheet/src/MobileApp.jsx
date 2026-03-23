import { useEffect, useState } from 'react'
import './styles/mobile.css'
import CharacterSheetView from './components/View'
import useCharacterSheet from './scripts/hookSheet'

function MobileMenu({ isOpen, onClose, onSave, onExport, onImport, onOpenNotes, onReportBug }) {
  if (!isOpen) return null

  return (
    <div className="mobile-menu-backdrop no-print" role="presentation" onClick={onClose}>
      <aside
        className="mobile-menu-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mobile-menu-header">
          <div>
            <div className="mobile-menu-eyebrow">Menu</div>
            <h2 className="mobile-menu-title" id="mobile-menu-title">Azioni scheda</h2>
          </div>
          <button type="button" className="icon-btn icon-btn--remove" onClick={onClose} aria-label="Chiudi menu">
            ×
          </button>
        </div>

        <div className="mobile-menu-actions">
          <button type="button" className="btn btn--save" onClick={() => { onSave(); onClose() }}>Salva</button>
          <button type="button" className="btn btn--export" onClick={() => { onExport(); onClose() }}>Export JSON</button>
          <button type="button" className="btn btn--import" onClick={() => { onImport(); onClose() }}>Import JSON</button>
          <button type="button" className="btn btn--notes" onClick={() => { onOpenNotes(); onClose() }}>Notes</button>
          <button type="button" className="btn btn--print" onClick={() => { window.print(); onClose() }}>Stampa PDF</button>
          <button type="button" className="btn btn--bug" onClick={() => { onReportBug(); onClose() }}>Report a bug</button>
        </div>
      </aside>
    </div>
  )
}

export default function MobileApp({ theme, onToggleTheme }) {
  const sheetState = useCharacterSheet()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <CharacterSheetView
      appClassName="app mobile-app"
      sheetState={sheetState}
      theme={theme}
      onToggleTheme={onToggleTheme}
      allowProfileImageUpload={false}
      showProfileImage={false}
      renderToolbar={({ onSave, onExport, onImport, onOpenNotes, onReportBug }) => (
        <>
          <div className="mobile-topbar no-print">
            <button
              type="button"
              className="mobile-menu-trigger"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Apri menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu-title"
            >
              <span className="mobile-menu-trigger__line" />
              <span className="mobile-menu-trigger__line" />
              <span className="mobile-menu-trigger__line" />
            </button>
            <button
              type="button"
              className="mobile-theme-toggle"
              onClick={onToggleTheme}
              aria-pressed={theme === 'dark'}
              aria-label={theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
            >
              Tema: {theme === 'dark' ? 'Scuro' : 'Chiaro'}
            </button>
          </div>

          <MobileMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onSave={onSave}
            onExport={onExport}
            onImport={onImport}
            onOpenNotes={onOpenNotes}
            onReportBug={onReportBug}
          />
        </>
      )}
    />
  )
}
