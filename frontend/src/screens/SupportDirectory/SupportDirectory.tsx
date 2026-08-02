import { Link } from 'react-router-dom';
import styles from './SupportDirectory.module.css';

const CHW_LIST = [
  { id: 1, name: 'Grace Uwase', role: 'Community Health Worker', phone: '+250123456789' },
  { id: 2, name: 'Jean Bosco', role: 'Youth Counselor', phone: '+250987654321' },
];

export function SupportDirectory() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backBtn}>← Home</Link>
        <h1 className={styles.title}>Support Directory</h1>
      </header>

      <div className={styles.content}>
        <p className={styles.description}>
          Reach out to a trusted community health worker or counselor. They are here to help.
        </p>

        <div className={styles.list}>
          {CHW_LIST.map(chw => (
            <div key={chw.id} className={styles.card}>
              <div className={styles.info}>
                <h2 className={styles.name}>{chw.name}</h2>
                <span className={styles.role}>{chw.role}</span>
              </div>
              <div className={styles.actions}>
                <a href={`tel:${chw.phone}`} className={styles.actionBtn}>📞 Call</a>
                <a href={`sms:${chw.phone}`} className={styles.actionBtn}>💬 Text</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
