export default function Navbar({ onSave, onExport, onImport, onReportBug }) {
  return (
    <nav className="toolbar no-print">
      <button className="btn btn--save" onClick={onSave}>Salva</button>
      <button className="btn btn--export" onClick={onExport}>Export JSON</button>
      <button className="btn btn--import" onClick={onImport}>Import JSON</button>
      <button className="btn btn--print" onClick={() => window.print()}>Stampa PDF</button>
      <button className="btn btn--bug" onClick={onReportBug}>Report a bug</button>
    </nav>
  )
}
