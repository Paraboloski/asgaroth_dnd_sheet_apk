import Editable from './Editable'
import {
  clampCurrentHitPoints,
  formatSignedNumber,
  sanitizeSignedNumber,
  sanitizeUnsignedNumber
} from '../utils.js'

export default function Combat({ combatData, initiativeModifier, onFieldChange }) {
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
            defaultValue="9m"
            onChange={(val) => onFieldChange('combat', 'speed', val)}
          />
          <div className="combat-label">Velocità</div>
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
        <div className="combat-card">
          <Editable
            className="combat-value"
            tagName="div"
            value={combatData.honor}
            defaultValue="+0"
            sanitize={sanitizeSignedNumber}
            inputMode="numeric"
            updateOnInput={false}
            onChange={(val) => onFieldChange('combat', 'honor', val)}
          />
          <div className="combat-label">Onore</div>
        </div>
        <div className="combat-card">
          <Editable
            className="combat-value"
            tagName="div"
            value={combatData.sanity}
            defaultValue="+0"
            sanitize={sanitizeSignedNumber}
            inputMode="numeric"
            updateOnInput={false}
            onChange={(val) => onFieldChange('combat', 'sanity', val)}
          />
          <div className="combat-label">Sanità Mentale</div>
        </div>
        <div className="combat-card">
          <Editable
            className="combat-value"
            tagName="div"
            value={combatData.occult}
            defaultValue="+0"
            sanitize={sanitizeSignedNumber}
            inputMode="numeric"
            updateOnInput={false}
            onChange={(val) => onFieldChange('combat', 'occult', val)}
          />
          <div className="combat-label">Percezione occulta</div>
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
          <Editable
            className="combat-value combat-value--highlight"
            tagName="div"
            value={combatData.profBonus}
            defaultValue="+0"
            sanitize={sanitizeSignedNumber}
            inputMode="numeric"
            updateOnInput={false}
            onChange={(val) => onFieldChange('combat', 'profBonus', val)}
          />
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
