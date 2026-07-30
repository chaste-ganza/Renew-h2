import { useFsmState } from '@/hooks/useFsmState';
import styles from './SOS.module.css';

export function SOS() {
  const { dispatch } = useFsmState();
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.closeBtn} onClick={() => dispatch({ type: 'CLOSE' })}>
          ✕ Close
        </button>
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>You are not alone.</h1>
        <p className={styles.description}>
          If you are in immediate danger or need someone to talk to right away, help is available.
        </p>

        <a href="tel:114" className={styles.primaryContact}>
          <span className={styles.contactIcon}>📞</span>
          <div className={styles.contactText}>
            <strong>Call 114</strong>
            <span>Rwanda Mental Health Helpline</span>
          </div>
        </a>

        <div className={styles.secondaryActions}>
          <button className={styles.groundingBtn} onClick={() => dispatch({ type: 'CLOSE' })}>
            I just need to breathe
          </button>
        </div>
      </div>
    </div>
  );
}
