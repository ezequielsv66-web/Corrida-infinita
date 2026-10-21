import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { TouchControls } from './components/TouchControls';
import { HowToPublishModal } from './components/HowToPublishModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdSlotTop } from './components/AdSlotTop';
import { AdSlotBottom } from './components/AdSlotBottom';
import { GameEngine } from './game/GameEngine';
import { soundManager } from './audio/SoundManager';
import { GameStatus, GameStats } from './types';
import { User } from 'firebase/auth';
import { subscribeToAuth, loginWithGoogle } from './firebase/authService';
import {
  getOrCreatePlayerProfile,
  syncRunToCloud,
  PlayerProfile,
} from './firebase/playerService';
import { testConnection } from './firebase/config';

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
    scoreMultiplier: 30,
    hoverboardActive: false,
    hoverboardTimeLeft: 0,
    hoverboardsAvailable: 3,
    jetpackActive: false,
    jetpackTimeLeft: 0,
    sneakersActive: false,
    sneakersTimeLeft: 0,
    magnetActive: false,
    magnetTimeLeft: 0,
    multiplierActive: false,
    multiplierTimeLeft: 0,
    shieldActive: false,
    newHighScore: false,
    mysteryBoxesCollected: 0,
    lettersCollected: [],
    inspectorAlert: false,
  });
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [showTouchButtons, setShowTouchButtons] = useState<boolean>(true);

  // Firebase Auth & Cloud Player Profile
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Swipe detection & Double-tap Hoverboard refs
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  // Check touch support on mount and test Firestore connection
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
    testConnection();
  }, []);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const defaultName = user.displayName || user.email?.split('@')[0] || 'Corredor';
          const profile = await getOrCreatePlayerProfile(
            user.uid,
            defaultName,
            user.email || '',
            user.photoURL || ''
          );
          setPlayerProfile(profile);

          // Update game local high score if cloud record is higher
          if (profile.highScore > stats.highScore) {
            setStats((prev) => ({
              ...prev,
              highScore: profile.highScore,
              totalCoins: Math.max(prev.totalCoins, profile.totalCoins),
            }));
            if (engine) {
              engine.stats.highScore = profile.highScore;
              engine.stats.totalCoins = Math.max(engine.stats.totalCoins, profile.totalCoins);
            }
          }
        } catch (error) {
          console.error('Erro ao carregar perfil do jogador:', error);
        }
      } else {
        setPlayerProfile(null);
      }
    });

    return () => unsubscribe();
  }, [engine, stats.highScore]);

  const handleEngineReady = useCallback((eng: GameEngine) => {
    setEngine(eng);
    setStats({ ...eng.stats });
  }, []);

  const handleStatsUpdate = useCallback((newStats: GameStats) => {
    setStats(newStats);
  }, []);

  const handleGameOver = useCallback(
    async (finalStats: GameStats) => {
      setStats(finalStats);
      setGameStatus('GAMEOVER');
      setIsCloudSynced(false);

      // Automatic Cloud Sync if logged in
      if (currentUser && playerProfile) {
        try {
          const { finalProfile } = await syncRunToCloud(
            currentUser.uid,
            playerProfile.username,
            currentUser.photoURL || '',
            finalStats.score,
            finalStats.coins,
            finalStats.distance
          );
          setPlayerProfile(finalProfile);
          setIsCloudSynced(true);
        } catch (err) {
          console.error('Falha na sincronização com Firebase:', err);
        }
      }
    },
    [currentUser, playerProfile]
  );

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

  const handleActivateHoverboard = useCallback(() => {
    engine?.activateHoverboard();
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

  const handleDirectLogin = async () => {
    try {
      const { user, profile } = await loginWithGoogle();
      setCurrentUser(user);
      setPlayerProfile(profile);

      if (gameStatus === 'GAMEOVER') {
        const { finalProfile } = await syncRunToCloud(
          user.uid,
          profile.username,
          user.photoURL || '',
          stats.score,
          stats.coins,
          stats.distance
        );
        setPlayerProfile(finalProfile);
        setIsCloudSynced(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        if (e.code === 'Space') {
          engine?.handleSpacePress();
          return;
        }

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
  }, [gameStatus, engine, handleLeft, handleRight, handleJump, handleSlide, handlePause, handleResume, handleStart, handleRestart]);

  // Touch gesture listeners (Swipe Up, Down, Left, Right and Double-Tap for Hoverboard)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const now = Date.now();
      // Double tap detection anywhere on screen to activate Hoverboard!
      if (gameStatus === 'PLAYING' && now - lastTapTimeRef.current < 320) {
        handleActivateHoverboard();
        lastTapTimeRef.current = 0;
      } else {
        lastTapTimeRef.current = now;
      }

      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: now,
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

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (dt < 600 && Math.max(absX, absY) > 26) {
      if (absX > absY) {
        if (dx < 0) {
          handleLeft();
        } else {
          handleRight();
        }
      } else {
        if (dy < 0) {
          handleJump();
        } else {
          handleSlide();
        }
      }
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* Responsive Top Ad Slot */}
      <AdSlotTop />

      {/* Main 3D Game Playfield Viewport */}
      <div
        className="relative flex-1 w-full overflow-hidden bg-slate-950 select-none touch-none"
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
            highScore={playerProfile?.highScore ?? stats.highScore}
            totalCoins={playerProfile?.totalCoins ?? stats.totalCoins}
            isMuted={isMuted}
            playerName={playerProfile?.username}
            playerPhoto={currentUser?.photoURL || undefined}
            isLoggedIn={!!currentUser}
            onStart={handleStart}
            onToggleMute={handleToggleMute}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        )}

        {/* In-Game HUD Overlay */}
        {(gameStatus === 'PLAYING' || gameStatus === 'PAUSED') && (
          <HUD
            stats={stats}
            isMuted={isMuted}
            showTouchControls={showTouchButtons}
            onToggleTouchControls={() => setShowTouchButtons((prev) => !prev)}
            onToggleMute={handleToggleMute}
            onPause={handlePause}
            onOpenHelp={() => setIsHelpOpen(true)}
            onActivateHoverboard={handleActivateHoverboard}
          />
        )}

        {/* Mobile Tactical On-Screen Controls */}
        {gameStatus === 'PLAYING' && isTouchDevice && showTouchButtons && (
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
            isLoggedIn={!!currentUser}
            isCloudSynced={isCloudSynced}
            onRestart={handleRestart}
            onMainMenu={handleMainMenu}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onLogin={handleDirectLogin}
          />
        )}

        {/* Global Leaderboard Modal */}
        {isLeaderboardOpen && (
          <LeaderboardModal
            currentUserId={currentUser?.uid}
            onClose={() => setIsLeaderboardOpen(false)}
          />
        )}

        {/* User Profile & Auth Modal */}
        {isProfileOpen && (
          <UserProfileModal
            profile={playerProfile}
            onClose={() => setIsProfileOpen(false)}
            onProfileUpdated={(updated) => setPlayerProfile(updated)}
            onLoginSuccess={(profile) => setPlayerProfile(profile)}
            onLogoutSuccess={() => setPlayerProfile(null)}
          />
        )}

        {/* How to Play & Publish Guide Modal */}
        {isHelpOpen && <HowToPublishModal onClose={() => setIsHelpOpen(false)} />}
      </div>

      {/* Responsive Bottom Ad Slot */}
      <AdSlotBottom />
    </div>
  );
}
