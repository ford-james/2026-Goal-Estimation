import { useState } from 'react';
import { UserSelect } from './pages/UserSelect';
import { Dashboard } from './pages/Dashboard';
import { Leaderboard } from './pages/Leaderboard';

function App() {
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [page, setPage] = useState('dashboard');

  const handleUserSelect = (id) => {
    localStorage.setItem('userId', id);
    setUserId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setUserId(null);
    setPage('dashboard');
  };

  if (!userId) {
    return <UserSelect onSelect={handleUserSelect} />;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav style={{ 
        padding: '0 var(--spacing-07)',
        height: '64px',
        background: 'linear-gradient(90deg, var(--ibm-blue-70) 0%, var(--ibm-blue-60) 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-07)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600',
          marginRight: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-03)',
          animation: 'slideIn 0.5s ease-out'
        }}>
          <span style={{ fontSize: '2rem' }}>⚽</span>
          <span>World Cup 2026</span>
        </div>
        
        <NavButton 
          active={page === 'dashboard'}
          onClick={() => setPage('dashboard')}
        >
          Dashboard
        </NavButton>
        
        <NavButton 
          active={page === 'leaderboard'}
          onClick={() => setPage('leaderboard')}
        >
          Leaderboard
        </NavButton>
        
        <button 
          onClick={handleLogout}
          style={{ 
            color: 'white', 
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            padding: 'var(--spacing-03) var(--spacing-05)',
            fontSize: '0.875rem',
            fontWeight: '500',
            borderRadius: '4px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: 'var(--font-family)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.25)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Logout
        </button>
      </nav>
      
      <main style={{ 
        paddingBottom: 'var(--spacing-10)',
        animation: 'fadeIn 0.4s ease-out'
      }}>
        {page === 'dashboard' && <Dashboard userId={userId} />}
        {page === 'leaderboard' && <Leaderboard />}
      </main>
    </div>
  );
}

function NavButton({ active, onClick, children }) {
  return (
    <button 
      onClick={onClick}
      style={{ 
        color: 'white', 
        background: active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 'var(--spacing-03) var(--spacing-05)',
        fontSize: '0.875rem',
        fontWeight: '500',
        borderRadius: '4px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        fontFamily: 'var(--font-family)'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.target.style.background = 'transparent';
        }
      }}
    >
      {children}
      {active && (
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '2px',
          background: 'white',
          borderRadius: '2px 2px 0 0',
          animation: 'scaleIn 0.3s ease-out'
        }} />
      )}
    </button>
  );
}

export default App;

// Made with Bob
