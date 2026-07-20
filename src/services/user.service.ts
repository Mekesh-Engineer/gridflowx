import {
  ref,
  get,
  set,
  update,
  serverTimestamp,
  query,
  orderByChild,
} from 'firebase/database';
import { type User } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { UserRole } from '@/lib/constants';

export interface UserConsents {
  terms: boolean;
  marketing: boolean;
  whatsapp: boolean;
  liveLocation: boolean;
}

export interface UserProfileDocument {
  uid: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  role: UserRole | string;
  dob?: string | null;
  gender?: string | null;
  country?: string | null;
  city?: string | null;
  emailVerified: boolean;
  consents?: UserConsents;
  avatarUrl?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

export async function getUserProfile(uid: string): Promise<UserProfileDocument | null> {
  try {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val() as UserProfileDocument;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function syncUserProfile(user: User): Promise<UserProfileDocument> {
  const names = (user.displayName || 'Operator User').split(' ');
  const firstName = names[0] || 'Operator';
  const lastName = names.slice(1).join(' ') || '';

  const fallbackProfile: UserProfileDocument = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || 'Operator User',
    firstName,
    lastName,
    role: UserRole.OPERATOR,
    dob: null,
    gender: null,
    country: null,
    city: null,
    emailVerified: user.emailVerified,
    consents: {
      terms: true,
      marketing: false,
      whatsapp: false,
      liveLocation: false,
    },
    avatarUrl: user.photoURL || null,
  };

  try {
    const tokenResult = await user.getIdTokenResult();
    if (tokenResult.claims && tokenResult.claims.role) {
      fallbackProfile.role = tokenResult.claims.role as UserRole;
    }
  } catch {
    // Ignore token claim fetch error
  }

  try {
    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const existing = snapshot.val() as UserProfileDocument;
      if (existing.emailVerified !== user.emailVerified) {
        try {
          await update(userRef, {
            emailVerified: user.emailVerified,
            updatedAt: serverTimestamp(),
          });
        } catch (e) {
          console.warn('Could not update emailVerified in Realtime Database:', e);
        }
        existing.emailVerified = user.emailVerified;
      }
      return existing;
    }

    try {
      await set(userRef, {
        ...fallbackProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Could not save new profile to Realtime Database:', e);
    }
    return fallbackProfile;
  } catch (error) {
    console.warn('RTDB user profile sync failed. Using fallback profile:', error);
    return fallbackProfile;
  }
}

export async function updateUserProfileData(
  uid: string,
  data: Partial<Omit<UserProfileDocument, 'uid' | 'role' | 'emailVerified' | 'createdAt'>>
): Promise<void> {
  const userRef = ref(db, `users/${uid}`);
  await update(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function fetchAllUsers(): Promise<UserProfileDocument[]> {
  try {
    const usersRef = query(ref(db, 'users'), orderByChild('createdAt'));
    const snapshot = await get(usersRef);
    if (!snapshot.exists()) return [];
    
    const usersList: UserProfileDocument[] = [];
    snapshot.forEach((childSnapshot) => {
       usersList.push(childSnapshot.val() as UserProfileDocument);
    });
    return usersList.reverse();
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

export async function updateUserRole(targetUid: string, newRole: UserRole | string): Promise<void> {
  const userRef = ref(db, `users/${targetUid}`);
  await update(userRef, {
    role: newRole,
    updatedAt: serverTimestamp(),
  });
}
