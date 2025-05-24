import {useCallback, useEffect, useRef, useState} from 'react';
import {Clock, Pause, Play, RotateCcw, Settings, Target, X, Zap} from 'lucide-react';

const TypingPracticeApp = () => {
    // Sample texts for practice
    const sampleTexts = [
        "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once.",
        "In the midst of winter, I found there was, within me, an invincible summer. And that makes me happy.",
        "Technology is best when it brings people together. The future belongs to organizations that can bring together people and technology.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. Never give up on your dreams.",
        "The only way to do great work is to love what you do. Stay hungry, stay foolish, and never stop learning.",
        "Life is what happens to you while you're busy making other plans. Every moment is a fresh beginning.",
        "Innovation distinguishes between a leader and a follower. Think different and change the world around you."
    ];

    // State management
    const [currentText, setCurrentText] = useState(sampleTexts[0]);
    const [userInput, setUserInput] = useState('');
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [errors, setErrors] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [status, setStatus] = useState('waiting'); // waiting, started, paused, completed
    const [showSettings, setShowSettings] = useState(false);
    const [difficulty, setDifficulty] = useState('easy');
    const [currentCharIndex, setCurrentCharIndex] = useState(0);

    // Refs
    const inputRef = useRef(null);
    const intervalRef = useRef(null);

    // Timer effect
    useEffect(() => {
        if (isStarted && !isPaused && !isCompleted) {
            intervalRef.current = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isStarted, isPaused, isCompleted]);

    // Calculate statistics
    const calculateStats = useCallback(() => {
        const timeInMinutes = timeElapsed / 60;
        const wordsTyped = userInput.trim().split(' ').length;
        const charactersTyped = userInput.length;

        if (timeInMinutes > 0) {
            const calculatedWpm = Math.round(wordsTyped / timeInMinutes);
            setWpm(calculatedWpm);
        }

        const accuracyPercent = charactersTyped > 0 ? Math.round(((charactersTyped - errors) / charactersTyped) * 100) : 0;
        setAccuracy(accuracyPercent);
    }, [userInput, timeElapsed, errors]);

    useEffect(() => {
        calculateStats();
    }, [calculateStats]);

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;

        if (!isStarted) {
            setIsStarted(true);
        }

        // Prevent typing beyond the text length
        if (value.length > currentText.length) {
            return;
        }

        setUserInput(value);
        setCurrentCharIndex(value.length);

        // Count errors
        let errorCount = 0;
        for (let i = 0; i < value.length; i++) {
            if (value[i] !== currentText[i]) {
                errorCount++;
            }
        }
        setErrors(errorCount);

        // Check if completed
        if (value === currentText) {
            setIsCompleted(true);
            setIsStarted(false);
        }
    };

    // Reset function
    const resetTest = () => {
        setUserInput('');
        setIsStarted(false);
        setIsPaused(false);
        setTimeElapsed(0);
        setErrors(0);
        setWpm(0);
        setAccuracy(0);
        setIsCompleted(false);
        setCurrentCharIndex(0);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Toggle pause
    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    // Generate new text
    const generateNewText = () => {
        const randomIndex = Math.floor(Math.random() * sampleTexts.length);
        setCurrentText(sampleTexts[randomIndex]);
        resetTest();
    };

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
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
            } else if (index === currentCharIndex) {
                className += 'text-gray-800 bg-blue-200 animate-pulse';
            } else {
                className += 'text-gray-600';
            }

            return (<span key={index} className={className}>
          {char}
        </span>);
        });
    };

    return (<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Typing Practice</h1>
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
                    <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 min-h-32 leading-relaxed">
                        {renderText()}
                    </div>
                </div>

                <div className="mb-4">
                        <textarea
                            ref={inputRef}
                            value={userInput}
                            onChange={handleInputChange}
                            placeholder="Start typing here..."
                            disabled={isPaused || isCompleted}
                            className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:outline-none text-lg"
                            autoFocus
                        />
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
                        onClick={togglePause}
                        disabled={!isStarted || isCompleted}
                        className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPaused ? <Play className="w-4 h-4 mr-2"/> : <Pause className="w-4 h-4 mr-2"/>}
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>

                    <button
                        onClick={resetTest}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4 mr-2"/>
                        Reset
                    </button>

                    <button
                        onClick={generateNewText}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
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
                <h3 className="text-xl font-bold text-gray-800 mb-4">Settings</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Difficulty Level
                        </label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                </div>
            </div>)}

            {/* Completion Modal */}
            {isCompleted && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                                onClick={generateNewText}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                New Text
                            </button>
                        </div>
                    </div>
                </div>)}
        </div>
    </div>);
};

export default TypingPracticeApp;