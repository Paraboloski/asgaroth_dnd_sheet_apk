import Editable from './Editable'
import {
  calculateOccultPerception,
  clampCurrentHitPoints,
  formatSignedNumber,
  parseSignedNumber,
  sanitizeSignedNumber,
  sanitizeUnsignedNumber
} from '../utils.js'

export default function Combat({ combatData, initiativeModifier, wisdomModifier, proficiencyBonus, onFieldChange }) {
  const occultClickBonus = parseSignedNumber(combatData.occultBonus ?? '+0')
  const occultTotal = calculateOccultPerception(
    wisdomModifier,
    parseSignedNumber(combatData.sanity),
    proficiencyBonus,
    occultClickBonus
  )

  const renderDualCombatStat = ({ label, scoreField, modifierField }) => (
    <div className="combat-card combat-card--dual-stat" key={modifierField}>
      <div className="combat-label combat-label--stacked">{label}</div>
      <Editable
        className="combat-value combat-value--dual"
        tagName="div"
        value={combatData[modifierField]}
        defaultValue="+0"
        sanitize={sanitizeSignedNumber}
        inputMode="numeric"
        updateOnInput={false}
        onChange={(val) => onFieldChange('combat', modifierField, val)}
      />
      <Editable
        className="combat-subvalue"
        tagName="div"
        value={combatData[scoreField]}
        defaultValue="10"
        sanitize={sanitizeUnsignedNumber}
        inputMode="numeric"
        updateOnInput={false}
        onChange={(val) => onFieldChange('combat', scoreField, val)}
      />
    </div>
  )

  const stepOccultBonus = (delta) => {
    const nextValue = Math.min(999, Math.max(-999, occultClickBonus + delta))
    onFieldChange('combat', 'occultBonus', formatSignedNumber(nextValue))
  }

  return (
    <section className="combat-section">
      <div className="combat-grid">
        <div className="combat-card">
          <Editable
            className="combat-value"
            tagName="div"
            value={combatData.ac}
            defaultValue="10"
            sanitize={sanitizeUnsignedNumber}
            inputMode="numeric"
            updateOnInput={false}
            onChange={(val) => onFieldChange('combat', 'ac', val)}
          />
          <div className="combat-label">Classe Armatura (CA)</div>
        </div>
        <div className="combat-card">
          <div className="combat-value" id="initiative-val">{formatSignedNumber(initiativeModifier)}</div>
          <div className="combat-label">Iniziativa</div>
        </div>
        <div className="combat-card">
          <Editable
            className="combat-value"
            tagName="div"
            value={combatData.speed}
            defaultValue="9"
            sanitize={sanitizeUnsignedNumber}
            inputMode="numeric"
            updateOnInput={false}
            onChange={(val) => onFieldChange('combat', 'speed', val)}
          />
          <div className="combat-label">Velocità(m)</div>
        </div>
        <div className="combat-card combat-card--highlight hp-card">
          <div className="hp-row">
            <div className="combat-label">PF Massimi</div>
            <Editable
              className="combat-value combat-value--highlight"
              tagName="div"
              value={combatData.maxHitPoints}
              defaultValue="0"
              sanitize={sanitizeUnsignedNumber}
              inputMode="numeric"
              updateOnInput={false}
              onChange={(val) => {
                onFieldChange('combat', 'maxHitPoints', val)
                const clampedCurrent = clampCurrentHitPoints(combatData.currentHitPoints, val)
                if (clampedCurrent !== combatData.currentHitPoints) {
                  onFieldChange('combat', 'currentHitPoints', clampedCurrent)
                }
              }}
            />
          </div>
          <div className="hp-row">
            <div className="combat-label">PF Attuali</div>
            <Editable
              className="combat-value combat-value--highlight"
              tagName="div"
              value={combatData.currentHitPoints}
              defaultValue="0"
              sanitize={(val) => clampCurrentHitPoints(sanitizeUnsignedNumber(val), combatData.maxHitPoints)}
              inputMode="numeric"
              updateOnInput={false}
              onChange={(val) => onFieldChange('combat', 'currentHitPoints', clampCurrentHitPoints(val, combatData.maxHitPoints))}
            />
          </div>
          <div className="hp-row">
            <div className="combat-label">PF Temporanei</div>
            <Editable
              className="combat-value"
              tagName="div"
              value={combatData.temporaryHitPoints}
              defaultValue="0"
              sanitize={sanitizeUnsignedNumber}
              inputMode="numeric"
              updateOnInput={false}
              onChange={(val) => onFieldChange('combat', 'temporaryHitPoints', val)}
            />
          </div>
        </div>
      </div>

      <div className="combat-grid">
        {renderDualCombatStat({ label: 'Onore', scoreField: 'honorScore', modifierField: 'honor' })}
        {renderDualCombatStat({ label: 'Sanità Mentale', scoreField: 'sanityScore', modifierField: 'sanity' })}
        <div className="combat-card combat-card--occult">
          <div className="combat-value">{formatSignedNumber(occultTotal)}</div>
          <div className="combat-label">Percezione occulta</div>
          <div className="combat-step-controls">
            {/*<button
              type="button"
              className="table-step-btn no-print"
              onClick={() => stepOccultBonus(-1)}
              aria-label="Diminuisci bonus Percezione occulta"
            >
              -
            </button>*/}
            {/*<span className="combat-step-value" aria-live="polite">{formatSignedNumber(occultClickBonus)}</span>*/}
            <button
              type="button"
              className="table-step-btn no-print"
              onClick={() => stepOccultBonus(1)}
              aria-label="Aumenta bonus Percezione occulta"
            >
              +
            </button>
          </div>
        </div>
        <div className="combat-card">
          <Editable
            className="combat-value"
            tagName="div"
            value={combatData.passive}
            defaultValue="10"
            sanitize={sanitizeUnsignedNumber}
            inputMode="numeric"
            updateOnInput={false}
            onChange={(val) => onFieldChange('combat', 'passive', val)}
          />
          <div className="combat-label">Percezione passiva</div>
        </div>
      </div>

      <div className="combat-grid">
        <div className="combat-card combat-card--highlight">
          <div className="combat-value combat-value--highlight">{formatSignedNumber(proficiencyBonus)}</div>
          <div className="combat-label combat-label--highlight">Bonus Competenza</div>
        </div>
        <div className="combat-card">
          <Editable
            className="combat-value"
            tagName="div"
            value={combatData.heroPoints}
            defaultValue="0"
            sanitize={sanitizeUnsignedNumber}
            inputMode="numeric"
            updateOnInput={false}
            onChange={(val) => onFieldChange('combat', 'heroPoints', val)}
          />
          <div className="combat-label">Punti Eroe</div>
        </div>
      </div>
    </section>
  )
}
