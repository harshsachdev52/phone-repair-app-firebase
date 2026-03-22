import { NavLink } from 'react-router-dom';
import { Home, PlusSquare, List, Wrench } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Wrench className="w-6 h-6" />
        <span>Phonefix</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} end>
          <Home className="w-5 h-5" />
          Dashboard
        </NavLink>
        <NavLink to="/new" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <PlusSquare className="w-5 h-5" />
          New Job
        </NavLink>
        <NavLink to="/jobs" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <List className="w-5 h-5" />
          All Jobs
        </NavLink>
      </nav>
    </aside>
  );
}
