import { formatSignedNumber } from '../utils.js'

const SAVE_DEFINITIONS = [
  { id: 'ts_str', label: 'TS Forza:', stat: 'str' }, { id: 'ts_dex', label: 'TS Destrezza:', stat: 'dex' },
  { id: 'ts_con', label: 'TS Costituzione:', stat: 'con' }, { id: 'ts_int', label: 'TS Intelligenza:', stat: 'int' },
  { id: 'ts_wis', label: 'TS Saggezza:', stat: 'wis' }, { id: 'ts_cha', label: 'TS Carisma:', stat: 'cha' }
]

const SKILL_DEFINITIONS = [
  { id: 'acrobatics', label: 'Acrobazia (Des):', stat: 'dex' }, { id: 'animal', label: 'Addestrare animali (Sag):', stat: 'wis' },
  { id: 'arcana', label: 'Arcano (Int):', stat: 'int' }, { id: 'athletics', label: 'Atletica (For):', stat: 'str' },
  { id: 'stealth', label: 'Furtività (Des):', stat: 'dex' }, { id: 'investigation', label: 'Indagare (Int):', stat: 'int' },
  { id: 'deception', label: 'Inganno (Car):', stat: 'cha' }, { id: 'intimidation', label: 'Intimidire (Car):', stat: 'cha' },
  { id: 'performance', label: 'Intrattenere (Car):', stat: 'cha' }, { id: 'insight', label: 'Intuizione (Sag):', stat: 'wis' },
  { id: 'sleight', label: 'Mano lesta (Des):', stat: 'dex' }, { id: 'medicine', label: 'Medicina (Sag):', stat: 'wis' },
  { id: 'nature', label: 'Natura (Int):', stat: 'int' }, { id: 'perception', label: 'Percezione (Sag):', stat: 'wis' },
  { id: 'persuasion', label: 'Persuasione (Car):', stat: 'cha' }, { id: 'religion', label: 'Religione (Int):', stat: 'int' },
  { id: 'survival', label: 'Sopravvivenza (Sag):', stat: 'wis' }, { id: 'history', label: 'Storia (Int):', stat: 'int' }
]

const DEATH_SAVE_LABELS = [
  { field: 'deathSaveSuccesses', label: 'SUCCESSI' },
  { field: 'deathSaveFailures', label: 'FALLIMENTI' }
]

export default function SavingThrows({
  skillsData,
  modifiers,
  proficiencyBonus,
  onToggleSkill,
  deathSaveSuccesses = '0',
  deathSaveFailures = '0',
  onDeathSaveChange,
}) {
  const renderRow = ({ id, label, stat }) => {
    const isProficient = Boolean(skillsData[id])
    const total = modifiers[stat] + (isProficient ? proficiencyBonus : 0)

    return (
      <li className="skill-row" key={id}>
        <input
          type="checkbox"
          className="prof-check"
          checked={isProficient}
          onChange={() => onToggleSkill(id)}
        />
        <strong>{label}</strong> <span className="calc-val">{formatSignedNumber(total)}</span>
      </li>
    )
  }

  const deathSaveValues = {
    deathSaveSuccesses: Number.parseInt(deathSaveSuccesses, 10) || 0,
    deathSaveFailures: Number.parseInt(deathSaveFailures, 10) || 0
  }

  const handleDeathSaveToggle = (field, index) => {
    const currentValue = deathSaveValues[field]
    const nextValue = currentValue === index + 1 ? index : index + 1
    onDeathSaveChange?.(field, `${nextValue}`)
  }

  const isDead = deathSaveValues.deathSaveFailures >= 3

  return (
    <section className="saving-throws">
      <div className="section-header">
        <div className="section-title">Tiri salvezza</div>
      </div>
      <ul className="skill-list">
        {SAVE_DEFINITIONS.map(renderRow)}
        <hr className="skill-divider" />
        {SKILL_DEFINITIONS.map(renderRow)}
        <hr className="skill-divider" />
      </ul>
      <div className="death-saves-card">
        {DEATH_SAVE_LABELS.map(({ field, label }) => (
          <div className="death-saves-row" key={field}>
            <span className="death-saves-label">{label}</span>
            <div className="death-saves-dots" role="group" aria-label={label}>
              {[0, 1, 2].map((index) => {
                const isFilled = index < deathSaveValues[field]
                return (
                  <button
                    key={`${field}-${index}`}
                    type="button"
                    className={`death-save-dot${isFilled ? ' death-save-dot--active' : ''}`}
                    onClick={() => handleDeathSaveToggle(field, index)}
                    aria-pressed={isFilled}
                    aria-label={`${label} ${index + 1}`}
                  />
                )
              })}
            </div>
          </div>
        ))}
        <div className="death-saves-title">TS CONTRO MORTE</div>
      </div>
      {isDead && <div className="death-saves-banner">YOU DIED</div>}
    </section>
  )
}
