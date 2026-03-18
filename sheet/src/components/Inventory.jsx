import { formatSignedNumber, sanitizeSignedNumber, sanitizeUnsignedNumber } from '../utils.js'

export default function Inventory({ inventoryData, onAddItem, onRemoveItem, onUpdateItem }) {
  const stepUnsignedValue = (listName, id, field, currentValue, delta) => {
    const parsedValue = Number.parseInt(sanitizeUnsignedNumber(currentValue ?? '') || '0', 10)
    const nextValue = Math.min(999, Math.max(0, parsedValue + delta))
    if (nextValue === 0) {
      onRemoveItem(listName, id)
      return
    }
    onUpdateItem(listName, id, field, `${nextValue}`)
  }

  const stepSignedValue = (listName, id, field, currentValue, delta) => {
    const normalizedValue = sanitizeSignedNumber(currentValue ?? '') || '+0'
    const parsedValue = Number.parseInt(normalizedValue, 10)
    const nextValue = Math.min(999, Math.max(-999, parsedValue + delta))
    onUpdateItem(listName, id, field, formatSignedNumber(nextValue))
  }

  return (
    <section className="inventory-section">
      <div className="section-header">
        <div className="section-title">COMPETENZE & LINGUAGGI</div>
        <button
          className="icon-btn icon-btn--add no-print"
          onClick={() => onAddItem('proficiencies')}
          title="Aggiungi Competenza"
        >
          +
        </button>
      </div>
      <table className="action-table action-table--wide inventory-table">
        <thead>
          <tr>
            <th className="action-table__col action-table__col--name">Nome</th>
            <th className="action-table__col action-table__col--notes">Descrizione</th>
            <th className="action-table__col action-table__col--tools no-print"></th>
          </tr>
        </thead>
        <tbody>
        {inventoryData.proficiencies.map((item) => (
          <tr key={item.id}>
            <td>
              <input
                type="text"
                className="table-input table-input--name"
                value={item.name}
                placeholder="Nome"
                onChange={(event) => onUpdateItem('proficiencies', item.id, 'name', event.target.value)}
                aria-label={`Nome competenza ${item.name || 'nuova'}`}
              />
            </td>
            <td>
              <textarea
                className="table-textarea"
                rows={2}
                value={item.description}
                placeholder="Descrizione"
                onChange={(event) => onUpdateItem('proficiencies', item.id, 'description', event.target.value)}
                aria-label={`Descrizione competenza ${item.name || 'nuova'}`}
              />
            </td>
            <td className="action-cell no-print">
              <button className="icon-btn icon-btn--remove" onClick={() => onRemoveItem('proficiencies', item.id)}>-</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>

      <div className="section-header">
        <div className="section-title">Inventario</div>
        <button
          className="icon-btn icon-btn--add no-print"
          onClick={() => onAddItem('items')}
          title="Aggiungi Oggetto"
        >
          +
        </button>
      </div>
      <table className="action-table inventory-table inventory-table--items">
        <thead>
          <tr>
            <th className="action-table__col action-table__col--name">Nome</th>
            <th className="action-table__col action-table__col--value">Quantità</th>
            <th className="action-table__col action-table__col--tools no-print"></th>
          </tr>
        </thead>
        <tbody>
        {inventoryData.items.map((item) => (
          <tr key={item.id}>
            <td>
              <input
                type="text"
                className="table-input table-input--name"
                value={item.name}
                placeholder="Nome"
                onChange={(event) => onUpdateItem('items', item.id, 'name', event.target.value)}
                aria-label={`Nome oggetto ${item.name || 'nuovo'}`}
              />
            </td>
            <td>
              <div className="table-number-controls">
                <button
                  type="button"
                  className="table-step-btn no-print"
                  onClick={() => stepUnsignedValue('items', item.id, 'quantity', item.quantity, -1)}
                  aria-label={`Diminuisci quantità ${item.name || 'oggetto'}`}
                >
                  -
                </button>
                <input
                  type="text"
                  className="table-input table-input--number"
                  value={item.quantity}
                  readOnly
                  aria-readonly="true"
                  aria-label={`Quantità oggetto ${item.name || 'nuovo'}`}
                />
                <button
                  type="button"
                  className="table-step-btn no-print"
                  onClick={() => stepUnsignedValue('items', item.id, 'quantity', item.quantity, 1)}
                  aria-label={`Aumenta quantità ${item.name || 'oggetto'}`}
                >
                  +
                </button>
              </div>
            </td>
            <td className="action-cell no-print">
              <button className="icon-btn icon-btn--remove" onClick={() => onRemoveItem('items', item.id)}>-</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>

      <div className="section-header">
        <div className="section-title">Equipaggiamento</div>
        <button
          className="icon-btn icon-btn--add no-print"
          onClick={() => onAddItem('equipment')}
          title="Aggiungi Equipaggiamento"
        >
          +
        </button>
      </div>
      <table className="action-table inventory-table inventory-table--equipment">
        <thead>
          <tr>
            <th className="action-table__col action-table__col--name">Nome</th>
            <th className="action-table__col action-table__col--value">Bonus</th>
            <th className="action-table__col action-table__col--tools no-print"></th>
          </tr>
        </thead>
        <tbody>
        {inventoryData.equipment.map((item) => (
          <tr key={item.id}>
            <td>
              <input
                type="text"
                className="table-input table-input--name"
                value={item.name}
                placeholder="Nome"
                onChange={(event) => onUpdateItem('equipment', item.id, 'name', event.target.value)}
                aria-label={`Nome equipaggiamento ${item.name || 'nuovo'}`}
              />
            </td>
            <td>
              <div className="table-number-controls">
                <button
                  type="button"
                  className="table-step-btn no-print"
                  onClick={() => stepSignedValue('equipment', item.id, 'bonus', item.bonus, -1)}
                  aria-label={`Diminuisci bonus ${item.name || 'equipaggiamento'}`}
                >
                  -
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  className="table-input table-input--number"
                  value={item.bonus}
                  placeholder="+0"
                  onChange={(event) => onUpdateItem('equipment', item.id, 'bonus', sanitizeSignedNumber(event.target.value) || '+0')}
                  aria-label={`Bonus equipaggiamento ${item.name || 'nuovo'}`}
                />
                <button
                  type="button"
                  className="table-step-btn no-print"
                  onClick={() => stepSignedValue('equipment', item.id, 'bonus', item.bonus, 1)}
                  aria-label={`Aumenta bonus ${item.name || 'equipaggiamento'}`}
                >
                  +
                </button>
              </div>
            </td>
            <td className="action-cell no-print">
              <button className="icon-btn icon-btn--remove" onClick={() => onRemoveItem('equipment', item.id)}>-</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </section>
  )
}
