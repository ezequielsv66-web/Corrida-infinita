import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from './config';
import { getOrCreatePlayerProfile, PlayerProfile } from './playerService';

export async function loginWithGoogle(): Promise<{ user: User; profile: PlayerProfile }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const defaultName = user.displayName || user.email?.split('@')[0] || 'Corredor';
    const profile = await getOrCreatePlayerProfile(
      user.uid,
      defaultName,
      user.email || '',
      user.photoURL || ''
    );
    return { user, profile };
  } catch (error) {
    console.error('Erro ao iniciar sessão com Google:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}
