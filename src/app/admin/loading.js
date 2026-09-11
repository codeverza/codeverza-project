'use client';

export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      background: '#000',
      color: '#fff'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid rgba(177, 76, 255, 0.2)',
        borderTopColor: '#b14cff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }}></div>
      <p style={{ fontSize: '16px', color: '#888' }}>Loading...</p>
      
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
