import { useState } from 'react'

export default function Navbar({ onSave, onExport, onImport, onOpenNotes, onReportBug }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      <nav className="toolbar no-print">
        <button className="btn btn--save" onClick={onSave}>Salva</button>
        <button className="btn btn--export" onClick={() => setIsModalOpen(true)}>Import / Export</button>
        <button className="btn btn--notes" onClick={onOpenNotes}>Notes</button>
        <button className="btn btn--print" onClick={() => window.print()}>Stampa PDF</button>
        <button className="btn btn--bug" onClick={onReportBug}>Report a bug</button>
      </nav>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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
