'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Invalid email or password.');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh', background: '#000', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* bg glow */}
      <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'rgba(177,76,255,0.12)', filter: 'blur(120px)', top: -100, left: -100, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: 'rgba(106,0,255,0.08)', filter: 'blur(120px)', bottom: '10%', right: -80, pointerEvents: 'none' }} />

      <div style={{
        position: 'relative', zIndex: 2,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(177,76,255,0.25)',
        borderRadius: 24, padding: '48px 44px',
        width: '100%', maxWidth: 420,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 80px rgba(177,76,255,0.08)',
      }}>
        {/* logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(177,76,255,0.2), rgba(106,0,255,0.3))',
            border: '1px solid rgba(177,76,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(177,76,255,0.3)',
          }}>
            <Lock size={26} color="#b14cff" />
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>
            Code<span style={{ color: '#b14cff' }}>verza</span>
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#666', letterSpacing: 1, textTransform: 'uppercase' }}>Admin Panel</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Email</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0 16px' }}>
              <Mail size={15} color="rgba(177,76,255,0.7)" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin only" required
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '14px 0', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {/* password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Password</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0 16px' }}>
              <Lock size={15} color="rgba(177,76,255,0.7)" />
              <input
                type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '14px 0', fontFamily: 'inherit' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0 }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff6b6b', marginBottom: 18 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 16, borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg, #b14cff, #6a00ff)',
            color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
            boxShadow: '0 4px 24px rgba(177,76,255,0.4)',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
