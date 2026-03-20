import { Suspense, lazy } from 'react'
import useIsMobile from './scripts/isMobile'

const MobileApp = lazy(() => import('./MobileApp'))
const DesktopLegacyApp = lazy(() => import('./DesktopApp'))

const fallbackStyle = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  padding: '24px',
  background: '#f5efe6',
  color: '#35271a',
  fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif'
}

function AppFallback() {
  return (
    <div style={fallbackStyle}>
      <div>Caricamento interfaccia...</div>
    </div>
  )
}

export default function App() {
  const isMobile = useIsMobile()

  return (
    <Suspense fallback={<AppFallback />}>
      {isMobile ? <MobileApp /> : <DesktopLegacyApp />}
    </Suspense>
  )
}
