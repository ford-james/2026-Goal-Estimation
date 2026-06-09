import { useState, useEffect } from 'react';
import { api } from '../api';

export function UserSelect({ onSelect }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers()
      .then(setUsers)
      .catch(err => console.error('Error loading users:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 'var(--spacing-05)'
      }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--ibm-gray-70)', fontSize: '0.875rem' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-07)',
      animation: 'fadeIn 0.6s ease-out'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--spacing-09)', animation: 'slideIn 0.6s ease-out' }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: 'var(--spacing-04)',
            animation: 'scaleIn 0.5s ease-out'
          }}>
            ⚽
          </div>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '600',
            marginBottom: 'var(--spacing-03)',
            background: 'linear-gradient(135deg, var(--ibm-blue-60) 0%, var(--ibm-purple-50) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            2026 World Cup Predictions
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--ibm-gray-70)',
            fontWeight: '400'
          }}>
            Who are you?
          </p>
        </div>

        {/* User Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--spacing-06)',
          marginBottom: 'var(--spacing-07)'
        }}>
          {users.map((user, index) => (
            <button
              key={user.id}
              onClick={() => onSelect(user.id)}
              className="card hover-lift"
              style={{
                padding: 'var(--spacing-07) var(--spacing-05)',
                fontSize: '1.125rem',
                fontWeight: '600',
                background: 'white',
                color: 'var(--ibm-gray-100)',
                border: '2px solid transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
                fontFamily: 'var(--font-family)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = user.avatar_color;
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 12px 32px ${user.avatar_color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Color accent bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${user.avatar_color} 0%, ${user.avatar_color}cc 100%)`,
                transition: 'height 0.3s ease'
              }} />
              
              {/* Avatar circle */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${user.avatar_color} 0%, ${user.avatar_color}dd 100%)`,
                margin: '0 auto var(--spacing-04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                color: 'white',
                fontWeight: '700',
                boxShadow: `0 4px 12px ${user.avatar_color}40`,
                transition: 'all 0.3s ease'
              }}>
                {user.display_name.charAt(0)}
              </div>
              
              {/* Name */}
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--ibm-gray-100)',
                marginBottom: 'var(--spacing-02)',
                lineHeight: '1.3'
              }}>
                {user.name.split(' ').map((part, idx) => (
                  <div key={idx}>{part}</div>
                ))}
              </div>
              
              {/* Subtitle */}
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--ibm-gray-60)',
                fontWeight: '400'
              }}>
                Click to continue
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: 'var(--spacing-06)',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          animation: 'fadeIn 0.8s ease-out 0.5s both'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--ibm-gray-70)',
            margin: 0
          }}>
            🏆 Predict daily goals • Compete with your team • Win the championship
          </p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
