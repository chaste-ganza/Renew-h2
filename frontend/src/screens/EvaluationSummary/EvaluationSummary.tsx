import { useFsmState } from '@/hooks/useFsmState';
import styles from './EvaluationSummary.module.css';

export function EvaluationSummary() {
  const { dispatch } = useFsmState();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.chromeRight}>
          <button className={styles.sosBtn} onClick={() => dispatch({ type: 'OPEN_SOS' })} aria-label="Open SOS">
            SOS
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.title}>You are doing great.</h1>
          <p className={styles.description}>
            Today seems like a heavier day. That's completely normal. Let's start with something small and manageable to help you reset.
          </p>
        </div>
        
        <button className={styles.primaryBtn} onClick={() => dispatch({ type: 'CONTINUE' })}>
          See today's step
        </button>
      </div>
    </div>
  );
}
