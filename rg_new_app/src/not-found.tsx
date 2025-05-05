import { Link } from 'react-router-dom';

export default function NotFound() {
  const theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  
  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      textAlign: 'center' as const,
      backgroundColor: theme === 'light' ? '#FFF8DC' : '#2C2C2C',
    },
    header: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: theme === 'light' ? '#FF4500' : '#FF6347',
      marginBottom: '20px',
    },
    text: {
      fontSize: '18px',
      color: theme === 'light' ? '#333' : '#E0E0E0',
      marginBottom: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>404 - Page Not Found 🤦‍♂️</h1>
      <p style={styles.text}>Looks like you wandered into the swamp, partner!</p>
      <Link to="/" className="action-button" aria-label="Back to home">
        <span className="action-button-text">Head Back Home 🏠</span>
      </Link>
    </div>
  );
}