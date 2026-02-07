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

            // Normalize role immediately on load
            if (user.role === 'user') {
                user.role = 'customer';
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
                role: user.role === 'user' ? 'customer' : user.role,
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
            const fbUser = result.user;
            console.log("DEBUG: loginWithGoogle result. fbUser.email:", fbUser.email, "fbUser.displayName:", fbUser.displayName);

            // Sync with backend immediately
            const response = await api.post('/auth/google', {
                name: fbUser.displayName,
                email: fbUser.email,
                googleId: fbUser.uid
            });

            const { token, user: backendUser } = response.data;
            console.log("DEBUG: loginWithGoogle backend response. backendUser.name:", backendUser.name, "backendUser.email:", backendUser.email);

            // Force role to 'customer' in userProfile for Google logins
            const profileData = {
                ...backendUser,
                uid: fbUser.uid,
                role: 'customer', // Force customer role locally
                isBackendUser: true
            };

            setCurrentUser(fbUser);
            setUserProfile(profileData);

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(profileData));

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
            console.log("DEBUG: onAuthStateChanged trigger. fbUser exists:", !!fbUser);
            try {
                if (fbUser) {
                    // Firebase user exists - sync profile from Firestore
                    const docRef = doc(db, "users", fbUser.uid);
                    console.log("DEBUG: Fetching Firestore doc for:", fbUser.uid);
                    const docSnap = await getDoc(docRef);

                    let profileData = {
                        uid: fbUser.uid,
                        email: fbUser.email,
                        displayName: fbUser.displayName || fbUser.email.split('@')[0],
                        name: fbUser.displayName || fbUser.email.split('@')[0],
                        role: 'customer'
                    };

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        console.log("DEBUG: Firestore doc found:", data);
                        profileData = {
                            ...profileData,
                            ...data,
                            displayName: data.displayName || data.name || profileData.displayName,
                            name: data.name || data.displayName || profileData.name
                        };
                    } else {
                        console.log("DEBUG: No Firestore doc. Creating default profile.");
                        await setDoc(docRef, { ...profileData, createdAt: serverTimestamp() }).catch(e => console.error("Auto profile creation failed", e));
                    }

                    // AUTO-SYNC WITH BACKEND ON RECOVERY
                    // If we have a Firebase user but no backend token or the role is inconsistent
                    const localToken = localStorage.getItem('token');
                    if (!localToken || localToken.length < 50) { // Simple check for non-JWT token
                        console.log("DEBUG: Firebase user detected but no valid backend token. Syncing email:", fbUser.email);
                        try {
                            const response = await api.post('/auth/google', {
                                name: fbUser.displayName,
                                email: fbUser.email,
                                googleId: fbUser.uid
                            });
                            const { token, user: backendUser } = response.data;
                            console.log("DEBUG: Auto-sync backend response. backendUser.name:", backendUser.name);
                            localStorage.setItem('token', token);
                            profileData = { ...profileData, ...backendUser, role: 'customer' };
                        } catch (syncErr) {
                            console.error("Auto-sync failed", syncErr);
                        }
                    }

                    // Enforce 'customer' role for all Google/Firebase sessions as requested
                    profileData.role = 'customer';

                    localStorage.setItem('user', JSON.stringify(profileData));
                    setCurrentUser(fbUser);
                    setUserProfile(profileData);
                } else {
                    const localUserStr = localStorage.getItem('user');
                    if (localUserStr) {
                        try {
                            const localUser = JSON.parse(localUserStr);
                            if (localUser && (localUser.isBackendUser || localUser.uid)) {
                                console.log("DEBUG: Found local backend user:", localUser.email);
                                // Normalize role for local user
                                const normalizedLocalUser = {
                                    ...localUser,
                                    role: localUser.role === 'user' ? 'customer' : localUser.role,
                                    displayName: localUser.displayName || localUser.name
                                };
                                setCurrentUser(normalizedLocalUser);
                                setUserProfile(normalizedLocalUser);
                            } else {
                                // Only clear if we are SURE there's no backend session
                                // If loading was true, we might just be waiting.
                                console.log("DEBUG: No valid local backend user. Clearing.");
                                setCurrentUser(null);
                                setUserProfile(null);
                            }
                        } catch (e) {
                            console.error("Failed to parse local user during fallback", e);
                        }
                    } else {
                        // Only clear if no Firebase user AND no local storage
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
