import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'Harsh' && password === '210220') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-color)', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            <Wrench style={{ width: '2rem', height: '2rem' }} />
            <h1 className="text-2xl font-bold">Phonefix</h1>
          </div>
          <p className="text-muted">Enter your credentials to access the dashboard</p>
        </div>
        
        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group mb-4">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-control" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="form-group mb-6">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
