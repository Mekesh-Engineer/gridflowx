export interface PromoPanelConfig {
  badge: string;
  headlineLine1: string;
  headlineLine2: string;
  subtitle: string;
  cards: {
    icon: any;
    title: string;
    description: string;
  }[];
}

export function mapFirebaseError(code: string, defaultMessage: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return defaultMessage || 'An unexpected authentication error occurred.';
  }
}
