import { useState, useEffect } from 'react';
import { auth, firebaseInitialized } from '../firebase/config';
import firebase from 'firebase/compat/app';
import { DEV_USER_EMAIL, DEV_USER_PASSWORD } from '../firebase/dev-auth';

// Vite provides this environment variable. It's true during development, false in production.
// FIX: Replaced `import.meta.env.DEV` with `process.env.NODE_ENV === 'development'` to resolve the TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
const isDevMode = process.env.NODE_ENV === 'development';

export const useAuth = () => {
    const [user, setUser] = useState<firebase.User | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        if (firebaseInitialized && auth) {
            const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
                if (currentUser) {
                    // User is signed in.
                    setUser(currentUser);
                    setUserId(currentUser.uid);
                    setIsAuthReady(true);
                } else if (isDevMode) {
                    // No user, but in dev mode. Try to auto sign-in.
                    try {
                        console.log('Attempting to auto-login dev user...');
                        await auth.signInWithEmailAndPassword(DEV_USER_EMAIL, DEV_USER_PASSWORD);
                        // The onAuthStateChanged listener will be called again with the logged-in user.
                        // No need to set state here.
                    } catch (error: any) {
                        // If sign-in fails because user doesn't exist, create the user.
                        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                            try {
                                console.log('Dev user not found, creating new dev user...');
                                await auth.createUserWithEmailAndPassword(DEV_USER_EMAIL, DEV_USER_PASSWORD);
                                // onAuthStateChanged will be called again with the newly created user.
                            } catch (creationError) {
                                console.error("Dev user auto-creation failed:", creationError);
                                setAuthError("Failed to auto-create dev user.");
                                setIsAuthReady(true); // Mark as ready even if auto-login fails
                            }
                        } else {
                            console.error("Dev user auto-login failed:", error);
                            setAuthError("Failed to auto-login dev user.");
                            setIsAuthReady(true); // Mark as ready
                        }
                    }
                } else {
                    // Not in dev mode and no user is signed in.
                    setUser(null);
                    setUserId(null);
                    setIsAuthReady(true);
                }
            });
            return () => unsubscribe();
        } else {
            // Not using Firebase, so we're ready immediately with no user.
            setIsAuthReady(true);
        }
    }, []);

    const handleSignUp = async (email, password) => {
        if (!auth) return;
        try {
            setAuthError('');
            await auth.createUserWithEmailAndPassword(email, password);
        } catch (e: any) {
            setAuthError(e.message);
        }
    };

    const handleLogin = async (email, password) => {
        if (!auth) return;
        try {
            setAuthError('');
            await auth.signInWithEmailAndPassword(email, password);
        } catch (e: any) {
            setAuthError(e.message);
        }
    };

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await auth.signOut();
        } catch (e: any) {
            console.error("Error signing out:", e);
        }
    };

    return { user, userId, isAuthReady, authError, handleSignUp, handleLogin, handleLogout };
};