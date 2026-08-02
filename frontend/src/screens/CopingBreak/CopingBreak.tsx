import { useState, useEffect } from 'react';
import { useFsmState } from '@/hooks/useFsmState';
import styles from './CopingBreak.module.css';

export function CopingBreak() {
  const { dispatch } = useFsmState();
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  useEffect(() => {
    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          dispatch({ type: 'COMPLETE' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch]);

  useEffect(() => {
    // Breathing cycle (4s inhale, 4s hold, 6s exhale) roughly. Let's do 4-4-4 for simplicity here
    const cycleLength = 12000;
    
    const phaseTimer = setInterval(() => {
      setPhase('inhale');
      
      setTimeout(() => {
        setPhase('hold');
      }, 4000);

      setTimeout(() => {
        setPhase('exhale');
      }, 8000);
      
    }, cycleLength);

    // Initial timeouts for the first cycle
    const t1 = setTimeout(() => setPhase('hold'), 4000);
    const t2 = setTimeout(() => setPhase('exhale'), 8000);

    return () => {
      clearInterval(phaseTimer);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Header Chrome */}
      <header className={styles.header}>
        <button className={styles.chromeBtn} onClick={() => dispatch({ type: 'SKIP' })}>
          Skip
        </button>
        <div className={styles.chromeRight}>
          <span className={styles.timer}>0:{timeLeft.toString().padStart(2, '0')}</span>
          <button className={styles.sosBtn} onClick={() => dispatch({ type: 'OPEN_SOS' })}>SOS</button>
        </div>
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>
          {phase === 'inhale' && 'Breathe In...'}
          {phase === 'hold' && 'Hold...'}
          {phase === 'exhale' && 'Breathe Out...'}
        </h1>

        <div className={styles.circleContainer}>
          <div className={`${styles.circle} ${styles[phase]}`}></div>
          <div className={`${styles.ripple} ${styles[phase]}`}></div>
        </div>
      </div>
      
      <div className={styles.footer}>
        <button className={styles.doneBtn} onClick={() => dispatch({ type: 'COMPLETE' })}>
          I feel better
        </button>
      </div>
    </div>
  );
}
