import Die from "./components/die";
import { useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import Confetti from 'react-confetti';
import { sounds } from "./utils/audio";

export default function App() {
    const [dice, setDice] = useState(() => generateAllNewDice());
    const [rollsCount, setRollsCount] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showScoreboard, setShowScoreboard] = useState(false);

    // Personal Bests & History loaded from localStorage
    const [bestRolls, setBestRolls] = useState(() => {
        const saved = localStorage.getItem("tenzies_best_rolls");
        return saved !== null ? parseInt(saved, 10) : null;
    });
    const [bestTime, setBestTime] = useState(() => {
        const saved = localStorage.getItem("tenzies_best_time");
        return saved !== null ? parseInt(saved, 10) : null;
    });
    const [totalWins, setTotalWins] = useState(() => {
        const saved = localStorage.getItem("tenzies_total_wins");
        return saved !== null ? parseInt(saved, 10) : 0;
    });
    const [gameHistory, setGameHistory] = useState(() => {
        const saved = localStorage.getItem("tenzies_history");
        return saved ? JSON.parse(saved) : [];
    });

    const [newRecordRolls, setNewRecordRolls] = useState(false);
    const [newRecordTime, setNewRecordTime] = useState(false);

    const rollButtonRef = useRef(null);

    function generateAllNewDice() {
        return new Array(10)
            .fill(0)
            .map(() => ({
                value: Math.ceil(Math.random() * 6),
                isHeld: false,
                id: nanoid()
            }));
    }

    const gameWon = dice.every(die => die.isHeld && die.value === dice[0].value);

    // Timer effect
    useEffect(() => {
        let interval = null;
        if (timerActive && !gameWon) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerActive, gameWon]);

    // Handle Victory state
    useEffect(() => {
        if (gameWon) {
            setTimerActive(false);
            sounds.playWin();
            rollButtonRef.current?.focus();

            // Check & Update Best Rolls
            if (bestRolls === null || rollsCount < bestRolls) {
                setBestRolls(rollsCount);
                localStorage.setItem("tenzies_best_rolls", rollsCount.toString());
                setNewRecordRolls(true);
            }

            // Check & Update Best Time
            if (bestTime === null || seconds < bestTime) {
                setBestTime(seconds);
                localStorage.setItem("tenzies_best_time", seconds.toString());
                setNewRecordTime(true);
            }

            // Total Wins
            const newTotalWins = totalWins + 1;
            setTotalWins(newTotalWins);
            localStorage.setItem("tenzies_total_wins", newTotalWins.toString());

            // Add to History
            const newHistoryItem = {
                id: nanoid(),
                rolls: rollsCount,
                time: seconds,
                date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setGameHistory(prevHistory => {
                const updated = [newHistoryItem, ...prevHistory].slice(0, 5);
                localStorage.setItem("tenzies_history", JSON.stringify(updated));
                return updated;
            });
        }
    }, [gameWon]);

    function hold(id) {
        if (gameWon) return;

        if (!timerActive) {
            setTimerActive(true);
        }

        sounds.playPop();

        setDice(prevDice => prevDice.map(die => {
            return die.id === id ? { ...die, isHeld: !die.isHeld } : die;
        }));
    }

    function rollDice() {
        if (gameWon) {
            // Start New Game
            setDice(generateAllNewDice());
            setRollsCount(0);
            setSeconds(0);
            setTimerActive(false);
            setNewRecordRolls(false);
            setNewRecordTime(false);
            sounds.playPop();
        } else {
            if (!timerActive) {
                setTimerActive(true);
            }
            sounds.playRoll();
            setRollsCount(prev => prev + 1);
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) };
            }));
        }
    }

    function toggleSound() {
        const muted = sounds.toggleMute();
        setIsMuted(muted);
    }

    function resetStats() {
        if (window.confirm("Are you sure you want to reset all scoreboard stats and history?")) {
            localStorage.removeItem("tenzies_best_rolls");
            localStorage.removeItem("tenzies_best_time");
            localStorage.removeItem("tenzies_total_wins");
            localStorage.removeItem("tenzies_history");
            setBestRolls(null);
            setBestTime(null);
            setTotalWins(0);
            setGameHistory([]);
        }
    }

    function formatTime(totalSecs) {
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        if (mins === 0) return `${secs}s`;
        return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    }

    const mappedDice = dice.map(die => (
        <Die
            key={die.id}
            value={die.value}
            isHeld={die.isHeld}
            hold={() => hold(die.id)}
        />
    ));

    return (
        <main>
            {gameWon && <Confetti recycle={false} numberOfPieces={350} />}

            <header className="header-bar">
                <button className="icon-btn" onClick={toggleSound} title={isMuted ? "Unmute Sound" : "Mute Sound"}>
                    {isMuted ? "🔇" : "🔊"}
                </button>
                <h1 className="title">Tenzies</h1>
                <button className="icon-btn scoreboard-toggle-btn" onClick={() => setShowScoreboard(true)} title="View Scoreboard">
                    🏆
                </button>
            </header>

            <p className="instructions">
                Roll until all dice are the same. Click each die to freeze it at its current value between rolls.
            </p>

            {/* In-Game Scoreboard Card */}
            <div className="scoreboard-container">
                <div className="scoreboard-header">
                    <span className="scoreboard-title">🏆 LIVE SCOREBOARD</span>
                    <span className="wins-badge">Wins: {totalWins}</span>
                </div>
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-label">CURRENT ROLLS</span>
                        <span className="stat-value">{rollsCount}</span>
                        <span className="stat-sub">Best: {bestRolls !== null ? `${bestRolls} rolls` : "—"}</span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-label">TIME ELAPSED</span>
                        <span className="stat-value">{formatTime(seconds)}</span>
                        <span className="stat-sub">Best: {bestTime !== null ? formatTime(bestTime) : "—"}</span>
                    </div>
                </div>
            </div>

            {/* Scoreboard Modal */}
            {showScoreboard && (
                <div className="modal-backdrop" onClick={() => setShowScoreboard(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🏆 Scoreboard & Records</h2>
                            <button className="close-btn" onClick={() => setShowScoreboard(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="records-row">
                                <div className="record-box">
                                    <span className="record-icon">🎲</span>
                                    <span className="record-title">Best Rolls</span>
                                    <span className="record-val">{bestRolls !== null ? `${bestRolls}` : "—"}</span>
                                </div>
                                <div className="record-box">
                                    <span className="record-icon">⚡</span>
                                    <span className="record-title">Best Time</span>
                                    <span className="record-val">{bestTime !== null ? formatTime(bestTime) : "—"}</span>
                                </div>
                                <div className="record-box">
                                    <span className="record-icon">👑</span>
                                    <span className="record-title">Total Wins</span>
                                    <span className="record-val">{totalWins}</span>
                                </div>
                            </div>

                            <h3 className="section-subtitle">📜 Recent Games</h3>
                            {gameHistory.length > 0 ? (
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Rolls</th>
                                            <th>Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gameHistory.map((item, idx) => (
                                            <tr key={item.id || idx}>
                                                <td>{item.date}</td>
                                                <td>{item.rolls} rolls</td>
                                                <td>{formatTime(item.time)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="no-history">No game records saved yet.</p>
                            )}

                            <button className="reset-stats-btn" onClick={resetStats}>
                                🗑️ Clear All Stats
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {gameWon && (
                <div className="victory-banner">
                    <p className="win-message">🎉 WON IN {rollsCount} ROLLS ({formatTime(seconds)})!</p>
                    {(newRecordRolls || newRecordTime) && (
                        <p className="record-badge">🌟 NEW PERSONAL BEST! 🌟</p>
                    )}
                </div>
            )}

            <div className="dice-container">
                {mappedDice}
            </div>

            <button ref={rollButtonRef} onClick={rollDice} className="rollButton">
                {gameWon ? "New Game" : "Roll"}
            </button>
        </main>
    );
}
