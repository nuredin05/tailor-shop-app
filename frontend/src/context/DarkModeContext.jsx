import { createContext, useContext, useState, useEffect } from 'react'

const DarkModeContext = createContext(null)

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) return JSON.parse(stored)
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'system'
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    localStorage.setItem('themeMode', themeMode)
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode, themeMode])

  // Listen to system theme changes
  useEffect(() => {
    if (themeMode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      setIsDarkMode(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themeMode])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
    setThemeMode('manual')
  }

  const setTheme = (mode) => {
    setThemeMode(mode)
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(prefersDark)
    } else if (mode === 'dark') {
      setIsDarkMode(true)
    } else if (mode === 'light') {
      setIsDarkMode(false)
    }
  }

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, setTheme, themeMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export const useDarkMode = () => useContext(DarkModeContext)
