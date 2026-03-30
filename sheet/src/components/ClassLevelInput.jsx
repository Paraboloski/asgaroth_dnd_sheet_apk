const sanitizeLevelValue = (value) => `${value ?? ''}`.replace(/[^\d]/g, '').slice(0, 2)

export default function ClassLevelInput({
  value,
  min = 0,
  max = 20,
  onCommit,
  className = 'sheet-class-level-input',
  ariaLabel,
  title,
  mode = 'desktop'
}) {
  const normalizedValue = `${value ?? ''}`
  const isMobileMode = mode === 'mobile'

  const handleFocus = (event) => {
    event.currentTarget.dataset.previousValue = normalizedValue

    if (isMobileMode) {
      requestAnimationFrame(() => {
        event.currentTarget.select()
      })
    }
  }

  const handleClick = (event) => {
    if (!isMobileMode) return
    event.currentTarget.select()
  }

  const handleChange = (event) => {
    const nextValue = isMobileMode ? sanitizeLevelValue(event.target.value) : event.target.value
    onCommit(nextValue)
  }

  const handleBlur = (event) => {
    const rawValue = sanitizeLevelValue(event.target.value)
    const previousValue = sanitizeLevelValue(event.currentTarget.dataset.previousValue || normalizedValue || '0')

    if (rawValue === '') {
      onCommit(previousValue || '0')
      return
    }

    const parsedValue = Number.parseInt(rawValue, 10)

    if (Number.isNaN(parsedValue)) {
      onCommit(previousValue || '0')
      return
    }

    const clampedValue = Math.min(max, Math.max(min, parsedValue))
    onCommit(`${clampedValue}`)
  }

  return (
    <input
      type={isMobileMode ? 'text' : 'number'}
      inputMode="numeric"
      pattern="[0-9]*"
      className={className}
      value={normalizedValue}
      min={isMobileMode ? undefined : min}
      max={isMobileMode ? undefined : max}
      onFocus={handleFocus}
      onClick={handleClick}
      onChange={handleChange}
      onBlur={handleBlur}
      aria-label={ariaLabel}
      title={title}
    />
  )
}
