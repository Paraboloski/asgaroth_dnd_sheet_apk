import { useRef, useState } from 'react'
import Editable from './Editable'
import ClassLevelInput from './ClassLevelInput'

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024
const ACCEPTED_IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-4.14 0-7.5 2.52-7.5 5.63 0 .34.28.62.63.62h13.74c.35 0 .63-.28.63-.62 0-3.11-3.36-5.63-7.5-5.63Z"
        fill="currentColor"
      />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.75a.75.75 0 0 1 .75.75v8.19l2.72-2.72a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 1 1 1.06-1.06l2.72 2.72V4.5a.75.75 0 0 1 .75-.75ZM5.25 18a.75.75 0 0 1 .75.75v.75h12v-.75a.75.75 0 0 1 1.5 0V20a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-1.25a.75.75 0 0 1 .75-.75Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Header({
  headerData,
  onFieldChange,
  activeStatuses = [],
  activeStatusIndicator = null,
  allowProfileImageUpload = true,
  showProfileImage = true,
  showHeaderFields = true
}) {
  const fileInputRef = useRef(null)
  const [uploadError, setUploadError] = useState('')
  const profileImage = headerData.profileImage || ''
  const activeStatusNames = activeStatuses.map((status) => status.name).join(', ')
  const class1Level = Number.parseInt(headerData.class1Level ?? '0', 10) || 0
  const class2Level = Number.parseInt(headerData.class2Level ?? '0', 10) || 0
  const totalLevel = Math.min(20, Math.max(1, class1Level + class2Level))
  const resolvedClass1Name = headerData.class1?.trim() || 'Classe 1'
  const resolvedClass2Name = headerData.class2?.trim() || 'Classe 2'
  const class1Min = class2Level > 0 ? 0 : 1
  const class2Min = class1Level > 0 ? 0 : 1
  const class1Max = Math.max(0, 20 - class2Level)
  const class2Max = Math.max(0, 20 - class1Level)
  const levelBreakdownLabel = `Livello totale ${totalLevel}. ${resolvedClass1Name}: ${class1Level}. ${resolvedClass2Name}: ${class2Level}.`

  const openFilePicker = () => {
    if (!allowProfileImageUpload) return
    setUploadError('')
    fileInputRef.current?.click()
  }

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const isAcceptedType = ACCEPTED_IMAGE_TYPES.includes(file.type) || ACCEPTED_IMAGE_EXTENSIONS.test(file.name)
    if (!isAcceptedType) {
      setUploadError('Formato non supportato. Usa JPG, PNG o WebP.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      setUploadError('Immagine troppo pesante. Limite massimo: 2 MB.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string' || !reader.result) {
        setUploadError('Impossibile leggere il file selezionato.')
        event.target.value = ''
        return
      }

      onFieldChange('header', 'profileImage', reader.result)
      setUploadError('')
      event.target.value = ''
    }
    reader.onerror = () => {
      setUploadError('Impossibile leggere il file selezionato.')
      event.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  return (
    <header className="sheet-header">
      <div className="sheet-header-main">
        <div className="sheet-header-copy">
          <div className="sheet-header-identity">
            {showProfileImage && (allowProfileImageUpload ? (
              <>
                <button
                  type="button"
                  className="profile-upload-trigger"
                  onClick={openFilePicker}
                  aria-label={profileImage ? 'Cambia foto profilo' : 'Carica foto profilo'}
                >
                  {profileImage ? (
                    <img className="profile-image" src={profileImage} alt="Foto profilo del personaggio" />
                  ) : (
                    <span className="profile-image profile-image--placeholder" aria-hidden="true">
                      <UserIcon />
                    </span>
                  )}
                  <span className="profile-upload-overlay" aria-hidden="true">
                    <UploadIcon />
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="profile-upload-input"
                  onChange={handleProfileImageChange}
                  tabIndex={-1}
                />
              </>
            ) : (
              <div className="profile-upload-trigger profile-upload-trigger--static" aria-label="Foto profilo">
                {profileImage ? (
                  <img className="profile-image" src={profileImage} alt="Foto profilo del personaggio" />
                ) : (
                  <span className="profile-image profile-image--placeholder" aria-hidden="true">
                    <UserIcon />
                  </span>
                )}
              </div>
            ))}
            <h1 className="sheet-title sheet-title--with-status">
              <Editable
                className="sheet-title-input"
                value={headerData.name}
                defaultValue="Nome Personaggio"
                nativeInput
                onChange={(val) => onFieldChange('header', 'name', val)}
              />
              {activeStatusIndicator && (
                <span
                  key={activeStatusIndicator.id}
                  className="player-status-indicator"
                  role="img"
                  aria-label={
                    activeStatuses.length > 1
                      ? `Status visibile: ${activeStatusIndicator.name}. In totale ci sono ${activeStatuses.length} status attivi.`
                      : `Status attivo: ${activeStatusIndicator.name}.`
                  }
                  title={
                    activeStatuses.length > 1
                      ? `Status attivi: ${activeStatusNames}`
                      : `Status attivo: ${activeStatusIndicator.name}`
                  }
                >
                  <span className="player-status-indicator__emoji" aria-hidden="true">{activeStatusIndicator.emoji}</span>
                </span>
              )}
            </h1>
          </div>
          {showHeaderFields && (
            <div className="sheet-header-fields">
              <div className="sheet-subtitle sheet-subtitle--details">
                <span className="sheet-subtitle-item sheet-class-item sheet-field--class1">
                  <Editable className="sheet-subtitle-input" value={headerData.class1} defaultValue="Classe 1" nativeInput autoWidth onChange={(val) => onFieldChange('header', 'class1', val)} />
                  <ClassLevelInput
                    className="sheet-class-level-input"
                    value={headerData.class1Level ?? '1'}
                    min={class1Min}
                    max={class1Max}
                    onCommit={(nextValue) => onFieldChange('header', 'class1Level', nextValue)}
                    ariaLabel={`Livello di ${resolvedClass1Name}`}
                    title={`Livelli assegnabili a ${resolvedClass1Name}: da ${class1Min} a ${class1Max}`}
                  />
                </span>
                <span className="sheet-subtitle-separator" aria-hidden="true">|</span>
                <span className="sheet-subtitle-item sheet-class-item sheet-field--class2">
                  <Editable className="sheet-subtitle-input" value={headerData.class2} defaultValue="Classe 2" nativeInput autoWidth onChange={(val) => onFieldChange('header', 'class2', val)} />
                  <ClassLevelInput
                    className="sheet-class-level-input"
                    value={headerData.class2Level ?? '0'}
                    min={class2Min}
                    max={class2Max}
                    onCommit={(nextValue) => onFieldChange('header', 'class2Level', nextValue)}
                    ariaLabel={`Livello di ${resolvedClass2Name}`}
                    title={`Livelli assegnabili a ${resolvedClass2Name}: da ${class2Min} a ${class2Max}`}
                  />
                </span>
                <span className="sheet-subtitle-separator" aria-hidden="true">|</span>
                <span className="sheet-subtitle-item sheet-field--race">
                  <Editable className="sheet-subtitle-input" value={headerData.race} defaultValue="Razza" nativeInput autoWidth onChange={(val) => onFieldChange('header', 'race', val)} />
                </span>
                <span className="sheet-subtitle-separator" aria-hidden="true">|</span>
                <span className="sheet-subtitle-item sheet-field--background">
                  <Editable className="sheet-subtitle-input" value={headerData.background} defaultValue="Background" nativeInput autoWidth onChange={(val) => onFieldChange('header', 'background', val)} />
                </span>
                <span className="sheet-subtitle-separator" aria-hidden="true">|</span>
                <span className="sheet-subtitle-item sheet-field--alignment">
                  <Editable className="sheet-subtitle-input" value={headerData.alignment} defaultValue="Allineamento" nativeInput autoWidth onChange={(val) => onFieldChange('header', 'alignment', val)} />
                </span>
              </div>
            </div>
          )}
          {uploadError && (
            <div className="profile-upload-error" role="alert">
              {uploadError}
            </div>
          )}
        </div>
      </div>
      <div className="sheet-meta">
        <div className="sheet-level" aria-label={levelBreakdownLabel} tabIndex={0}>
          Livello <span className="sheet-level__value">{totalLevel}</span>
          <span className="sheet-level__tooltip" role="tooltip">
            <span>{resolvedClass1Name}: {class1Level}</span>
            <span>{resolvedClass2Name}: {class2Level}</span>
          </span>
        </div>
        <div className="sheet-subtitle">
          Giocatore: <Editable className="sheet-subtitle-input" value={headerData.player} defaultValue="Tuo Nome" nativeInput autoWidth onChange={(val) => onFieldChange('header', 'player', val)} />
        </div>
      </div>
    </header>
  )
}
