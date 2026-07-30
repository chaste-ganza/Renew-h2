import { Link } from 'react-router-dom';
import { useFsmState } from '@/hooks/useFsmState';
import styles from './Home.module.css';

const COMMUNITY_VOICES = [
  {
    author: 'Rwanda Youth Group',
    tip: '"I started leaving my phone in another room when I sleep. The mornings feel much quieter now."'
  }
];

export function Home() {
  const { dispatch } = useFsmState();
  const todayVoice = COMMUNITY_VOICES[0];

  return (
    <div className={styles.homeContainer}>
      
      {/* Header & Shell Nav Links */}
      <header className={styles.header}>
        <div className={styles.navLinks}>
          <Link to="/progress" className={styles.navLink}>📈 Progress</Link>
          <Link to="/support" className={styles.navLink}>📞 Support</Link>
          <Link to="/settings" className={styles.navLink}>⚙️</Link>
        </div>
      </header>

      {/* Greeting & Journey */}
      <div className={styles.heroSection}>
        <h1 className={styles.greeting}>Muraho, friend.</h1>
        <p className={styles.journeyCount}>12 days on your journey</p>
        
        <div className={styles.lastMoodCard}>
          <span className={styles.moodLabel}>Last check-in (2 hours ago):</span>
          <p className={styles.moodQuote}>"Feeling a bit restless, but okay."</p>
        </div>
      </div>

      {/* Primary Action */}
      <div className={styles.actionSection}>
        <button 
          className={styles.checkInBtn}
          onClick={() => dispatch({ type: 'START_CHECKIN' })}
        >
          Check in right now
        </button>
      </div>

      {/* Direct Activities */}
      <div className={styles.activitiesSection}>
        <h2 className={styles.sectionTitle}>Quick exercises</h2>
        <div className={styles.activityGrid}>
          <button className={styles.activityBtn} onClick={() => dispatch({ type: 'START_ACTIVITY', payload: 'breathing' })} aria-label="Quick Activity: Breathe">
            <span className={styles.activityIcon} aria-hidden="true">🌬️</span>
            <span className={styles.activityText}>Breathe</span>
          </button>
          <button className={styles.activityBtn} onClick={() => dispatch({ type: 'START_ACTIVITY', payload: 'water' })} aria-label="Quick Activity: Drink water">
            <span className={styles.activityIcon} aria-hidden="true">💧</span>
            <span className={styles.activityText}>Drink water</span>
          </button>
          <button className={styles.activityBtn} onClick={() => dispatch({ type: 'START_ACTIVITY', payload: 'walk' })} aria-label="Quick Activity: Short walk">
            <span className={styles.activityIcon} aria-hidden="true">🚶</span>
            <span className={styles.activityText}>Short walk</span>
          </button>
          <button className={styles.activityBtn} onClick={() => dispatch({ type: 'START_ACTIVITY', payload: 'grounding' })} aria-label="Quick Activity: Grounding">
            <span className={styles.activityIcon} aria-hidden="true">👁️</span>
            <span className={styles.activityText}>Grounding</span>
          </button>
        </div>
      </div>

      {/* Community Voices */}
      <div className={styles.voicesSection}>
        <h2 className={styles.sectionTitle}>Community Voices</h2>
        <div className={styles.voiceCard}>
          <p className={styles.voiceTip}>{todayVoice.tip}</p>
          <span className={styles.voiceAuthor}>— {todayVoice.author}</span>
        </div>
      </div>

    </div>
  );
}
