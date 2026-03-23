import { useState } from 'react'

function ToolbarIcon({ name }) {
  const iconProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  }

  switch (name) {
    case 'save':
      return (
        <svg {...iconProps}>
          <path d="M5 4.5h11l3 3V19.5H5z" />
          <path d="M8 4.5v5h7v-5" />
          <path d="M9 16h6" />
        </svg>
      )
    case 'sync':
      return (
        <svg {...iconProps}>
          <path d="M7 7h10" />
          <path d="m13 3 4 4-4 4" />
          <path d="M17 17H7" />
          <path d="m11 21-4-4 4-4" />
        </svg>
      )
    case 'notes':
      return (
        <svg {...iconProps}>
          <path d="M8 4.5h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8" />
          <path d="M7 4.5v15" />
          <path d="M10.5 9h5" />
          <path d="M10.5 13h5" />
        </svg>
      )
    case 'print':
      return (
        <svg {...iconProps}>
          <path d="M7.5 8.5v-4h9v4" />
          <path d="M7 16.5h10v3H7z" />
          <path d="M5 9.5h14a2 2 0 0 1 2 2v3h-4" />
          <path d="M7 14.5H3v-3a2 2 0 0 1 2-2" />
        </svg>
      )
    case 'bug':
      return (
        <svg {...iconProps}>
          <path d="M9 8.5h6" />
          <path d="M10 4.5h4" />
          <path d="M12 8.5v10" />
          <path d="M8 9.5v6a4 4 0 0 0 8 0v-6" />
          <path d="M5.5 10h2.5" />
          <path d="M16 10h2.5" />
          <path d="M6.5 15h2.5" />
          <path d="M15 15h2.5" />
          <path d="M8.5 6.5 6.5 4.5" />
          <path d="m15.5 6.5 2-2" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...iconProps}>
          <path d="M18 14.5A6.5 6.5 0 1 1 11 4a5.5 5.5 0 1 0 7 10.5Z" />
        </svg>
      )
    case 'sun':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.5" />
          <path d="M12 19v2.5" />
          <path d="M4.5 4.5 6.3 6.3" />
          <path d="m17.7 17.7 1.8 1.8" />
          <path d="M2.5 12H5" />
          <path d="M19 12h2.5" />
          <path d="m4.5 19.5 1.8-1.8" />
          <path d="m17.7 6.3 1.8-1.8" />
        </svg>
      )
    default:
      return null
  }
}

export default function Navbar({
  onSave,
  onExport,
  onImport,
  onOpenNotes,
  onReportBug,
  theme = 'dark',
  onToggleTheme
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isDarkTheme = theme === 'dark'
  const toolbarActions = [
    { id: 'save', label: 'SALVA', meta: 'Salva scheda', icon: 'save', className: 'btn--save', onClick: onSave },
    { id: 'transfer', label: 'JSON', meta: 'Import / Export JSON', icon: 'sync', className: 'btn--export', onClick: () => setIsModalOpen(true) },
    { id: 'notes', label: 'NOTE', meta: 'Apri appunti', icon: 'notes', className: 'btn--notes', onClick: onOpenNotes },
    { id: 'print', label: 'PDF', meta: 'Stampa PDF', icon: 'print', className: 'btn--print', onClick: () => window.print() },
    { id: 'bug', label: 'BUG', meta: 'Segnala bug', icon: 'bug', className: 'btn--bug', onClick: onReportBug },
    {
      id: 'theme',
      label: 'TEMA',
      meta: isDarkTheme ? 'Scuro' : 'Chiaro',
      icon: isDarkTheme ? 'moon' : 'sun',
      className: 'btn--theme',
      onClick: onToggleTheme,
      ariaPressed: isDarkTheme,
      ariaLabel: isDarkTheme ? 'Passa al tema chiaro' : 'Passa al tema scuro'
    }
  ]

  const handleExportClick = () => {
    onExport()
    setIsModalOpen(false)
  }

  const handleImportClick = () => {
    onImport()
    setIsModalOpen(false)
  }

  return (
    <>
      <nav className="toolbar no-print" aria-label="Azioni scheda">
        {toolbarActions.map(({ id, label, meta, icon, className, onClick, ariaPressed, ariaLabel }) => (
          <button
            key={id}
            type="button"
            className={`btn toolbar-btn ${className}`}
            onClick={onClick}
            aria-pressed={ariaPressed}
            aria-label={ariaLabel}
            title={meta ? `${label} · ${meta}` : label}
          >
            <span className="toolbar-btn__icon">
              <ToolbarIcon name={icon} />
            </span>
            <span className="toolbar-btn__content">
              <span className="toolbar-btn__label">{label}</span>
            </span>
          </button>
        ))}
      </nav>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-body" style={{ alignItems: 'center', padding: '10px 0' }}>
              <div style={{ display: 'flex', gap: '15px', width: '100%', justifyContent: 'center' }}>
                <button className="btn btn--export" onClick={handleExportClick}>Export JSON</button>
                <button className="btn btn--import" onClick={handleImportClick}>Import JSON</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
