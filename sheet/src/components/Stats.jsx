import Editable from './Editable'
import { formatSignedNumber, sanitizeUnsignedNumber } from '../utils.js'

const STAT_DEFINITIONS = [
  { key: 'str', label: 'FOR' }, { key: 'dex', label: 'DES' }, { key: 'con', label: 'COS' },
  { key: 'int', label: 'INT' }, { key: 'wis', label: 'SAG' }, { key: 'cha', label: 'CAR' }
]

export default function Stats({ stats, modifiers, onFieldChange }) {
  return (
    <div className="ability-grid">
      {STAT_DEFINITIONS.map(({ key, label }) => (
        <div className="ability-card" key={key}>
          <div className="ability-name">{label}</div>
          <div className="ability-mod">{formatSignedNumber(modifiers[key])}</div>
          <Editable
            className="ability-score"
            tagName="div"
            value={stats[key]}
            defaultValue="10"
            sanitize={sanitizeUnsignedNumber}
            inputMode="numeric"
            updateOnInput={false}
            onChange={(val) => onFieldChange('stats', key, val)}
          />
        </div>
      ))}
    </div>
  )
}
