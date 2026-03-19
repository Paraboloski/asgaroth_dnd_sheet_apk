import { useEffect, useRef } from 'react'

export default function Notes({ isOpen, notesData, onClose, onChange }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    const previousOverflow = document.body.style.overflow
    const focusFrame = window.requestAnimationFrame(() => {
      textareaRef.current?.focus()
    })

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      window.cancelAnimationFrame(focusFrame)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const content = typeof notesData?.content === 'string' ? notesData.content : ''
  const noteStatus = content.trim() ? `${content.length} caratteri annotati` : 'Quaderno vuoto'

  return (
    <div className="notes-overlay no-print" role="presentation" onMouseDown={() => onClose?.()}>
      <aside
        className="notes-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notes-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="notes-panel__spine" aria-hidden="true" />
        <div className="notes-panel__header">
          <div>
            <h2 className="notes-panel__title" id="notes-title">Notes</h2>
          </div>
          <button
            type="button"
            className="icon-btn icon-btn--remove"
            onClick={() => onClose?.()}
            aria-label="Chiudi appunti"
          >
            ×
          </button>
        </div>
        <textarea
          ref={textareaRef}
          id="character-notes"
          className="notes-panel__textarea"
          value={content}
          onChange={(event) => onChange?.(event.target.value)}
        />

        <div className="notes-panel__footer">
          <span>{noteStatus}</span>
        </div>
      </aside>
    </div>
  )
}
