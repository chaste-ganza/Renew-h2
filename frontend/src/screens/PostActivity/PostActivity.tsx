import { useFsmState } from '@/hooks/useFsmState';
import styles from './PostActivity.module.css';

export function PostActivity() {
  const { dispatch } = useFsmState();
  
  return (
    <div className={styles.container}>
      {/* Header Chrome */}
      <header className={styles.header}>
        <button className={styles.chromeBtn} onClick={() => dispatch({ type: 'SKIP' })}>
          Skip
        </button>
        <div className={styles.chromeRight}>
          <button className={styles.sosBtn} onClick={() => dispatch({ type: 'OPEN_SOS' })}>SOS</button>
        </div>
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>Did this help?</h1>
        
        <div className={styles.optionsList}>
          <button 
            className={styles.optionBtn} 
            onClick={() => dispatch({ type: 'SUBMIT', payload: 'yes' })}
          >
            Yes, I feel better
          </button>
          
          <button 
            className={styles.optionBtn} 
            onClick={() => dispatch({ type: 'SUBMIT', payload: 'little' })}
          >
            A little bit
          </button>
          
          <button 
            className={styles.optionBtn} 
            onClick={() => dispatch({ type: 'SUBMIT', payload: 'no' })}
          >
            Not really
          </button>
        </div>
      </div>
    </div>
  );
}
