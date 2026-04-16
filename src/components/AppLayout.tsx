import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  LayoutDashboard, 
  Kanban, 
  LogOut, 
  Search,
  ChevronRight,
  Plus,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { NotificationBell } from './NotificationBell';

interface LayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Tableau de bord', path: '/leads', icon: LayoutDashboard },
    { label: 'Pipeline', path: '/pipeline', icon: Kanban },
    ...(user?.role === 'ADMIN' ? [{ label: 'Équipe', path: '/users', icon: Users }] : []),
  ];

  return (
    <div className="app-layout">
      {/* Sidebar V2 - Creative & Floating */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="sidebar"
      >
        <div className="sidebar-logo">
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'white', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--bg-sidebar)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <BrainCircuit size={24} />
          </div>
          <span style={{ fontSize: '1.25rem' }}>CRM</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    style={{ marginLeft: 'auto' }}
                  >
                    <ChevronRight size={16} />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="flex-center" style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.firstName}
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{user?.role}</div>
            </div>
          </div>
          <button 
            className="nav-item" 
            style={{ width: '100%', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: 'none', justifyContent: 'center' }} 
            onClick={logout}
          >
            <LogOut size={18} />
            <span>Sortie</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="main-wrapper">
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="header"
        >
          <div className="flex-center" style={{ flex: 1 }}>
            <div style={{ position: 'relative', width: '350px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Rechercher un client, une note..." 
                style={{ paddingLeft: '48px', width: '100%', border: 'none', background: '#f1f5f9' }}
              />
            </div>
          </div>

          <div className="flex-center">
            <NotificationBell />
            <button className="primary" style={{ padding: '0.6rem 1rem', borderRadius: '12px' }}>
              <Plus size={18} />
              <span>Nouveau</span>
            </button>
          </div>
        </motion.header>

        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="content-area"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
