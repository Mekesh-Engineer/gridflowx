import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function initAuthPersistence(): Promise<void> {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.error('Failed to initialize auth persistence:', error);
  }
}

export async function loginWithEmail(email: string, password: string): Promise<UserCredential> {
  await initAuthPersistence();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle(): Promise<UserCredential> {
  await initAuthPersistence();
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function logoutService(): Promise<void> {
  return signOut(auth);
}

export async function sendPasswordResetService(email: string): Promise<void> {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/login` : '';
  return sendPasswordResetEmail(auth, email, {
    url,
    handleCodeInApp: false,
  });
}

export async function resendVerificationEmailService(user: User): Promise<void> {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/login?verified=true` : '';
  return sendEmailVerification(user, {
    url,
    handleCodeInApp: false,
  });
}
