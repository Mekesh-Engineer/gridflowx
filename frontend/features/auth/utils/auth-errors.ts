export function mapAuthError(codeOrMsg: string, defaultMessage = 'An unexpected authentication error occurred.'): string {
  const lower = (codeOrMsg || '').toLowerCase();
  if (lower.includes('invalid login') || lower.includes('invalid_grant') || lower.includes('invalid credential') || lower.includes('wrong-password') || lower.includes('user-not-found')) {
    return 'Invalid email or password.';
  }
  if (lower.includes('user already registered') || lower.includes('email-already-in-use') || lower.includes('already exists')) {
    return 'An account with this email already exists.';
  }
  if (lower.includes('weak-password') || lower.includes('password should be at least')) {
    return 'Password should be at least 6 characters.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('too-many-requests')) {
    return 'Too many attempts. Please try again in a few moments.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email address before logging in.';
  }
  return codeOrMsg || defaultMessage;
}

