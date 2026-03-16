import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // ── Primary: role stored in localStorage by the login page toggle ──
        const cachedRole = localStorage.getItem('rtbs_role');
        if (cachedRole === 'driver' || cachedRole === 'passenger') {
          setUserRole(cachedRole);
          setLoading(false);
          return;
        }

        // ── Fallback: Firestore users/{uid} document ──
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists() && snap.data().role) {
            setUserRole(snap.data().role);
          } else {
            // Last resort: guess from email for demo accounts
            const role = firebaseUser.email?.startsWith('driver') ? 'driver' : 'passenger';
            setUserRole(role);
          }
        } catch {
          // Firestore rules may block read — fall back to email heuristic
          const role = firebaseUser.email?.startsWith('driver') ? 'driver' : 'passenger';
          setUserRole(role);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('rtbs_role'); // clear cached role on logout
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
