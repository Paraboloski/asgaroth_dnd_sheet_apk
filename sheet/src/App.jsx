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

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const handleToggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <Suspense fallback={<AppFallback theme={theme} />}>
      {isMobile ? (
        <MobileApp theme={theme} onToggleTheme={handleToggleTheme} />
      ) : (
        <DesktopLegacyApp theme={theme} onToggleTheme={handleToggleTheme} />
      )}
    </Suspense>
  )
}
