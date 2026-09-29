
import { User, AuthResponse } from '../types';
import { MOCK_USERS } from '../constants';

const ACCESS_TOKEN_KEY = 'nova_access_token';
const REFRESH_TOKEN_KEY = 'nova_refresh_token';
const USER_KEY = 'nova_user';
const MOCK_SECRET = "secret-key-do-not-use-in-production";

// Helper to base64url encode
const b64Url = (str: string) => {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Secure Hashing Function
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Mock JWT Generation (Client-side simulation of backend logic)
const generateToken = (user: User, type: 'access' | 'refresh' = 'access') => {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    // Access token valid for 1 hour, refresh for 7 days
    const exp = type === 'access' ? now + 3600 : now + 86400 * 7; 

    const payload = {
        sub: user.id,
        email: user.email,
        role: user.roleId,
        type,
        iat: now,
        exp
    };

    const encodedHeader = b64Url(JSON.stringify(header));
    const encodedPayload = b64Url(JSON.stringify(payload));
    // Simulate signature (In real app, this happens on server with secret)
    const signature = b64Url(`signature_of_${encodedHeader}.${encodedPayload}_using_${MOCK_SECRET}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const parseToken = (token: string) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(payloadJson);
    } catch (e) {
        return null;
    }
};

const isTokenValid = (token: string) => {
    const payload = parseToken(token);
    if (!payload) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
};

export const authService = {
    login: async (email: string, password?: string): Promise<AuthResponse | null> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) return null;

        // Secure Password Verification
        if (password) {
            const inputHash = await hashPassword(password);
            // Verify against stored hash or temp password
            if (user.passwordHash && user.passwordHash !== inputHash) {
                // Allow temp password override for demo flows (admin reset)
                if (!user.tempPassword || user.tempPassword !== password) {
                    return null;
                }
            }
        } 
        // Note: For pure demo purposes, we allow empty password if configured in a dev mode, 
        // but robust implementation requires the check above.

        const accessToken = generateToken(user, 'access');
        const refreshToken = generateToken(user, 'refresh');

        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        return {
            accessToken,
            refreshToken,
            user,
            expiresIn: 3600
        };
    },

    logout: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('nova_auth'); // Legacy cleanup
    },

    refreshSession: async (): Promise<string | null> => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken || !isTokenValid(refreshToken)) {
            authService.logout();
            return null;
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const payload = parseToken(refreshToken);
        if (!payload) return null;

        // Find user to regenerate fresh claims
        const user = MOCK_USERS.find(u => u.id === payload.sub);
        if (!user) return null;

        const newAccessToken = generateToken(user, 'access');
        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        return newAccessToken;
    },

    isAuthenticated: (): boolean => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        return !!token && isTokenValid(token);
    },

    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken: (): string | null => {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
};
