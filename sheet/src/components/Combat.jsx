import Editable from './Editable'
import {
  calculateModifier,
  calculateOccultPerception,
  clampCurrentHitPoints,
  formatSignedNumber,
  parseSignedNumber,
  sanitizeUnsignedNumber
} from '../scripts/utils.js'

export default function Combat({
  combatData,
  armorBonus = 0,
  dexterityModifier,
  initiativeModifier,
  wisdomModifier,
  proficiencyBonus,
  passivePerception,
  onFieldChange
}) {
  const resolvedCombatData = combatData ?? {}
  const resolvedArmorBonus = Number.isFinite(armorBonus) ? armorBonus : parseSignedNumber(resolvedCombatData.armorBonus ?? '+0')
  const resolvedDexterityModifier = Number.isFinite(dexterityModifier) ? dexterityModifier : 0
  const armorClass = 10 + resolvedDexterityModifier + resolvedArmorBonus
  const occultClickBonus = Math.max(0, parseSignedNumber(resolvedCombatData.occultBonus ?? '+0'))
  const weakeningLevel = Number.parseInt(resolvedCombatData.weakeningLevel ?? '0', 10) || 0
  const sanityModifier = calculateModifier(resolvedCombatData.sanityScore ?? '10')
  const occultTotal = calculateOccultPerception(
    wisdomModifier,
    sanityModifier,
    proficiencyBonus,
    occultClickBonus
  )

  const renderDerivedCombatStat = ({ label, scoreField, gridArea }) => (
    <div className={`dnd-card dnd-card--dual ${gridArea}`} key={scoreField}>
      <div className="dnd-value dnd-value--main">
        {formatSignedNumber(calculateModifier(resolvedCombatData[scoreField] ?? '10'))}
      </div>
      <Editable
        className="dnd-value dnd-value--sub"
        tagName="div"
        value={resolvedCombatData[scoreField]}
        defaultValue="10"
        sanitize={sanitizeUnsignedNumber}
        inputMode="numeric"
        updateOnInput={false}
        onChange={(val) => onFieldChange('combat', scoreField, val)}
      />
      <div className="dnd-label">{label}</div>
    </div>
  )

  const stepOccultBonus = (delta) => {
    const nextValue = Math.min(999, Math.max(0, occultClickBonus + delta))
    onFieldChange('combat', 'occultBonus', formatSignedNumber(nextValue))
  }

  return (
    <section className="dnd-combat-grid">
      <div className="dnd-card dnd-card--dual area-ac">
        <div className="dnd-value dnd-value--ac dnd-value--main">{armorClass}</div>
        <div className="dnd-label">Classe Armatura</div>
      </div>

      <div className="dnd-card area-init">
        <div className="dnd-value" id="initiative-val">{formatSignedNumber(initiativeModifier)}</div>
        <div className="dnd-label">Iniziativa</div>
      </div>

      <div className="dnd-card area-speed">
        <Editable
          className="dnd-value"
          tagName="div"
          value={resolvedCombatData.speed}
          defaultValue="9"
          sanitize={sanitizeUnsignedNumber}
          inputMode="numeric"
          updateOnInput={false}
          onChange={(val) => onFieldChange('combat', 'speed', val)}
        />
        <div className="dnd-label">Velocità (m)</div>
      </div>

      <div className="dnd-hp-block area-hp">
        <div className="hp-section hp-max">
          <div className="hp-label">PF Massimi</div>
          <Editable
            className="hp-val"
            tagName="div"
            value={resolvedCombatData.maxHitPoints}
            defaultValue="0"
            sanitize={sanitizeUnsignedNumber}
            inputMode="numeric"
            updateOnInput={false}
              onChange={(val) => {
                onFieldChange('combat', 'maxHitPoints', val)
                const clampedCurrent = clampCurrentHitPoints(resolvedCombatData.currentHitPoints, val)
                if (clampedCurrent !== resolvedCombatData.currentHitPoints) {
                  onFieldChange('combat', 'currentHitPoints', clampedCurrent)
                }
              }}
          />
        </div>
        <div className="hp-section hp-current">
          <div className="hp-label hp-label--accent">PF Attuali</div>
          <Editable
            className="hp-val hp-val--huge"
            tagName="div"
            value={resolvedCombatData.currentHitPoints}
            defaultValue="0"
            sanitize={(val) => clampCurrentHitPoints(sanitizeUnsignedNumber(val), resolvedCombatData.maxHitPoints)}
            inputMode="numeric"
            updateOnInput={false}
            onChange={(val) => onFieldChange('combat', 'currentHitPoints', clampCurrentHitPoints(val, resolvedCombatData.maxHitPoints))}
          />
        </div>
        <div className="hp-section hp-temp">
          <div className="hp-label">PF Temporanei</div>
          <Editable
            className="hp-val"
            tagName="div"
            value={resolvedCombatData.temporaryHitPoints}
            defaultValue="0"
            sanitize={sanitizeUnsignedNumber}
            inputMode="numeric"
            updateOnInput={false}
            onChange={(val) => onFieldChange('combat', 'temporaryHitPoints', val)}
          />
        </div>
      </div>

      {renderDerivedCombatStat({ label: 'Onore', scoreField: 'honorScore', gridArea: 'area-honor' })}
      {renderDerivedCombatStat({ label: 'Sanità Mentale', scoreField: 'sanityScore', gridArea: 'area-sanity' })}

      <div className={`dnd-card area-weakening${weakeningLevel > 0 ? ' dnd-card--highlight' : ''}`}>
        <Editable
          className="dnd-value"
          tagName="div"
          value={resolvedCombatData.weakeningLevel}
          defaultValue="0"
          sanitize={(value) => sanitizeUnsignedNumber(value, 6)}
          inputMode="numeric"
          updateOnInput={false}
          onChange={(val) => onFieldChange('combat', 'weakeningLevel', val)}
        />
        <div className="dnd-label">Livello di indebolimento</div>
        {weakeningLevel > 0 && (
          <div className="combat-impact-note">
            Indebolito: {formatSignedNumber(-weakeningLevel)} a prove, TPC e TS.
          </div>
        )}
      </div>

      <div className="dnd-card area-hero">
        <Editable
          className="dnd-value"
          tagName="div"
          value={resolvedCombatData.heroPoints}
          defaultValue="0"
          sanitize={sanitizeUnsignedNumber}
          inputMode="numeric"
          updateOnInput={false}
          onChange={(val) => onFieldChange('combat', 'heroPoints', val)}
        />
        <div className="dnd-label">Punti Eroe</div>
      </div>

      <div className={`dnd-card area-class-points${(resolvedCombatData.classPoints ?? '0') !== '0' ? ' dnd-card--highlight' : ''}`}>
        <Editable
          className="dnd-value"
          tagName="div"
          value={resolvedCombatData.classPoints}
          defaultValue="0"
          sanitize={sanitizeUnsignedNumber}
          inputMode="numeric"
          updateOnInput={false}
          onChange={(val) => onFieldChange('combat', 'classPoints', val)}
        />
        <div className="dnd-label">Punti Classe</div>
      </div>

      <div className="dnd-card dnd-card--highlight area-prof">
        <div className="dnd-value dnd-value--highlight">{formatSignedNumber(proficiencyBonus)}</div>
        <div className="dnd-label dnd-label--highlight">Bonus Competenza</div>
      </div>

      <div className="dnd-card area-occult">
        <div className="dnd-value">{formatSignedNumber(occultTotal)}</div>
        <div className="dnd-label">Percezione Occulta</div>
        <div className="combat-step-controls no-print" style={{ marginTop: '4px' }}>
          <button
            type="button"
            className="table-step-btn"
            onClick={() => stepOccultBonus(-1)}
            title="Riduci bonus"
            disabled={occultClickBonus <= 0}
          >
            -
          </button>
          <button type="button" className="table-step-btn" onClick={() => stepOccultBonus(1)} title="Aumenta bonus">+</button>
        </div>
      </div>

      <div className="dnd-card area-passive">
        <div className="dnd-value">{passivePerception ?? resolvedCombatData.passive ?? '10'}</div>
        <div className="dnd-label">Percezione Passiva</div>
      </div>

    </section>
  )
}
