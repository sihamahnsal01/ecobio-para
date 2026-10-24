// Light / dark mode helpers shared by main.jsx (applied before first paint)
// and the sun/moon toggle in components/theme.jsx.
export const THEME_KEY = 'ecobio_theme'

// The saved choice wins; otherwise follow the visitor's system setting.
export function getInitialTheme() {
    try {
        const saved = localStorage.getItem(THEME_KEY)
        if (saved === 'light' || saved === 'dark') return saved
    } catch {
        // storage blocked – fall through to the system setting
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme) {
    document.body.classList.remove('light', 'dark')
    document.body.classList.add(theme)
    document.documentElement.style.colorScheme = theme
    // keep the splash screen's early dark class (set in index.html) in sync with the choice
    document.documentElement.classList.toggle('dark-boot', theme === 'dark')
}
