import { useEffect, useRef, useState } from 'react'
import Editable from './Editable'
import { calculateSkillTotal, formatSignedNumber, parseSignedNumber, sanitizeSignedNumber } from '../scripts/utils.js'

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

const DEATH_SCREEN_AUDIO_PATH = `${import.meta.env.BASE_URL}dark_souls_death_screen_sound.mp3`
const DEATH_SAVE_MAX = 3

export default function SavingThrows({
  skillsData,
  skillBonuses = {},
  modifiers,
  proficiencyBonus,
  weakeningLevel = 0,
  onToggleSkill,
  onSkillBonusChange,
  deathSaveSuccesses = '0',
  deathSaveFailures = '0',
  onDeathSaveChange,
  hideSectionHeader = false,
}) {
  const deathAudioRef = useRef(null)
  const wasDeadRef = useRef(false)
  const [isWeakeningDeathDismissed, setIsWeakeningDeathDismissed] = useState(false)

  useEffect(() => {
    if (typeof Audio !== 'function') return undefined

    const audio = new Audio(DEATH_SCREEN_AUDIO_PATH)
    audio.preload = 'auto'
    deathAudioRef.current = audio

    return () => {
      audio.pause()
      audio.currentTime = 0
      deathAudioRef.current = null
    }
  }, [])

  const renderRow = ({ id, label, stat }, { allowManualBonus = false } = {}) => {
    const isProficient = Boolean(skillsData[id])
    const manualBonus = allowManualBonus ? parseSignedNumber(skillBonuses[id] ?? '+0') : 0
    const total = calculateSkillTotal(
      modifiers[stat],
      isProficient,
      proficiencyBonus,
      manualBonus,
      weakeningLevel
    )

    return (
      <li className="skill-row" key={id}>
        <input
          type="checkbox"
          className="table-checkbox skill-checkbox"
          checked={isProficient}
          onChange={() => onToggleSkill(id)}
        />
        <strong className="skill-label">{label}</strong>
        <div className="skill-row__values">
          <span className="calc-val">{formatSignedNumber(total)}</span>
          {allowManualBonus && (
            <div className="skill-manual-bonus-wrap">
              <span className="skill-manual-bonus-label">Bonus</span>
              <Editable
                className="skill-manual-bonus"
                value={skillBonuses[id] ?? '+0'}
                defaultValue="+0"
                sanitize={sanitizeSignedNumber}
                inputMode="numeric"
                updateOnInput={false}
                onChange={(value) => onSkillBonusChange?.(id, value)}
              />
            </div>
          )}
        </div>
      </li>
    )
  }

  const deathSaveValues = {
    deathSaveSuccesses: Number.parseInt(deathSaveSuccesses, 10) || 0,
    deathSaveFailures: Number.parseInt(deathSaveFailures, 10) || 0
  }
  const isDeadFromWeakening = Number.parseInt(weakeningLevel, 10) >= DEATH_SAVE_MAX * 2

  const applyDeathSaveValues = (nextValues, dominantField = null) => {
    const normalizedValues = { ...nextValues }

    const hasMaxSuccesses = normalizedValues.deathSaveSuccesses >= DEATH_SAVE_MAX
    const hasMaxFailures = normalizedValues.deathSaveFailures >= DEATH_SAVE_MAX

    if (hasMaxSuccesses && hasMaxFailures) {
      if (dominantField === 'deathSaveSuccesses') {
        normalizedValues.deathSaveFailures = 0
      } else if (dominantField === 'deathSaveFailures') {
        normalizedValues.deathSaveSuccesses = 0
      } else {
        normalizedValues.deathSaveSuccesses = 0
        normalizedValues.deathSaveFailures = 0
      }
    } else if (hasMaxSuccesses) {
      normalizedValues.deathSaveFailures = 0
    } else if (hasMaxFailures) {
      normalizedValues.deathSaveSuccesses = 0
    }

    Object.entries(normalizedValues).forEach(([field, value]) => {
      if (deathSaveValues[field] !== value) {
        onDeathSaveChange?.(field, `${value}`)
      }
    })
  }

  const handleDeathSaveToggle = (field, index) => {
    const currentValue = deathSaveValues[field]
    const nextValue = currentValue === index + 1 ? index : index + 1
    applyDeathSaveValues({
      ...deathSaveValues,
      [field]: nextValue
    }, field)
  }

  const handleExitDeathState = () => {
    applyDeathSaveValues({
      deathSaveSuccesses: 0,
      deathSaveFailures: 0
    })
  }

  useEffect(() => {
    if (!isDeadFromWeakening) {
      setIsWeakeningDeathDismissed(false)
    }
  }, [isDeadFromWeakening, weakeningLevel])

  const isDead = deathSaveValues.deathSaveFailures >= DEATH_SAVE_MAX || (isDeadFromWeakening && !isWeakeningDeathDismissed)

  useEffect(() => {
    const audio = deathAudioRef.current

    if (!audio) {
      wasDeadRef.current = isDead
      return
    }

    if (isDead && !wasDeadRef.current) {
      audio.pause()
      audio.currentTime = 0
      void audio.play().catch(() => {})
    }

    if (!isDead && wasDeadRef.current) {
      audio.pause()
      audio.currentTime = 0
    }

    wasDeadRef.current = isDead
  }, [isDead])

  return (
    <section className="saving-throws">
      {!hideSectionHeader && (
        <div className="section-header">
          <div className="section-title">Tiri salvezza</div>
        </div>
      )}
      <ul className="skill-list">
        {SAVE_DEFINITIONS.map((definition) => renderRow(definition))}
        <hr className="skill-divider" />
        {SKILL_DEFINITIONS.map((definition) => renderRow(definition, { allowManualBonus: true }))}
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
        <div className="death-saves-title">TS vs MORTE</div>
      </div>
      {isDead && (
        isDeadFromWeakening ? (
          <button
            type="button"
            className="death-screen-overlay"
            onClick={() => setIsWeakeningDeathDismissed(true)}
            aria-label="Chiudi lo stato di morte da indebolimento"
            title="Clicca per chiudere lo stato di morte"
          >
            <div className="death-saves-banner">YOU DIED</div>
          </button>
        ) : (
          <button
            type="button"
            className="death-screen-overlay"
            onClick={handleExitDeathState}
            aria-label="Esci dallo stato di morte"
            title="Clicca per uscire dallo stato di morte"
          >
            <div className="death-saves-banner">YOU DIED</div>
          </button>
        )
      )}
    </section>
  )
}
