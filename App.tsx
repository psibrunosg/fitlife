import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { User } from './types';
import { auth, onAuthStateChanged, signOut, db, doc, getDoc } from './firebase';

// Simple Router State
type ViewState = 'login' | 'register' | 'dashboard';

export default function App() {
  const [view, setView] = useState<ViewState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get their profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists) {
          const userData = { uid: firebaseUser.uid, ...userDoc.data() } as User;
          setUser(userData);
          setView('dashboard');
        } else {
          // Profile doesn't exist, something is wrong, log them out
          await signOut(auth);
          setUser(null);
          setView('login');
        }
      } else {
        // User is signed out
        setUser(null);
        setView('login');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setView('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-emerald-400">
        <div className="animate-spin text-4xl"><i className="ph ph-spinner"></i></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {view === 'login' && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onNavigateRegister={() => setView('register')} 
        />
      )}
      
      {view === 'register' && (
        <Register 
          onNavigateLogin={() => setView('login')} 
        />
      )}

      {view === 'dashboard' && user && (
        <>
          {user.workoutType === 'admin' || user.workoutType === 'trainer' ? (
            <AdminDashboard user={user} onLogout={handleLogout} />
          ) : (
            <UserDashboard user={user} onLogout={handleLogout} />
          )}
        </>
      )}
    </div>
  );
}