import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Onboarding.module.css';

const PASSKEY_WORDS = ['courage', 'river', 'sunlight', 'breeze', 'mountain', 'journey', 'peace', 'hope', 'bloom'];
const LANGUAGES = [
  { id: 'rw', label: 'Kinyarwanda' },
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'Français' },
];

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [passkey, setPasskey] = useState<string[]>([]);
  const [confirmPasskey, setConfirmPasskey] = useState<string[]>([]);
  const [language, setLanguage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleNext = () => setStep((s) => s + 1);

  const toggleWord = (word: string, currentList: string[], setList: (l: string[]) => void) => {
    if (currentList.includes(word)) {
      setList(currentList.filter(w => w !== word));
    } else if (currentList.length < 3) {
      setList([...currentList, word]);
    }
  };

  const isPasskeyMatch = confirmPasskey.length === 3 && confirmPasskey.every((w, i) => w === passkey[i]);

  const handleFinish = () => {
    // In a real app, save to localStorage here
    navigate('/');
  };

  return (
    <div className={styles.onboardingContainer}>
      {step === 1 && (
        <div className={styles.screen}>
          <h1 className={styles.title}>Welcome to ReNew</h1>
          <p className={styles.subtitle}>A safe space to reflect, connect, and grow.</p>
          
          <div className={styles.privacyCard}>
            <h3 className={styles.privacyTitle}>Our Privacy Promise</h3>
            <ul className={styles.privacyList}>
              <li>No phone number required</li>
              <li>No email required</li>
              <li>No real-name tracking</li>
            </ul>
            <p className={styles.privacyNote}>Your data stays on your device unless you choose to share it.</p>
          </div>

          <button className={styles.primaryButton} onClick={handleNext}>I understand, let's start</button>
        </div>
      )}

      {step === 2 && (
        <div className={styles.screen}>
          <h2 className={styles.title}>Set your Passkey</h2>
          <p className={styles.subtitle}>Choose 3 words to secure your space locally.</p>
          
          <div className={styles.wordGrid}>
            {PASSKEY_WORDS.map(word => (
              <button 
                key={word}
                className={`${styles.wordChip} ${passkey.includes(word) ? styles.selected : ''}`}
                onClick={() => toggleWord(word, passkey, setPasskey)}
              >
                {word}
              </button>
            ))}
          </div>
          
          <div className={styles.selectedWords}>
            {passkey.length === 0 ? "Select 3 words..." : passkey.join(' • ')}
          </div>

          <button 
            className={styles.primaryButton} 
            disabled={passkey.length !== 3}
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      )}

      {step === 3 && (
        <div className={styles.screen}>
          <h2 className={styles.title}>Confirm Passkey</h2>
          <p className={styles.subtitle}>Tap your 3 words in the same order.</p>
          
          <div className={styles.wordGrid}>
            {/* Display words in a scrambled or original order. Using original for simplicity. */}
            {PASSKEY_WORDS.filter(w => passkey.includes(w)).map((word) => (
              <button 
                key={word}
                className={`${styles.wordChip} ${confirmPasskey.includes(word) ? styles.selected : ''}`}
                onClick={() => toggleWord(word, confirmPasskey, setConfirmPasskey)}
              >
                {word}
              </button>
            ))}
          </div>

          <div className={styles.selectedWords}>
            {confirmPasskey.length === 0 ? "Select your 3 words..." : confirmPasskey.join(' • ')}
          </div>

          {confirmPasskey.length === 3 && !isPasskeyMatch && (
            <p className={styles.errorText}>Words don't match. Try again.</p>
          )}

          <div className={styles.actions}>
            <button 
              className={styles.secondaryButton} 
              onClick={() => { setConfirmPasskey([]); setStep(2); }}
            >
              Start Over
            </button>
            <button 
              className={styles.primaryButton} 
              disabled={!isPasskeyMatch}
              onClick={handleNext}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className={styles.screen}>
          <h2 className={styles.title}>Choose Language</h2>
          <p className={styles.subtitle}>You can change this later in settings.</p>
          
          <div className={styles.languageList}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.id}
                className={`${styles.langOption} ${language === lang.id ? styles.langSelected : ''}`}
                onClick={() => setLanguage(lang.id)}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <button 
            className={styles.primaryButton} 
            disabled={!language}
            onClick={handleFinish}
          >
            Enter Safe Space
          </button>
        </div>
      )}
    </div>
  );
}
