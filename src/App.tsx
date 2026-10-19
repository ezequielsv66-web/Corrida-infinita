import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { TouchControls } from './components/TouchControls';
import { HowToPublishModal } from './components/HowToPublishModal';
import { GameEngine } from './game/GameEngine';
import { soundManager } from './audio/SoundManager';
import { GameStatus, GameStats } from './types';

export default function App() {
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('TITLE');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    coins: 0,
    totalCoins: 0,
    distance: 0,
    speed: 24,
    shieldActive: false,
    magnetActive: false,
    multiplierActive: false,
    magnetTimeLeft: 0,
    multiplierTimeLeft: 0,
    newHighScore: false,
  });
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // Swipe detection refs
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Check touch support on mount
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  const handleEngineReady = useCallback((eng: GameEngine) => {
    setEngine(eng);
    setStats({ ...eng.stats });
  }, []);

  const handleStatsUpdate = useCallback((newStats: GameStats) => {
    setStats(newStats);
  }, []);

  const handleGameOver = useCallback((finalStats: GameStats) => {
    setStats(finalStats);
    setGameStatus('GAMEOVER');
  }, []);

  // Controls triggers
  const handleLeft = useCallback(() => {
    engine?.moveLeft();
  }, [engine]);

  const handleRight = useCallback(() => {
    engine?.moveRight();
  }, [engine]);

  const handleJump = useCallback(() => {
    if (gameStatus === 'TITLE') {
      handleStart();
    } else if (gameStatus === 'GAMEOVER') {
      handleRestart();
    } else {
      engine?.jump();
    }
  }, [engine, gameStatus]);

  const handleSlide = useCallback(() => {
    engine?.slide();
  }, [engine]);

  const handleStart = useCallback(() => {
    if (!engine) return;
    engine.startGame();
    setGameStatus('PLAYING');
  }, [engine]);

  const handlePause = useCallback(() => {
    if (!engine) return;
    engine.pauseGame();
    setGameStatus('PAUSED');
  }, [engine]);

  const handleResume = useCallback(() => {
    if (!engine) return;
    engine.resumeGame();
    setGameStatus('PLAYING');
  }, [engine]);

  const handleRestart = useCallback(() => {
    if (!engine) return;
    engine.restartGame();
    setGameStatus('PLAYING');
  }, [engine]);

  const handleMainMenu = useCallback(() => {
    if (!engine) return;
    engine.status = 'TITLE';
    setGameStatus('TITLE');
    soundManager.stopMusic();
  }, [engine]);

  const handleToggleMute = useCallback(() => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling page with arrow keys or space
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameStatus === 'PLAYING') {
          handlePause();
        } else if (gameStatus === 'PAUSED') {
          handleResume();
        }
        return;
      }

      if (gameStatus === 'TITLE') {
        if (e.code === 'Space' || e.code === 'Enter') {
          handleStart();
        }
        return;
      }

      if (gameStatus === 'GAMEOVER') {
        if (e.code === 'Space' || e.code === 'Enter') {
          handleRestart();
        }
        return;
      }

      if (gameStatus === 'PLAYING') {
        switch (e.code) {
          case 'ArrowLeft':
          case 'KeyA':
            handleLeft();
            break;
          case 'ArrowRight':
          case 'KeyD':
            handleRight();
            break;
          case 'ArrowUp':
          case 'KeyW':
          case 'Space':
            handleJump();
            break;
          case 'ArrowDown':
          case 'KeyS':
            handleSlide();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, handleLeft, handleRight, handleJump, handleSlide, handlePause, handleResume, handleStart, handleRestart]);

  // Touch gesture listeners (Swipe Up, Down, Left, Right)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    touchStartRef.current = null;

    // Minimum distance threshold of 28px within 600ms
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (dt < 600 && Math.max(absX, absY) > 28) {
      if (absX > absY) {
        // Horizontal swipe
        if (dx < 0) {
          handleLeft();
        } else {
          handleRight();
        }
      } else {
        // Vertical swipe
        if (dy < 0) {
          handleJump();
        } else {
          handleSlide();
        }
      }
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none touch-none font-sans"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D WebGL Canvas Layer */}
      <GameCanvas
        onEngineReady={handleEngineReady}
        onStatsUpdate={handleStatsUpdate}
        onGameOver={handleGameOver}
      />

      {/* Title Screen Overlay */}
      {gameStatus === 'TITLE' && (
        <TitleScreen
          highScore={stats.highScore}
          totalCoins={stats.totalCoins}
          isMuted={isMuted}
          onStart={handleStart}
          onToggleMute={handleToggleMute}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      )}

      {/* In-Game HUD Overlay */}
      {(gameStatus === 'PLAYING' || gameStatus === 'PAUSED') && (
        <HUD
          stats={stats}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      )}

      {/* Mobile Tactical On-Screen Controls */}
      {gameStatus === 'PLAYING' && isTouchDevice && (
        <TouchControls
          onLeft={handleLeft}
          onRight={handleRight}
          onJump={handleJump}
          onSlide={handleSlide}
        />
      )}

      {/* Pause Modal */}
      {gameStatus === 'PAUSED' && (
        <PauseModal
          isMuted={isMuted}
          onResume={handleResume}
          onRestart={handleRestart}
          onToggleMute={handleToggleMute}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Game Over Modal */}
      {gameStatus === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* How to Play & Publish Guide Modal */}
      {isHelpOpen && <HowToPublishModal onClose={() => setIsHelpOpen(false)} />}
    </div>
  );
}
