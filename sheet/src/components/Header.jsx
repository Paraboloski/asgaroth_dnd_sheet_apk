import Editable from './Editable'
import { sanitizeUnsignedNumber } from '../utils.js'
export default function Header({ headerData, onFieldChange }) {
  return (
    <header className="sheet-header">
      <div>
        <h1 className="sheet-title">
          <Editable value={headerData.name} defaultValue="Nome Personaggio" onChange={(val) => onFieldChange('header', 'name', val)} />
        </h1>
        <div className="sheet-subtitle">
          <Editable value={headerData.class1} defaultValue="Classe 1" onChange={(val) => onFieldChange('header', 'class1', val)} /> |{' '}
          <Editable value={headerData.class2} defaultValue="Classe 2" onChange={(val) => onFieldChange('header', 'class2', val)} /> |{' '}
          <Editable value={headerData.race} defaultValue="Razza" onChange={(val) => onFieldChange('header', 'race', val)} /> |{' '}
          <Editable value={headerData.background} defaultValue="Background" onChange={(val) => onFieldChange('header', 'background', val)} /> |{' '}
          <Editable value={headerData.alignment} defaultValue="Allineamento" onChange={(val) => onFieldChange('header', 'alignment', val)} />
        </div>
      </div>
      <div className="sheet-meta">
        <div className="sheet-level">
          Livello{' '}
          <Editable
            value={headerData.level}
            defaultValue="1"
            sanitize={sanitizeUnsignedNumber}
            inputMode="numeric"
            updateOnInput={false}
            onChange={(val) => onFieldChange('header', 'level', val)}
          />
        </div>
        <div className="sheet-subtitle">
          Giocatore: <Editable value={headerData.player} defaultValue="Tuo Nome" onChange={(val) => onFieldChange('header', 'player', val)} />
        </div>
      </div>
    </header>
  )
}
