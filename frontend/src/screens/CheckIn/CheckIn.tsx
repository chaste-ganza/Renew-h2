import { useState } from 'react';
import { useFsmState } from '@/hooks/useFsmState';
import styles from './CheckIn.module.css';

// Sub-components for each FSM state in the flow
function MoodStep({ onDispatch }: { onDispatch: (type: string, payload?: unknown) => void }) {
  return (
    <div className={styles.stepContainer}>
      <h1 className={styles.question}>How are you feeling right now?</h1>
      <div className={styles.moodGrid}>
        <button aria-label="Calm or Okay" className={styles.moodBtn} onClick={() => onDispatch('SELECT_MOOD', { isCalm: true })}>
          <span className={styles.moodIcon} aria-hidden="true">😌</span>
          <span className={styles.moodLabel}>Calm / Okay</span>
        </button>
        <button aria-label="Anxious" className={styles.moodBtn} onClick={() => onDispatch('SELECT_MOOD', { isCalm: false })}>
          <span className={styles.moodIcon} aria-hidden="true">😟</span>
          <span className={styles.moodLabel}>Anxious</span>
        </button>
        <button aria-label="Low or Sad" className={styles.moodBtn} onClick={() => onDispatch('SELECT_MOOD', { isCalm: false })}>
          <span className={styles.moodIcon} aria-hidden="true">😔</span>
          <span className={styles.moodLabel}>Low / Sad</span>
        </button>
        <button aria-label="Craving or Urge" className={styles.moodBtn} onClick={() => onDispatch('SELECT_MOOD', { isCalm: false })}>
          <span className={styles.moodIcon} aria-hidden="true">🌪️</span>
          <span className={styles.moodLabel}>Craving / Urge</span>
        </button>
      </div>
    </div>
  );
}

function FollowupStep({ onDispatch }: { onDispatch: (type: string, payload?: unknown) => void }) {
  return (
    <div className={styles.stepContainer}>
      <h1 className={styles.question}>What's making things hard today?</h1>
      <div className={styles.optionsList}>
        <button className={styles.optionBtn} onClick={() => onDispatch('SELECT_REASON', { category: 'stress' })}>Stress / Work</button>
        <button className={styles.optionBtn} onClick={() => onDispatch('SELECT_REASON', { category: 'relationships' })}>Relationships</button>
        <button className={styles.optionBtn} onClick={() => onDispatch('SELECT_REASON', { category: 'craving' })}>Thinking about using</button>
        <button className={styles.optionBtn} onClick={() => onDispatch('SELECT_REASON', { category: 'other' })}>Something else</button>
      </div>
    </div>
  );
}

function IntensityStep({ onDispatch }: { onDispatch: (type: string, payload?: unknown) => void }) {
  const [intensity, setIntensity] = useState(5);
  
  return (
    <div className={styles.stepContainer}>
      <h1 className={styles.question}>How strong is the urge right now?</h1>
      <p className={styles.helperText}>0 is no urge, 10 is overwhelming.</p>
      
      <div className={styles.sliderContainer}>
        <span className={styles.sliderValue}>{intensity}</span>
        <input 
          type="range" 
          min="0" 
          max="10" 
          value={intensity} 
          onChange={(e) => setIntensity(parseInt(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.sliderLabels}>
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
      
      <button className={styles.primaryBtn} onClick={() => onDispatch('SUBMIT', { intensity })}>
        Continue
      </button>
    </div>
  );
}

export function CheckIn() {
  const { state, dispatch } = useFsmState();
  
  const handleDispatch = (type: string, payload?: unknown) => {
    dispatch({ type, payload });
  };

  return (
    <div className={styles.container}>
      {/* Chrome for full-screen flow */}
      <header className={styles.header}>
        <button className={styles.chromeBtn} onClick={() => handleDispatch('CANCEL')}>
          Cancel
        </button>
        <div className={styles.chromeRight}>
          <button className={styles.chromeBtn}>🔊 Listen</button>
          <button className={styles.sosBtn} onClick={() => handleDispatch('OPEN_SOS')}>SOS</button>
        </div>
      </header>

      <div className={styles.content}>
        {state === 'checkin_mood' && <MoodStep onDispatch={handleDispatch} />}
        {state === 'checkin_followup' && <FollowupStep onDispatch={handleDispatch} />}
        {state === 'checkin_intensity' && <IntensityStep onDispatch={handleDispatch} />}
      </div>
    </div>
  );
}
