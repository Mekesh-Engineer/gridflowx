import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { ref, set, serverTimestamp } from 'firebase/database';
import { auth, db } from '@/lib/firebase';

export interface DecodedCustomClaims {
  role: "admin" | "supervisor" | "operator" | "auditor";
  tenantId?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: string;
  dob?: string;
  gender?: string;
  country?: string;
  city?: string;
  terms: boolean;
  consents: {
    terms: boolean;
    marketing: boolean;
    whatsapp: boolean;
    liveLocation: boolean;
  };
}

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

export const loginWithCredentials = loginWithEmail;

export async function loginWithGoogle(): Promise<UserCredential> {
  await initAuthPersistence();
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function logout(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.error("Signout failed:", err);
    throw err;
  }
}

export const logoutService = logout;

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

export async function registerWithEmail(payload: RegisterPayload): Promise<User> {
  const { email, password, displayName, firstName, lastName, role, dob, gender, country, city, consents } = payload;

  // 1. Create the Firebase Auth user
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  // 2. Update the display name
  await updateProfile(user, { displayName });

  // 3. Send email verification
  await sendEmailVerification(user, {
    url: `${typeof window !== 'undefined' ? window.location.origin : ''}/login?verified=true`,
    handleCodeInApp: false,
  });

  // 4. Write user profile to Realtime Database
  await set(ref(db, `users/${user.uid}`), {
    uid: user.uid,
    email,
    displayName,
    firstName,
    lastName,
    role,
    dob: dob ?? null,
    gender: gender ?? null,
    country: country ?? null,
    city: city ?? null,
    emailVerified: false,
    consents,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
}

export async function getUserCustomClaims(user: User): Promise<DecodedCustomClaims> {
  try {
    const idTokenResult = await user.getIdTokenResult();
    const role = (idTokenResult.claims.role as DecodedCustomClaims["role"]) || "operator";
    return {
      role,
      tenantId: idTokenResult.claims.tenantId as string,
    };
  } catch (err) {
    console.error("Failed to parse custom claims:", err);
    return { role: "operator" };
  }
}
