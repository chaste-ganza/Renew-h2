import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { useFsmState } from '@/hooks/useFsmState';
import { Onboarding } from '@/screens/Onboarding/Onboarding';
import { Home } from '@/screens/Home/Home';
import { CheckIn } from '@/screens/CheckIn/CheckIn';
import { CopingBreak } from '@/screens/CopingBreak/CopingBreak';
import { TaskCard } from '@/screens/TaskCard/TaskCard';
import { SupportDirectory } from '@/screens/SupportDirectory/SupportDirectory';
import { SOS } from '@/screens/SOS/SOS';
import { Progress } from '@/screens/Progress/Progress';
import { Settings } from '@/screens/Settings/Settings';
import styles from './App.module.css';

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/onboarding', label: 'Onboarding' },
  { path: '/check-in', label: 'CheckIn' },
  { path: '/coping-break', label: 'CopingBreak' },
  { path: '/task-card', label: 'TaskCard' },
  { path: '/support', label: 'SupportDirectory' },
  { path: '/sos', label: 'SOS' },
  { path: '/progress', label: 'Progress' },
  { path: '/settings', label: 'Settings' },
] as const;

export function App() {
  const { state } = useFsmState();

  return (
    <BrowserRouter>
      <div className={styles.layout}>
        <nav className={styles.nav} aria-label="Screen navigation">
          {NAV_ITEMS.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/check-in" element={<CheckIn />} />
            <Route path="/coping-break" element={<CopingBreak />} />
            <Route path="/task-card" element={<TaskCard />} />
            <Route path="/support" element={<SupportDirectory />} />
            <Route path="/sos" element={<SOS />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        <footer className={styles.footer}>FSM state: {state}</footer>
      </div>
    </BrowserRouter>
  );
}
