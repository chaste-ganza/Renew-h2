import { useFsmState } from '@/hooks/useFsmState';
import styles from './TaskCard.module.css';

export function TaskCard() {
  const { dispatch } = useFsmState();
  
  // Mock task for demo purposes
  const task = {
    title: "Take a 5-minute walk outside",
    description: "Even a short walk can help clear your head and shift your perspective. Focus on feeling the ground under your feet.",
    category: "stress"
  };

  return (
    <div className={styles.container}>
      {/* Header Chrome */}
      <header className={styles.header}>
        <div className={styles.chromeRight}>
          <button className={styles.sosBtn} onClick={() => dispatch({ type: 'OPEN_SOS' })}>SOS</button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.card}>
          <span className={styles.categoryBadge}>Suggested Activity</span>
          <h1 className={styles.title}>{task.title}</h1>
          <p className={styles.description}>{task.description}</p>
        </div>

        {/* Primary Actions (Equal weight) */}
        <div className={styles.primaryActions}>
          <button 
            className={styles.doneBtn} 
            onClick={() => dispatch({ type: 'COMPLETE' })}
          >
            Done
          </button>
          <button 
            className={styles.skipBtn} 
            onClick={() => dispatch({ type: 'SKIP' })}
          >
            Skip for now
          </button>
        </div>

        {/* Secondary Actions (Smaller) */}
        <div className={styles.secondaryActions}>
          <button className={styles.secondaryBtn}>Reduce Difficulty</button>
          <button className={styles.secondaryBtn}>Postpone</button>
          <button className={styles.secondaryBtn}>Complete With Someone</button>
        </div>
      </div>
    </div>
  );
}
