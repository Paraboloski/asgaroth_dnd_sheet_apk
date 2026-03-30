import { Suspense, lazy, useEffect, useState } from 'react'
import useIsMobile from './scripts/isMobile'

const MobileApp = lazy(() => import('./MobileApp'))
const DesktopLegacyApp = lazy(() => import('./DesktopApp'))
const THEME_STORAGE_KEY = 'sheet-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark'

  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark'
}

function getFallbackStyle(theme) {
  const isDarkTheme = theme === 'dark'

  return {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    background: isDarkTheme ? '#131315' : '#f5efe6',
    color: isDarkTheme ? '#f1e8dc' : '#35271a',
    fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif'
  }
}

function AppFallback({ theme }) {
  return (
    <div style={getFallbackStyle(theme)}>
      <div>Caricamento interfaccia...</div>
    </div>
  )
}

export default function App() {
  const isMobile = useIsMobile()
  const [theme, setTheme] = useState(getInitialTheme)
  const effectiveTheme = isMobile ? 'dark' : theme

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme
    document.documentElement.style.colorScheme = effectiveTheme

    if (!isMobile) {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }, [effectiveTheme, isMobile, theme])

  const handleToggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <Suspense fallback={<AppFallback theme={effectiveTheme} />}>
      {isMobile ? (
        <MobileApp theme={effectiveTheme} />
      ) : (
        <DesktopLegacyApp theme={theme} onToggleTheme={handleToggleTheme} />
      )}
    </Suspense>
  )
}
