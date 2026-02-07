import { useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../lib/firebase';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { AuthContext } from './InternalAuthContext';
import api from '../api/axios';

/**
 * AuthProvider: Pure React Component.
 */
export function AuthProvider({ children }) {
    // Priority 1: Backend user from localStorage
    const getInitialUser = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return null;

            const user = JSON.parse(userStr);
            // Validation: Ensure user has an ID
            if (!user.uid && !user.id && !user._id) {
                console.warn("Invalid user found in localStorage (no ID). Clearing.");
                localStorage.removeItem('user');
                return null;
            }
            return user;
        } catch (e) {
            console.error("Corrupt user in localStorage", e);
            localStorage.removeItem('user');
            return null;
        }
    };

    const savedUser = getInitialUser();

    const [currentUser, setCurrentUser] = useState(savedUser);
    const [userProfile, setUserProfile] = useState(savedUser);
    const [loading, setLoading] = useState(true);

    async function signup(email, password, role = 'customer', name = '', serviceCategory = '') {
        try {
            const payload = {
                name: name || email.split('@')[0],
                email,
                password,
                role
            };

            if (role === 'provider' && serviceCategory) {
                payload.serviceCategory = serviceCategory;
            }

            const response = await api.post('/auth/signup', payload);
            return response.data;
        } catch (error) {
            console.error("Signup failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to create an account.');
        }
    }

    async function login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            const normalizedUser = {
                ...user,
                uid: user.id || user._id,
                displayName: user.name,
                isBackendUser: true
            };

            setCurrentUser(normalizedUser);
            setUserProfile(normalizedUser);

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(normalizedUser));

            return { user: normalizedUser };
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to log in.');
        }
    }

    async function loginWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result;
        } catch (error) {
            console.error("Google Sign-In Error", error);
            throw error;
        }
    }

    async function logout() {
        try {
            await signOut(auth);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
            setUserProfile(null);
        } catch (error) {
            console.error("Logout failed", error);
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            try {
                if (fbUser) {
                    // Firebase user exists - sync profile from Firestore
                    const docRef = doc(db, "users", fbUser.uid);
                    const docSnap = await getDoc(docRef);

                    let profileData = { uid: fbUser.uid, email: fbUser.email, role: 'customer' };

                    if (docSnap.exists()) {
                        profileData = { ...profileData, ...docSnap.data() };
                    } else {
                        // Create profile if missing
                        await setDoc(docRef, { ...profileData, createdAt: serverTimestamp() }).catch(e => console.error("Auto profile creation failed", e));
                    }

                    setCurrentUser(fbUser);
                    setUserProfile(profileData);
                } else {
                    // Firebase is null. Check if we have a backend user before nuking.
                    const localUser = JSON.parse(localStorage.getItem('user'));
                    if (localUser && localUser.isBackendUser) {
                        // Keep the backend user as is
                        setCurrentUser(localUser);
                        setUserProfile(localUser);
                    } else {
                        setCurrentUser(null);
                        setUserProfile(null);
                    }
                }
            } catch (error) {
                console.error("Auth sync error:", error);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = { currentUser, userProfile, signup, login, loginWithGoogle, logout, loading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
