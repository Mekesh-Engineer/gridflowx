'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore, AuthUser } from '@/store/zustand/stores';
import { UserRole } from '@/lib/constants';

interface AuthContextType {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({ isInitialized: false });

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Fetch additional profile from Firestore (to get Role, etc.)
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let role = UserRole.OPERATOR;
          let firstName = null;
          let lastName = null;
          let dob = null;
          let gender = null;
          let consents = null;

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            role = (data.role as UserRole) || UserRole.OPERATOR;
            firstName = data.firstName || null;
            lastName = data.lastName || null;
            dob = data.dob || null;
            gender = data.gender || null;
            consents = data.consents || null;
          } else {
            // New user or Google login with no Firestore document yet
            // Split display name if available
            const nameParts = (firebaseUser.displayName || '').split(' ');
            firstName = nameParts[0] || 'Guest';
            lastName = nameParts.slice(1).join(' ') || 'User';

            // Create initial Firestore doc
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Guest User',
              firstName,
              lastName,
              role: UserRole.OPERATOR,
              dob: null,
              gender: null,
              emailVerified: firebaseUser.emailVerified,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }

          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || `${firstName} ${lastName}`,
            firstName,
            lastName,
            photoURL: firebaseUser.photoURL,
            phoneNumber: firebaseUser.phoneNumber,
            role,
            emailVerified: firebaseUser.emailVerified,
            dob,
            gender,
            consents,
          };

          setUser(authUser);
        } else {
          clearUser();
        }
      } catch (error) {
        console.error('Error syncing auth state:', error);
        clearUser();
      } finally {
        setIsInitialized(true);
      }
    });

    return () => unsubscribe();
  }, [setUser, clearUser]);

  return (
    <AuthContext.Provider value={{ isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}
