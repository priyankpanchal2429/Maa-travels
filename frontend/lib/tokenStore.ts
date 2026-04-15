/**
 * Module-level access token store.
 * Keeps the token out of React state (no re-renders) and out of localStorage (XSS safe).
 * The Axios interceptor reads from here on every request.
 */
let _accessToken: string | null = null;

export const tokenStore = {
  get: (): string | null => _accessToken,
  set: (token: string | null): void => { _accessToken = token; },
  clear: (): void => { _accessToken = null; },
};
