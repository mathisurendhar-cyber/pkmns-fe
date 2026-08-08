export type AuthUser = {
  username?: string;
  name?: string;
  email?: string;
  role?: string;
};

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: AuthUser) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function isAdminRole(role?: string) {
  return role === 'admin' || role === 'super';
}

export function requireAuth(redirectTo = '/login'): AuthUser | null {
  const user = getCurrentUser();
  if (!user) {
    window.location.replace(redirectTo);
    return null;
  }
  return user;
}

export function logout(redirectTo = '/') {
  localStorage.clear();
  window.location.href = redirectTo;
}
