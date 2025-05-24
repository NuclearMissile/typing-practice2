import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import TypingPracticeApp from './TypingPracticeApp.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <TypingPracticeApp/>
    </StrictMode>,
)
