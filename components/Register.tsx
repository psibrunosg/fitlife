import React, { useState } from 'react';
import { auth, createUserWithEmailAndPassword, db, setDoc, doc } from '../firebase';

interface RegisterProps {
  onNavigateLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigateLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Create user profile document in Firestore
      // FIX: Expected 3 arguments, but got 2. Adding empty object for options.
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        // No longer storing password here. Auth handles it.
        workoutType: 'iniciante', // Default role
        avatar: `https://ui-avatars.com/api/?name=${name.replace(" ", "+")}&background=random`,
        createdAt: new Date().toISOString()
      }, {});

      setSuccess(true);
      setTimeout(onNavigateLogin, 2000);

    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado.');
      } else {
        setError('Ocorreu um erro ao criar a conta.');
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
          <h1 className="text-3xl font-bold tracking-tight text-white">Criar <span className="text-emerald-400">Conta</span></h1>
          <p className="text-zinc-500 text-sm mt-2">Comece sua transformação hoje.</p>
        </div>

        {success ? (
          <div className="text-center text-emerald-400 font-semibold animate-pulse">
            Conta criada com sucesso! Redirecionando...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Nome Completo</label>
              <input 
                type="text" 
                required
                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                placeholder="Ex: Ana Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
                placeholder="Mínimo 6 caracteres"
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
              {loading ? 'CRIANDO...' : 'CRIAR CONTA'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <button onClick={onNavigateLogin} className="text-zinc-500 hover:text-emerald-400 transition-colors">
            Já tem conta? Fazer Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;