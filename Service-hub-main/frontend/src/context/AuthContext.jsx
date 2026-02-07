import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

import { AuthContext } from './AuthContextStore';

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signup(email, password, role = 'customer') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        try {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: email,
                role: role,
                createdAt: serverTimestamp()
            });
        } catch (e) {
            console.error("Profile creation failed during signup", e);
        }

        return result;
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function loginWithGoogle() {
        return signInWithPopup(auth, googleProvider);
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                setCurrentUser(user);
                if (user) {
                    const docRef = doc(db, "users", user.uid);

                    // Race the profile fetch against a 5s timeout
                    const fetchProfile = async () => {
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            let data = docSnap.data();
                            // Normalize role
                            if (data.role === 'user') {
                                data.role = 'customer';
                                setDoc(docRef, { role: 'customer' }, { merge: true }).catch(err => console.error("Role fix failed", err));
                            }
                            return data;
                        }
                        return null;
                    };

                    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));

                    try {
                        const data = await Promise.race([fetchProfile(), timeout]);
                        if (data) {
                            setUserProfile(data);
                        } else {
                            // Fallback for social login or missing profile
                            const fallback = { uid: user.uid, email: user.email, role: 'customer' };
                            setUserProfile(fallback);
                            setDoc(docRef, { ...fallback, createdAt: serverTimestamp() }).catch(err => console.error("Fallback creation failed", err));
                        }
                    } catch (e) {
                        console.warn("Profile fetch timed out, using guest profile", e);
                        setUserProfile({ uid: user.uid, email: user.email, role: 'customer' });
                    }
                } else {
                    setUserProfile(null);
                }
            } catch (error) {
                console.error("Auth transformation error:", error);
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
