import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';

export interface PlayerProfile {
  userId: string;
  username: string;
  email?: string;
  photoURL?: string;
  highScore: number;
  totalCoins: number;
  maxDistance: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LeaderboardItem {
  userId: string;
  username: string;
  photoURL?: string;
  highScore: number;
  maxDistance: number;
  updatedAt?: unknown;
}

/**
 * Loads or initializes the player profile in Firestore
 */
export async function getOrCreatePlayerProfile(
  userId: string,
  defaultName: string = 'Corredor',
  email: string = '',
  photoURL: string = ''
): Promise<PlayerProfile> {
  const userDocRef = doc(db, 'users', userId);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as PlayerProfile;
    }

    // Initialize new player profile
    const newProfile: PlayerProfile = {
      userId,
      username: defaultName.slice(0, 24) || 'Corredor',
      email,
      photoURL,
      highScore: 0,
      totalCoins: 0,
      maxDistance: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userDocRef, newProfile);
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    throw error;
  }
}

/**
 * Updates player profile runner name
 */
export async function updatePlayerUsername(userId: string, newUsername: string): Promise<void> {
  const trimmed = newUsername.trim().slice(0, 24);
  if (trimmed.length < 3) {
    throw new Error('O nome deve conter entre 3 e 24 caracteres.');
  }

  const userDocRef = doc(db, 'users', userId);
  const leaderDocRef = doc(db, 'leaderboard', userId);

  try {
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) return;

    const currentData = userSnap.data() as PlayerProfile;
    await setDoc(
      userDocRef,
      {
        ...currentData,
        username: trimmed,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Also update leaderboard display name if record exists
    if (currentData.highScore > 0) {
      await setDoc(
        leaderDocRef,
        {
          userId,
          username: trimmed,
          photoURL: currentData.photoURL || '',
          highScore: currentData.highScore,
          maxDistance: currentData.maxDistance,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

/**
 * Syncs the run results (Score, Coins, Distance) to Firestore
 */
export async function syncRunToCloud(
  userId: string,
  username: string,
  photoURL: string,
  runScore: number,
  runCoins: number,
  runDistance: number
): Promise<{ newHighScore: boolean; finalProfile: PlayerProfile }> {
  const userDocRef = doc(db, 'users', userId);
  const leaderDocRef = doc(db, 'leaderboard', userId);

  try {
    const userSnap = await getDoc(userDocRef);
    const existing = userSnap.exists()
      ? (userSnap.data() as PlayerProfile)
      : {
          userId,
          username,
          photoURL,
          highScore: 0,
          totalCoins: 0,
          maxDistance: 0,
        };

    const newHighScore = runScore > existing.highScore;
    const finalHighScore = Math.max(existing.highScore, runScore);
    const finalCoins = existing.totalCoins + runCoins;
    const finalDistance = Math.max(existing.maxDistance, Math.floor(runDistance));

    const updatedProfile: PlayerProfile = {
      ...existing,
      userId,
      username: existing.username || username,
      photoURL: existing.photoURL || photoURL,
      highScore: finalHighScore,
      totalCoins: finalCoins,
      maxDistance: finalDistance,
      updatedAt: serverTimestamp(),
    };

    // Save to private user profile
    await setDoc(userDocRef, updatedProfile, { merge: true });

    // If score is greater than 0, publish to public global leaderboard
    if (finalHighScore > 0) {
      await setDoc(leaderDocRef, {
        userId,
        username: updatedProfile.username,
        photoURL: updatedProfile.photoURL || '',
        highScore: finalHighScore,
        maxDistance: finalDistance,
        updatedAt: serverTimestamp(),
      });
    }

    return { newHighScore, finalProfile: updatedProfile };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    throw error;
  }
}

/**
 * Subscribes to the real-time global leaderboard (Top 20 players)
 */
export function subscribeToLeaderboard(
  callback: (items: LeaderboardItem[]) => void,
  limitCount: number = 20
) {
  const q = query(collection(db, 'leaderboard'), orderBy('highScore', 'desc'), limit(limitCount));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: LeaderboardItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as LeaderboardItem);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leaderboard');
    }
  );
}
