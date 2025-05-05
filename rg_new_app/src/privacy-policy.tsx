import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  const theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: theme === 'light' ? '#FFF8DC' : '#2C2C2C',
    },
    header: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: theme === 'light' ? '#FF4500' : '#FF6347',
      marginBottom: '20px',
      textAlign: 'center' as const,
    },
    section: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: theme === 'light' ? '#333' : '#E0E0E0',
      margin: '15px 0 5px',
    },
    text: {
      fontSize: '16px',
      color: theme === 'light' ? '#333' : '#E0E0E0',
      marginBottom: '10px',
    },
    footer: {
      minHeight: '200px',
      padding: '20px 0',
      zIndex: 1000,
      backgroundColor: theme === 'light' ? '#FFF8DC' : '#2C2C2C',
      overflow: 'visible' as const,
      visibility: 'visible' as const,
      opacity: 1,
      display: 'block' as const,
    },
    footerContainer: {
      minHeight: '150px',
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      visibility: 'visible' as const,
      opacity: 1,
      display: 'block' as const,
    },
    footerLogo: {
      width: '100px',
      margin: '0 auto 10px',
      display: 'block',
    },
    footerContactText: {
      fontSize: '14px',
      color: theme === 'light' ? '#333' : '#E0E0E0',
      margin: '5px 0',
    },
    footerEmailLink: {
      color: theme === 'light' ? '#FF4500' : '#FF6347',
      textDecoration: 'none',
    },
    footerCopyright: {
      fontSize: '14px',
      color: theme === 'light' ? '#666' : '#999',
      margin: '5px 0',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🤪 Chuckle & Chow Privacy Policy 🕵️‍♂️</h1>
      <p style={styles.text}>
        Welcome to Chuckle & Chow, where we cook up chaos and keep your info as safe as Granny’s secret BBQ sauce recipe!
      </p>
      <p style={styles.text}>
        <strong>What We Collect:</strong> We might snag your email if you holler at us, or track what recipes you’re whippin’ up via cookies (not the edible kind, sadly). No sneaky stuff, just what’s needed to keep the app tasty.
      </p>
      <p style={styles.text}>
        <strong>How We Use It:</strong> Your data helps us serve up better recipes and maybe send you a newsletter spicier than a jalapeño’s armpit. We don’t share it with anyone, ‘cept maybe our trusty server hog.
      </p>
      <p style={styles.text}>
        <strong>Your Rights:</strong> You can tell us to keep our mitts off your data or delete it faster than you can say “yeehaw.” Just drop a line at bshoemak@mac.com.
      </p>
      <p style={styles.text}>
        <strong>Third Parties:</strong> We use Amazon affiliate links to keep the grill fired up. They might track clicks, but we ain’t responsible for their shenanigans—check their policies for the lowdown.
      </p>
      <p style={styles.text}>
        <strong>Updates:</strong> This policy might change quicker than a pig in a mudslide. We’ll let you know if we tweak it, so keep an eye out.
      </p>
      <p style={styles.text}>
        Got questions? Holler at{' '}
        <a href="mailto:bshoemak@mac.com" style={styles.footerEmailLink}>
          bshoemak@mac.com 📧
        </a>
      </p>
      <button
        className="action-button theme-toggle"
        onClick={() => window.history.back()}
        aria-label="Go back"
      >
        <span className="action-button-text">⬅️ Back to Where Ya Came From</span>
      </button>
      <Link to="/" className="action-button" aria-label="Back to home">
        <span className="action-button-text">🏠 Back Home, Y’all!</span>
      </Link>
      <div style={styles.footer}>
        <div style={{ ...styles.footerContainer, border: '6px solid red' }}>
          <img
            src="/assets/gt.png"
            alt="Game Theory Logo"
            style={styles.footerLogo}
            onError={(e) => (e.currentTarget.src = '/assets/fallback.png')}
          />
          <Link to="/privacy-policy" className="footer-privacy-text" aria-label="Privacy Policy">
            Privacy Policy 🕵️‍♂️
          </Link>
          <p style={styles.footerContactText}>
            Got issues? Holler at{' '}
            <a href="mailto:bshoemak@mac.com" style={styles.footerEmailLink} aria-label="Email support">
              bshoemak@mac.com 📧
            </a>
          </p>
          <p style={styles.footerCopyright}>© 2025 Chuckle & Chow 🌟</p>
          <img
            src="/assets/fallback.png"
            alt="Fallback"
            style={styles.footerLogo}
            onError={(e) => (e.currentTarget.src = '/assets/fallback.png')}
          />
        </div>
      </div>
    </div>
  );
}