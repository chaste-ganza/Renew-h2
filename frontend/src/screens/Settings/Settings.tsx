import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Settings.module.css';

const LANGUAGES = [
  { id: 'rw', label: 'Kinyarwanda' },
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'Français' },
];

export function Settings() {
  const [language, setLanguage] = useState('en');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backBtn}>← Home</Link>
        <h1 className={styles.title}>Settings</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Language</h2>
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
        </div>
      </div>
    </div>
  );
}
