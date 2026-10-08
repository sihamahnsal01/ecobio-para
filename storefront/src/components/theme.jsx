import { useEffect, useState } from "react"

function Mood() {
        const [theme, setTheme]=useState('light');
        useEffect(()=>{
    document.body.classList.remove('light', 'dark')
    document.body.classList.add(theme)
    , [theme]})
    return (
        <div className='divMood'>
            <span
                onClick={() => setTheme('light')}
                className='LightMood_icon'
            >
                
                <i className="fa-regular fa-sun"></i>
            </span>
            <span
                onClick={() => setTheme('dark')}
                className='Darkmood_icon'
            >
                <i className="fa-regular fa-moon"></i>
            </span>
        </div>
    )
}
export default Mood