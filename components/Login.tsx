import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword, db, doc, getDoc } from '../firebase';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigateRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user profile from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists) {
        const userData = { uid: firebaseUser.uid, ...userDoc.data() } as User;
        onLoginSuccess(userData);
      } else {
        setError('Perfil de usuário não encontrado no banco de dados.');
        await auth.signOut(); // Log out if profile is missing
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha inválidos.');
      } else {
        setError('Ocorreu um erro. Tente novamente.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_top_right,rgba(0,255,136,0.1),transparent_40%)]">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Fit<span className="text-emerald-400">Life</span></h1>
          <p className="text-zinc-500 text-sm mt-2">Sua evolução começa no login.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">E-mail</label>
            <input 
              type="email" 
              required
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Senha</label>
            <input 
              type="password" 
              required
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-red-400 text-sm text-center">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'AUTENTICANDO...' : 'ACESSAR SISTEMA'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button onClick={onNavigateRegister} className="text-zinc-500 hover:text-emerald-400 transition-colors">
            Não tem conta? Criar agora
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;