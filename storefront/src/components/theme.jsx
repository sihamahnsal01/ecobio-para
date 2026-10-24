import { useEffect, useState } from 'react'
import { THEME_KEY, applyTheme, getInitialTheme } from '../utils/themeMode.js'

function Mood() {
    const [theme, setTheme] = useState(getInitialTheme)

    useEffect(() => {
        applyTheme(theme)
        try { localStorage.setItem(THEME_KEY, theme) } catch { /* ignore */ }
    }, [theme])

    return (
        <div className="divMood" role="group" aria-label="Colour theme">
            <span
                onClick={() => setTheme('light')}
                className={`LightMood_icon${theme === 'light' ? ' is-active' : ''}`}
                role="button"
                aria-pressed={theme === 'light'}
                aria-label="Light theme"
                title="Light theme"
            >
                <i className="fa-regular fa-sun"></i>
            </span>
            <span
                onClick={() => setTheme('dark')}
                className={`Darkmood_icon${theme === 'dark' ? ' is-active' : ''}`}
                role="button"
                aria-pressed={theme === 'dark'}
                aria-label="Dark theme"
                title="Dark theme"
            >
                <i className="fa-regular fa-moon"></i>
            </span>
        </div>
    )
}

export default Mood
