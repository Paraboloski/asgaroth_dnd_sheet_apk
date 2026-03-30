import { calculateWeakeningPenalty, formatSignedNumber, parseSignedNumber } from '../scripts/utils.js'

export default function Actions({
  actionsData,
  weakeningLevel = 0,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
  showStatuses = true,
  showAttacks = true,
  showFeatures = true,
  showTraits = true,
  showFactions = true
}) {
  const statuses = Array.isArray(actionsData.statuses) ? actionsData.statuses : []
  const baseStatuses = statuses.filter((status) => !status.custom)
  const customStatuses = statuses.filter((status) => status.custom)
  const orderedStatuses = [...baseStatuses, ...customStatuses]
  const weakeningPenalty = calculateWeakeningPenalty(weakeningLevel)
  const factions = Array.isArray(actionsData.factions) ? actionsData.factions : []

  return (
    <section className="actions-section">
      {showStatuses && (
        <>
          <div className="section-header">
            <div className="section-title">STATUS & CONDIZIONI</div>
            <button className="icon-btn icon-btn--add no-print" onClick={() => onAddRow('statuses')} title="Aggiungi Status">+</button>
          </div>
          <table className="action-table action-table--statuses">
            <thead>
              <tr>
                <th className="action-table__col action-table__col--name">Nome</th>
                <th className="action-table__col action-table__col--notes">Descrizione</th>
                <th className="action-table__col action-table__col--status-toggle">Attivo</th>
              </tr>
            </thead>
            <tbody>
              {orderedStatuses.map((status) => (
                <tr key={status.id}>
                  <td>
                    {status.custom ? (
                      <input
                        type="text"
                        className="table-input table-input--name"
                        value={status.name}
                        placeholder="Nome status"
                        onChange={(event) => onUpdateRow('statuses', status.id, 'name', event.target.value)}
                        aria-label={`Nome status ${status.name || 'custom'}`}
                      />
                    ) : (
                      <strong className="status-name">{status.name}</strong>
                    )}
                  </td>
                  <td>
                    {status.custom ? (
                      <textarea
                        className="table-textarea"
                        rows={2}
                        value={status.description}
                        placeholder="Descrizione dello status"
                        onChange={(event) => onUpdateRow('statuses', status.id, 'description', event.target.value)}
                        aria-label={`Descrizione status ${status.name || 'custom'}`}
                      />
                    ) : (
                      <span className="status-description">{status.description}</span>
                    )}
                  </td>
                  <td className="action-cell action-cell--status">
                    <div className="table-row-controls">
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={Boolean(status.active)}
                        onChange={(event) => onUpdateRow('statuses', status.id, 'active', event.target.checked)}
                        aria-label={`Segna ${status.name} come attivo`}
                      />
                      {status.custom && (
                        <button
                          className="icon-btn icon-btn--remove no-print"
                          onClick={() => onRemoveRow('statuses', status.id)}
                          title="Elimina Status"
                          aria-label={`Elimina ${status.name || 'status custom'}`}
                        >
                          -
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {showAttacks && (
        <>
      <div className="section-header">
        <div className="section-title">ATTACCHI & AZIONI</div>
        <button className="icon-btn icon-btn--add no-print" onClick={() => onAddRow('attacks')} title="Aggiungi Attacco">+</button>
      </div>
      <table className="action-table">
        <thead>
          <tr>
            <th className="action-table__col action-table__col--name">Nome</th>
            <th className="action-table__col action-table__col--bonus">Bonus</th>
            <th className="action-table__col action-table__col--damage">Danno</th>
            <th className="action-table__col action-table__col--notes">Note</th>
            <th className="action-table__col action-table__col--tools no-print"></th>
          </tr>
        </thead>
        <tbody>
          {actionsData.attacks.map((attack) => {
            const effectiveBonus = formatSignedNumber(parseSignedNumber(attack.bonus || '+0') - weakeningPenalty)

            return (
            <tr key={attack.id}>
              <td>
                <input
                  type="text"
                  className="table-input table-input--name"
                  value={attack.name}
                  placeholder="Nome attacco"
                  onChange={(event) => onUpdateRow('attacks', attack.id, 'name', event.target.value)}
                  aria-label={`Nome attacco ${attack.name || 'nuovo'}`}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="table-input"
                  value={attack.bonus}
                  placeholder="+0"
                  onChange={(event) => onUpdateRow('attacks', attack.id, 'bonus', event.target.value)}
                  aria-label={`Bonus attacco ${attack.name || 'nuovo'}`}
                />
                {weakeningPenalty > 0 && (
                  <div className="combat-impact-note combat-impact-note--inline">
                    Effettivo: {effectiveBonus}
                  </div>
                )}
              </td>
              <td>
                <input
                  type="text"
                  className="table-input"
                  value={attack.damage}
                  placeholder="1d?"
                  onChange={(event) => onUpdateRow('attacks', attack.id, 'damage', event.target.value)}
                  aria-label={`Danno attacco ${attack.name || 'nuovo'}`}
                />
              </td>
              <td>
                <textarea
                  className="table-textarea"
                  rows={2}
                  value={attack.notes}
                  placeholder="Note"
                  onChange={(event) => onUpdateRow('attacks', attack.id, 'notes', event.target.value)}
                  aria-label={`Note attacco ${attack.name || 'nuovo'}`}
                />
              </td>
              <td className="action-cell no-print">
                <button className="icon-btn icon-btn--remove" onClick={() => onRemoveRow('attacks', attack.id)}>-</button>
              </td>
            </tr>
            )
          })}
        </tbody>
      </table>
        </>
      )}

      {showFeatures && (
        <>
      <div className="section-header">
        <div className="section-title">PRIVILEGI & TRATTI</div>
        <button className="icon-btn icon-btn--add no-print" onClick={() => onAddRow('features')} title="Aggiungi Tratto">+</button>
      </div>
      <table className="action-table action-table--wide">
        <thead>
          <tr>
            <th className="action-table__col action-table__col--name">Nome</th>
            <th className="action-table__col action-table__col--notes">Effetto</th>
            <th className="action-table__col action-table__col--tools no-print"></th>
          </tr>
        </thead>
        <tbody>
          {actionsData.features.map((feature) => (
            <tr key={feature.id}>
              <td>
                <input
                  type="text"
                  className="table-input table-input--name"
                  value={feature.name}
                  placeholder="Nome privilegio"
                  onChange={(event) => onUpdateRow('features', feature.id, 'name', event.target.value)}
                  aria-label={`Nome privilegio ${feature.name || 'nuovo'}`}
                />
              </td>
              <td>
                <textarea
                  className="table-textarea"
                  rows={2}
                  value={feature.effect}
                  placeholder="Effetto"
                  onChange={(event) => onUpdateRow('features', feature.id, 'effect', event.target.value)}
                  aria-label={`Effetto privilegio ${feature.name || 'nuovo'}`}
                />
              </td>
              <td className="action-cell no-print">
                <button className="icon-btn icon-btn--remove" onClick={() => onRemoveRow('features', feature.id)}>-</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </>
      )}

      {showTraits && (
        <>
      <div className="section-header">
        <div className="section-title">PROFILO PSICOLOGICO</div>
        <button className="icon-btn icon-btn--add no-print" onClick={() => onAddRow('traits')} title="Aggiungi Elemento">+</button>
      </div>
      <table className="action-table action-table--wide">
        <thead>
          <tr>
            <th className="action-table__col action-table__col--name">Nome</th>
            <th className="action-table__col action-table__col--notes">Descrizione</th>
            <th className="action-table__col action-table__col--tools no-print"></th>
          </tr>
        </thead>
        <tbody>
          {actionsData.traits.map((trait) => (
            <tr key={trait.id}>
              <td>
                <input
                  type="text"
                  className="table-input table-input--name"
                  value={trait.name}
                  placeholder="Nome tratto"
                  onChange={(event) => onUpdateRow('traits', trait.id, 'name', event.target.value)}
                  aria-label={`Nome tratto ${trait.name || 'nuovo'}`}
                />
              </td>
              <td>
                <textarea
                  className="table-textarea"
                  rows={2}
                  value={trait.description}
                  placeholder="Descrizione"
                  onChange={(event) => onUpdateRow('traits', trait.id, 'description', event.target.value)}
                  aria-label={`Descrizione tratto ${trait.name || 'nuovo'}`}
                />
              </td>
              <td className="action-cell no-print">
                <button className="icon-btn icon-btn--remove" onClick={() => onRemoveRow('traits', trait.id)}>-</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </>
      )}
      {showFactions && (
        <>
      <div className="section-header">
        <div className="section-title">FAZIONI</div>
        <button className="icon-btn icon-btn--add no-print" onClick={() => onAddRow('factions')} title="Aggiungi Fazione">+</button>
      </div>
      <table className="action-table action-table--wide">
        <thead>
          <tr>
            <th className="action-table__col action-table__col--name">Nome Fazione</th>
            <th className="action-table__col" style={{ width: '15%' }}>Rango</th>
            <th className="action-table__col" style={{ width: '10%' }}>Fama</th>
            <th className="action-table__col action-table__col--notes">Privilegi</th>
            <th className="action-table__col action-table__col--tools no-print"></th>
          </tr>
        </thead>
        <tbody>
          {factions.map((faction) => (
            <tr key={faction.id}>
              <td>
                <input
                  type="text"
                  className="table-input table-input--name"
                  value={faction.name || ''}
                  placeholder="Nome fazione"
                  onChange={(event) => onUpdateRow('factions', faction.id, 'name', event.target.value)}
                  aria-label={`Nome fazione ${faction.name || 'nuova'}`}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="table-input"
                  value={faction.rank || ''}
                  placeholder="Rango"
                  onChange={(event) => onUpdateRow('factions', faction.id, 'rank', event.target.value)}
                  aria-label={`Rango fazione ${faction.name || 'nuova'}`}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="table-input"
                  value={faction.fame ?? '0'}
                  min="0"
                  placeholder="0"
                  onChange={(event) => onUpdateRow('factions', faction.id, 'fame', event.target.value)}
                  aria-label={`Punti Fama ${faction.name || 'nuova'}`}
                />
              </td>
              <td>

                <details>
                  <summary style={{ cursor: 'pointer', opacity: 0.8, fontSize: '0.9em' }}>Espandi Privilegi</summary>
                  <textarea
                    className="table-textarea"
                    rows={3}
                    style={{ marginTop: '0.5rem' }}
                    value={faction.privileges || ''}
                    placeholder="Elenco dei privilegi ottenuti..."
                    onChange={(event) => onUpdateRow('factions', faction.id, 'privileges', event.target.value)}
                    aria-label={`Privilegi fazione ${faction.name || 'nuova'}`}
                  />
                </details>
              </td>
              <td className="action-cell no-print">
                <button className="icon-btn icon-btn--remove" onClick={() => onRemoveRow('factions', faction.id)}>-</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </>
      )}
    </section>
  )
}
