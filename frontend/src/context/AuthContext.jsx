// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { getUserDocument, createUserDocument } from '../firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          // Try to get existing user document
          let doc = await getUserDocument(firebaseUser.uid);

          // If document doesn't exist yet, create it first
          if (!doc) {
            await createUserDocument(firebaseUser, {
              displayName: firebaseUser.displayName || '',
            });
            doc = await getUserDocument(firebaseUser.uid);
          }

          setUserDoc(doc);
        } catch (err) {
          // Never block navigation due to Firestore errors
          console.warn('AuthContext: could not load user doc', err);
          setUserDoc(null);
        }
      } else {
        setUser(null);
        setUserDoc(null);
      }

      // ✅ Always set loading false — even if Firestore fails
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshUserDoc = async () => {
    if (!user) return;
    try {
      const doc = await getUserDocument(user.uid);
      setUserDoc(doc);
    } catch (err) {
      console.warn('refreshUserDoc failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, refreshUserDoc }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}