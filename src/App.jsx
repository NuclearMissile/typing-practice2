import {useCallback, useEffect, useRef, useState} from 'react';
import {Clock, Pause, Play, RotateCcw, Settings, Target, X, Zap} from 'lucide-react';

const sampleTexts = {
    test: ["test"],
    easy: [
        "The quick brown fox jumps over the lazy dog.",
        "Typing practice improves your speed and accuracy over time.",
        "React is a JavaScript library for building user interfaces.",
        "Practice makes perfect, especially when it comes to typing skills.",
        "Learning to type without looking at the keyboard is called touch typing.",
        "Simple sentences help beginners develop basic typing skills.",
        "Regular practice is the key to becoming a proficient typist.",
        "Good posture is important when typing for extended periods.",
        "Typing is an essential skill in today's digital world.",
        "Focus on accuracy first, then gradually increase your speed."
    ],
    medium: [
        "Programming is the art of telling another human what one wants the computer to do.",
        "The best way to predict the future is to invent it. Alan Kay said that.",
        "Typing quickly and accurately is an essential skill for modern computer users.",
        "JavaScript is a high-level, often just-in-time compiled language that conforms to the ECMAScript specification.",
        "React uses a virtual DOM to efficiently update the UI when the underlying data changes.",
        "Efficient typing can significantly increase your productivity in various computer-related tasks.",
        "The QWERTY keyboard layout was designed in the 1870s for mechanical typewriters to prevent jamming.",
        "Touch typing involves placing your fingers on the home row keys and typing without looking at the keyboard.",
        "Modern keyboards have evolved from mechanical typewriters but maintain the same basic layout and functionality.",
        "Learning keyboard shortcuts can save time and increase efficiency when working with computer applications."
    ],
    hard: [
        "The journey of a thousand miles begins with a single step. Typing efficiently is similar - it starts with learning the correct finger positions.",
        "In computer science, artificial intelligence, sometimes called machine intelligence, is intelligence demonstrated by machines, unlike the natural intelligence displayed by humans.",
        "The World Wide Web (WWW), commonly known as the Web, is an information system where documents and other web resources are identified by Uniform Resource Locators, which may be interlinked by hypertext.",
        "Quantum computing is the use of quantum-mechanical phenomena such as superposition and entanglement to perform computation. Computers that perform quantum computations are known as quantum computers.",
        "The process of developing a structured set of instructions to be followed by a computer or electronic device to perform a specific task or solve a particular problem is called computer programming.",
        "The development of typing skills requires consistent practice and attention to technique, including proper finger placement, posture, and rhythmic keystroke patterns that maximize efficiency and minimize strain.",
        "Neuroplasticity, the brain's ability to reorganize itself by forming new neural connections, plays a crucial role in learning complex motor skills such as touch typing, allowing for improved speed and accuracy over time.",
        "The evolution of human-computer interaction has been significantly influenced by advancements in input methods, from punch cards and mechanical keyboards to touchscreens and voice recognition, each requiring different skill sets and adaptations.",
        "Professional typists often achieve speeds exceeding 100 words per minute through a combination of muscle memory, anticipatory reading, and specialized techniques that minimize unnecessary finger movement and maximize keystroke efficiency.",
        "The integration of ergonomic principles into keyboard design aims to reduce the risk of repetitive strain injuries by promoting natural wrist and hand positions, appropriate key resistance, and optimal key spacing for different hand sizes."
    ]
};

const TypingPracticeApp = () => {
    // State management
    const [userInput, setUserInput] = useState('');
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [errors, setErrors] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [status, setStatus] = useState('waiting'); // waiting, started, paused, completed
    const [showSettings, setShowSettings] = useState(false);
    const [difficulty, setDifficulty] = useState('easy');
    const [currentText, setCurrentText] = useState('');
    const [currentCharIndex, setCurrentCharIndex] = useState(0);

    // Refs
    const inputRef = useRef(null);
    const intervalRef = useRef(null);
    const textDisplayRef = useRef(null);

    // Timer effect
    useEffect(() => {
        if (status === 'started') {
            intervalRef.current = setInterval(() => {
                setTimeElapsed(prev => prev + 0.5);
            }, 500);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
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

    useEffect(() => {
        setCurrentText(getRandomText(difficulty));
        resetTest();
    }, [difficulty]);

    useEffect(() => {
        if (status === 'started' || status === 'waiting') {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [status]);

    // Handle input change
    const handleInputChange = (e) => {
        if (status !== 'waiting' && status !== 'started') {
            return;
        }

        if (status === 'waiting') {
            setStatus('started');
        }

        const value = e.target.value;

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
        if (value.length === currentText.length) {
            setStatus('completed');
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
        setCurrentCharIndex(0);
    };

    // Toggle pause
    const togglePause = () => {
        if (status === 'started') {
            setStatus('paused');
        } else if (status === 'paused') {
            setStatus('started');
        }
    };

    // Generate new text
    const getRandomText = (difficulty) => {
        let ret = sampleTexts[difficulty][Math.floor(Math.random() * sampleTexts[difficulty].length)];
        while (ret === currentText && sampleTexts[difficulty].length > 1) {
            ret = sampleTexts[difficulty][Math.floor(Math.random() * sampleTexts[difficulty].length)];
        }
        return ret;
    };

    // Format time
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
            } else if (index === currentCharIndex) {
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
                        <div
                            className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 min-h-40 leading-relaxed"
                            ref={textDisplayRef}
                        >
                            {renderText()}
                        </div>
                    </div>

                    <div className="mb-4">
                        <textarea
                            ref={inputRef}
                            value={userInput}
                            onChange={handleInputChange}
                            placeholder="Start typing here..."
                            disabled={status === 'completed' || status === 'paused'}
                            className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:outline-none text-lg"
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
                                {Object.keys(sampleTexts).map(
                                    difficulty => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
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