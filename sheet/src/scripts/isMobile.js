import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768

const getIsMobileViewport = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= MOBILE_BREAKPOINT
}

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(getIsMobileViewport)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleResize = () => {
      setIsMobile(getIsMobileViewport())
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return isMobile
}
