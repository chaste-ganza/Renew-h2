import { Link, useLocation } from 'react-router-dom';
import styles from './BottomNav.module.css';
import { useFsmState } from '@/hooks/useFsmState';

export function BottomNav() {
  const location = useLocation();
  const { dispatch } = useFsmState();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={styles.navWrapper}>
      {/* Floating Action Button */}
      <button 
        className={styles.fab}
        onClick={() => dispatch({ type: 'START_CHECKIN' })}
        aria-label="Quick Entry: Start Check-In or Activity"
      >
        <span className={styles.fabIcon} aria-hidden="true">+</span>
      </button>

      {/* Tab Bar */}
      <nav className={styles.bottomNav} aria-label="Main Navigation">
        <Link to="/" className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`} aria-label="Home Tab">
          <span className={styles.icon} aria-hidden="true">🏠</span>
          <span className={styles.label}>Home</span>
        </Link>
        
        <Link to="/history" className={`${styles.navItem} ${isActive('/history') ? styles.active : ''}`} aria-label="History Tab">
          <span className={styles.icon} aria-hidden="true">🕰️</span>
          <span className={styles.label}>History</span>
        </Link>

        <Link to="/support" className={`${styles.navItem} ${isActive('/support') ? styles.active : ''}`} aria-label="Find Support Tab">
          <span className={styles.icon} aria-hidden="true">🔍</span>
          <span className={styles.label}>Find</span>
        </Link>

        <Link to="/progress" className={`${styles.navItem} ${isActive('/progress') ? styles.active : ''}`} aria-label="Progress Tab">
          <span className={styles.icon} aria-hidden="true">📈</span>
          <span className={styles.label}>Progress</span>
        </Link>
      </nav>
    </div>
  );
}
