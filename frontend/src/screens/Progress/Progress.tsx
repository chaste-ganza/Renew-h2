import { Link } from 'react-router-dom';
import styles from './Progress.module.css';

export function Progress() {
  const growthPoints = 142; // Mock cumulative points

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backBtn}>← Home</Link>
        <h1 className={styles.title}>Your Journey</h1>
      </header>

      <div className={styles.content}>
        <p className={styles.description}>
          Every time you check in or complete an activity, your growth points increase. This reflects your cumulative effort to take care of yourself.
        </p>

        <div className={styles.pointsVisual}>
          <div className={styles.circle}>
            <span className={styles.pointsNumber}>{growthPoints}</span>
            <span className={styles.pointsLabel}>Growth Points</span>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Active Days</span>
            <span className={styles.statValue}>12</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Activities Completed</span>
            <span className={styles.statValue}>8</span>
          </div>
        </div>
      </div>
    </div>
  );
}
