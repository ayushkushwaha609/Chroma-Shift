import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 10;
const COLORS = ['red', 'green', 'blue', 'yellow'];
const NUM_BLOCKS = 20;

const ChromaShift = () => {
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [playerColor, setPlayerColor] = useState('red');
  const [grid, setGrid] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [bestTimes, setBestTimes] = useState([]);

  const initializeGrid = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill().map(() => 
      Array(GRID_SIZE).fill().map(() => COLORS[Math.floor(Math.random() * COLORS.length)])
    );
    newGrid[GRID_SIZE - 1][GRID_SIZE - 1] = 'white';
    
    let blocksAdded = 0;
    while (blocksAdded < NUM_BLOCKS) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      if ((x !== 0 || y !== 0) && (x !== GRID_SIZE - 1 || y !== GRID_SIZE - 1) && newGrid[y][x] !== 'black') {
        newGrid[y][x] = 'black';
        blocksAdded++;
      }
    }
    
    setGrid(newGrid);
  }, []);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  useEffect(() => {
    let interval;
    if (gameStarted && !gameWon) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameWon]);

  const handleKeyDown = useCallback((e) => {
    if (!gameStarted || gameWon) return;

    const movePlayer = (dx, dy) => {
      setPlayerPos((prevPos) => {
        const newX = prevPos.x + dx;
        const newY = prevPos.y + dy;

        if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
          if (grid[newY][newX] === playerColor || grid[newY][newX] === 'white') {
            if (newX === GRID_SIZE - 1 && newY === GRID_SIZE - 1) {
              setGameWon(true);
              setGameStarted(false);
              setBestTimes((prev) => [...prev, timer].sort((a, b) => a - b).slice(0, 2));
            }
            return { x: newX, y: newY };
          }
        }
        return prevPos;
      });
    };

    switch (e.key) {
      case 'ArrowUp': movePlayer(0, -1); break;
      case 'ArrowDown': movePlayer(0, 1); break;
      case 'ArrowLeft': movePlayer(-1, 0); break;
      case 'ArrowRight': movePlayer(1, 0); break;
      case ' ':
        const currentIndex = COLORS.indexOf(playerColor);
        setPlayerColor(COLORS[(currentIndex + 1) % COLORS.length]);
        break;
      default: break;
    }
  }, [gameStarted, gameWon, grid, playerColor, timer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const startGame = () => {
    setGameStarted(true);
    setGameWon(false);
    setPlayerPos({ x: 0, y: 0 });
    setPlayerColor('red');
    setTimer(0);
    initializeGrid();
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameWon(false);
    setPlayerPos({ x: 0, y: 0 });
    setPlayerColor('red');
    setTimer(0);
    initializeGrid();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#1a202c', color: 'white' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Chroma Shift</h1>
      <div style={{ marginBottom: '1rem' }}>
        Use arrow keys to move. Press spacebar to change color. Avoid black blocks! Your goal is to reach the white block in the least time.
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {!gameStarted && (
          <button onClick={startGame} style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Start Game
          </button>
        )}
        <button onClick={resetGame} style={{ padding: '0.5rem 1rem', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Reset Game
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 30px)`, gap: '1px', marginBottom: '1rem' }}>
        {grid.map((row, y) => 
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: cell,
                outline: x === playerPos.x && y === playerPos.y ? '2px solid white' : 'none',
              }}
            />
          ))
        )}
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        Current Color: <span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: playerColor, verticalAlign: 'middle' }}></span>
      </div>
      <div style={{ marginBottom: '0.5rem' }}>Time: {timer.toFixed(1)} seconds</div>
      <div>
        Best Times: 
        {bestTimes.map((time, index) => (
          <span key={index} style={{ marginLeft: '0.5rem' }}>{time.toFixed(1)}s</span>
        ))}
      </div>
    </div>
  );
};

export default ChromaShift;