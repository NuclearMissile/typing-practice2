import {useCallback, useEffect, useRef, useState} from 'react';
import {Clock, ListRestart, Pause, Play, RotateCcw, Settings, Target, X, Zap} from 'lucide-react';
import sampleTexts from "./SampleText.js";

const TypingPracticeApp = () => {
    // State management
    const [userInput, setUserInput] = useState('');
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [errors, setErrors] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [status, setStatus] = useState('waiting'); // waiting, playing, paused, completed
    const [showSettings, setShowSettings] = useState(false);
    const [backspaceMode, setBackspaceMode] = useState('enable');
    const [difficulty, setDifficulty] = useState('easy'); // easy, medium, hard
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Refs
    const timerRef = useRef(null);
    const textDisplayRef = useRef(null);

    // Timer effect
    useEffect(() => {
        if (status === 'playing') {
            timerRef.current = setInterval(() => {
                setTimeElapsed(prev => prev + 0.5);
            }, 500);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [status]);

    // Calculate statistics
    const calculateStats = useCallback(() => {
        const timeInMinutes = timeElapsed / 60;
        const wordsTyped = userInput.trim().split(' ').length;
        const charactersTyped = userInput.length;

        if (timeInMinutes > 0) {
            const calculatedWpm = Math.round(wordsTyped / timeInMinutes);
            setWpm(calculatedWpm);
        }

        const accuracy = charactersTyped > 0 ? Math.round(((charactersTyped - errors) / charactersTyped) * 100) : 0;
        setAccuracy(accuracy);
    }, [userInput, timeElapsed, errors]);

    useEffect(() => calculateStats(), [calculateStats]);

    // Reset game when difficulty changed
    useEffect(() => {
        setCurrentText(getRandomText(difficulty));
        resetTest();
    }, [difficulty]);

    // Reset focus when status changed
    useEffect(() => {
        if (status === 'playing' || status === 'waiting') {
            if (textDisplayRef.current) {
                textDisplayRef.current.focus();
            }
        }
    }, [status, difficulty, backspaceMode]);

    const handleKeyDown = (e) => {
        if (status === 'paused' || status === 'completed') {
            return;
        }

        if (e.key.length === 1 || (e.key === 'Backspace' && userInput.length > 0 && backspaceMode === 'enable')) {
            e.preventDefault();

            if (status === 'waiting') {
                setStatus('playing');
            }

            let newInput = userInput;
            if (e.key === 'Backspace') {
                // Handle backspace - remove the last character
                newInput = userInput.slice(0, -1);
            } else if (status !== 'completed' && currentText.length > userInput.length) {
                // Add the typed character
                newInput = userInput + e.key;
            }
            setUserInput(newInput);
            setCurrentIndex(newInput.length);

            let errorCount = 0;
            for (let i = 0; i < newInput.length; i++) {
                if (newInput[i] !== currentText[i]) {
                    errorCount++;
                }
            }
            setErrors(errorCount);

            // Check if completed
            if (newInput.length === currentText.length) {
                setStatus('completed');
            }
        }
    };

    // Reset function
    const resetTest = () => {
        setUserInput('');
        setTimeElapsed(0);
        setErrors(0);
        setWpm(0);
        setAccuracy(0);
        setStatus('waiting');
        setCurrentIndex(0);
        if (textDisplayRef.current) {
            textDisplayRef.current.focus();
        }
    };

    const getRandomText = (difficulty) => {
        let ret = sampleTexts[difficulty][Math.floor(Math.random() * sampleTexts[difficulty].length)];
        while (ret === currentText && sampleTexts[difficulty].length > 1) {
            ret = sampleTexts[difficulty][Math.floor(Math.random() * sampleTexts[difficulty].length)];
        }
        return ret;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Render text with highlighting
    const renderText = () => {
        return currentText.split('').map((char, index) => {
            let className = 'text-lg ';

            if (index < userInput.length) {
                if (userInput[index] === char) {
                    className += 'text-green-600 bg-green-100';
                } else {
                    className += 'text-red-600 bg-red-100';
                }
            } else if (index === currentIndex) {
                className += 'text-gray-800 bg-blue-200 animate-pulse';
            } else {
                className += 'text-gray-600';
            }

            return <span key={index} className={className}>{char}</span>;
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="text-center mb-8">
                    <a href="https://github.com/NuclearMissile/typing-practice2" target="_blank" rel="noreferrer noopener">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Typing Practice</h1>
                    </a>
                    <p className="text-gray-600">Improve your typing speed and accuracy</p>
                </header>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Zap className="w-5 h-5 text-yellow-500 mr-2"/>
                            <span className="text-sm font-medium text-gray-600">WPM</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{wpm}</div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Target className="w-5 h-5 text-green-500 mr-2"/>
                            <span className="text-sm font-medium text-gray-600">Accuracy</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{accuracy}%</div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Clock className="w-5 h-5 text-blue-500 mr-2"/>
                            <span className="text-sm font-medium text-gray-600">Time</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{formatTime(timeElapsed)}</div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <X className="w-5 h-5 text-red-500 mr-2"/>
                            <span className="text-sm font-medium text-gray-600">Errors</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{errors}</div>
                    </div>
                </div>

                {/* Main Typing Area */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="mb-6">
                        <div
                            className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 min-h-40 leading-relaxed focus:border-blue-500 focus:outline-none"
                            ref={textDisplayRef}
                            tabIndex={0}
                            onKeyDown={handleKeyDown}
                        >
                            {renderText()}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{Math.round((userInput.length / currentText.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{width: `${(userInput.length / currentText.length) * 100}%`}}
                            ></div>
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={() => {
                                if (status === 'playing') {
                                    setStatus('paused');
                                } else if (status === 'paused') {
                                    setStatus('playing');
                                }
                            }}
                            disabled={status === 'waiting' || status === 'completed'}
                            className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {status === 'paused' ? <Play className="w-4 h-4 mr-2"/> : <Pause className="w-4 h-4 mr-2"/>}
                            {status === 'paused' ? 'Resume' : 'Pause'}
                        </button>

                        <button
                            onClick={resetTest}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4 mr-2"/>
                            Reset
                        </button>

                        <button
                            onClick={() => {
                                setCurrentText(getRandomText(difficulty));
                                resetTest();
                            }}
                            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <ListRestart className="w-4 h-4 mr-2"/>
                            New Text
                        </button>

                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            <Settings className="w-4 h-4 mr-2"/>
                            Settings
                        </button>
                    </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Difficulty
                            </label>
                            <select
                                value={difficulty}
                                onChange={e => setDifficulty(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            >
                                {Object.keys(sampleTexts).map(
                                    difficulty => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Backspace
                            </label>
                            <select
                                value={backspaceMode}
                                onChange={e => setBackspaceMode(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            >
                                <option key="enable" value="enable">enable</option>
                                <option key="disable" value="disable">disable</option>
                            </select>
                        </div>
                    </div>
                </div>)}

                {/* Completion Modal */}
                {status === 'completed' && (
                    <div className="fixed inset-0 bg-gray-500/70 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                                🎉 Congratulations!
                            </h2>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Words Per Minute:</span>
                                    <span className="font-bold text-blue-600">{wpm} WPM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Accuracy:</span>
                                    <span className="font-bold text-green-600">{accuracy}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Time Taken:</span>
                                    <span className="font-bold text-purple-600">{formatTime(timeElapsed)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Errors:</span>
                                    <span className="font-bold text-red-600">{errors}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={resetTest}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentText(getRandomText(difficulty));
                                        resetTest();
                                    }}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    New Text
                                </button>
                            </div>
                        </div>
                    </div>)
                }
            </div>
        </div>
    );
};

export default TypingPracticeApp;