import {
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    type User,
} from 'firebase/auth';
import { ref, set, serverTimestamp } from 'firebase/database';
import { auth, db } from '@/lib/firebase';

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
