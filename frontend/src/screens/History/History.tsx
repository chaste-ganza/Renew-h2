import styles from './History.module.css';

// Mock static timeline
const MOCK_HISTORY = [
  { id: 1, date: 'Today', mood: 'Feeling a bit restless, but okay.', completedTask: true },
  { id: 2, date: 'Yesterday', mood: 'Calm / Okay', completedTask: true },
  { id: 3, date: 'Tuesday', mood: 'Craving / Urge', completedTask: false },
  { id: 4, date: 'Monday', mood: 'Low / Sad', completedTask: true },
];

export function History() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>History</h1>
        <p className={styles.subtitle}>Your private timeline.</p>
      </header>

      <div className={styles.timeline}>
        {MOCK_HISTORY.map((entry) => (
          <div key={entry.id} className={styles.entryCard}>
            <div className={styles.entryHeader}>
              <span className={styles.date}>{entry.date}</span>
              {entry.completedTask && (
                <span className={styles.taskBadge} aria-label="Task Completed">✨ Activity</span>
              )}
            </div>
            <p className={styles.moodText}>"{entry.mood}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}
