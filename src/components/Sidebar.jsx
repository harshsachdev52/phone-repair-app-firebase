import { NavLink, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, List, Wrench, X, LogOut } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            <span>Phonefix</span>
          </div>
          <button className="md-hidden text-slate-400 p-1" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} end onClick={onClose}>
            <Home className="w-5 h-5" />
            Dashboard
          </NavLink>
          <NavLink to="/new" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <PlusSquare className="w-5 h-5" />
            New Job
          </NavLink>
          <NavLink to="/jobs" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <List className="w-5 h-5" />
            All Jobs
          </NavLink>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={handleLogout} 
            className="nav-item w-full" 
            style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
      {isOpen && (
        <div className="mobile-overlay" onClick={onClose}></div>
      )}
    </>
  );
}
