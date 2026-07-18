import { signInWithEmailAndPassword, signOut as fbSignOut, UserCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function loginWithCredentials(email: string, password: string): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error("Authentication failed:", err);
    throw err;
  }
}

export async function logout(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.error("Signout failed:", err);
    throw err;
  }
}
