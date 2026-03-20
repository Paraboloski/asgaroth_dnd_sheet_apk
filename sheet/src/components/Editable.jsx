import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

const normalizeWhitespace = (text) => text.replace(/\u00A0/g, ' ')
const toDisplayValue = (value) => (typeof value === 'string' ? value : `${value ?? ''}`)

export default function Editable({
  value,
  onChange,
  tagName = 'span',
  className = '',
  style = {},
  sanitize = null,
  inputMode,
  defaultValue = '',
  updateOnInput = true,
  clearDefaultOnFocus = false,
  nativeInput = false,
  autoWidth = false,
}) {
  const Tag = tagName
  const editableClassName = className ? `editable ${className}` : 'editable'
  const editableRef = useRef(null)
  const isFocusedRef = useRef(false)
  const currentValue = toDisplayValue(value)
  const displayValue = nativeInput && currentValue === defaultValue ? '' : currentValue
  const [draftValue, setDraftValue] = useState(displayValue)

  useEffect(() => {
    if (!nativeInput) return
    if (isFocusedRef.current) return
    setDraftValue(displayValue)
  }, [displayValue, nativeInput])

  useLayoutEffect(() => {
    if (nativeInput) return
    const element = editableRef.current
    if (!element) return
    if (document.activeElement === element) return

    const nextValue = toDisplayValue(value)
    if ((element.textContent ?? '') !== nextValue) {
      element.textContent = nextValue
    }
  }, [value])

  const commitValue = (element, rawText) => {
    const normalizedWhitespace = normalizeWhitespace(rawText)
    const sanitizedText = sanitize ? sanitize(normalizedWhitespace) : normalizedWhitespace

    if (sanitizedText !== rawText) {
      element.textContent = sanitizedText
    }

    const committedText = element.textContent ?? ''
    if (committedText.trim() === '') {
      element.textContent = defaultValue
      onChange(defaultValue)
      return
    }

    onChange(committedText)
  }

  const commitInputValue = (rawText) => {
    const normalizedWhitespace = normalizeWhitespace(rawText)
    const sanitizedText = sanitize ? sanitize(normalizedWhitespace) : normalizedWhitespace

    if (sanitizedText.trim() === '') {
      setDraftValue('')
      onChange(defaultValue)
      return
    }

    setDraftValue(sanitizedText)
    onChange(sanitizedText)
  }

  const handleInput = (event) => {
    if (!updateOnInput) return
    commitValue(event.currentTarget, event.currentTarget.textContent ?? '')
  }

  const moveCaretToStart = (element) => {
    const selection = window.getSelection?.()
    if (!selection) return

    const range = document.createRange()
    range.selectNodeContents(element)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const inputStyle = useMemo(() => {
    if (!nativeInput || !autoWidth) return style

    const sizingText = draftValue || defaultValue || ''
    const width = `${Math.max(sizingText.length, 4)}ch`
    return { ...style, width }
  }, [autoWidth, defaultValue, draftValue, nativeInput, style])

  if (nativeInput) {
    const nativeClassName = editableClassName ? `${editableClassName} editable--input` : 'editable editable--input'

    return (
      <input
        ref={editableRef}
        type="text"
        className={nativeClassName}
        style={inputStyle}
        value={draftValue}
        placeholder={defaultValue}
        inputMode={inputMode}
        onFocus={() => {
          isFocusedRef.current = true
        }}
        onChange={(event) => {
          const nextValue = normalizeWhitespace(event.target.value)
          setDraftValue(nextValue)
          if (updateOnInput) {
            onChange(nextValue)
          }
        }}
        onBlur={(event) => {
          isFocusedRef.current = false
          commitInputValue(event.target.value)
        }}
      />
    )
  }

  return (
    <Tag
      ref={editableRef}
      className={editableClassName}
      style={style}
      contentEditable={true}
      suppressContentEditableWarning
      inputMode={inputMode}
      onFocus={(event) => {
        if (!clearDefaultOnFocus) return

        const currentText = event.currentTarget.textContent ?? ''
        if (currentText !== defaultValue) return

        event.currentTarget.textContent = ''
        moveCaretToStart(event.currentTarget)
      }}
      onInput={handleInput}
      onBlur={(event) => {
        commitValue(event.currentTarget, event.currentTarget.textContent ?? '')
      }}
    />
  )
}
