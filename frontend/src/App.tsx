import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Onboarding } from '@/screens/Onboarding/Onboarding';
import { Home } from '@/screens/Home/Home';
import { History } from '@/screens/History/History';
import { SupportDirectory } from '@/screens/SupportDirectory/SupportDirectory';
import { Progress } from '@/screens/Progress/Progress';
import { Settings } from '@/screens/Settings/Settings';
import { BottomNav } from '@/components/BottomNav/BottomNav';

// FSM Full-Screen Components
import { CheckIn } from '@/screens/CheckIn/CheckIn';
import { CopingBreak } from '@/screens/CopingBreak/CopingBreak';
import { EvaluationSummary } from '@/screens/EvaluationSummary/EvaluationSummary';
import { TaskCard } from '@/screens/TaskCard/TaskCard';
import { PostActivity } from '@/screens/PostActivity/PostActivity';
import { SOS } from '@/screens/SOS/SOS';

import styles from './App.module.css';
import { useFsmState } from '@/hooks/useFsmState';

// Accessibility Announcer for Screen Readers
function AriaLiveAnnouncer() {
  const { state } = useFsmState();
  
  let announcement = 'Returned to main screen.';
  if (state.startsWith('checkin_')) {
    announcement = 'Starting check-in flow.';
  } else if (state === 'coping_break') {
    announcement = 'Starting coping break. Focus on your breathing.';
  } else if (state === 'evaluation_summary') {
    announcement = 'Check-in evaluated. Showing summary.';
  } else if (state === 'task_card') {
    announcement = 'Showing suggested activity.';
  } else if (state === 'post_activity') {
    announcement = 'Activity completed. How did it help?';
  } else if (state === 'sos') {
    announcement = 'Emergency options opened.';
  }

  return (
    <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
      {announcement}
    </div>
  );
}

function GlobalSOS() {
  const { state, dispatch } = useFsmState();
  
  // Don't render if we are actively IN the SOS flow
  if (state === 'sos') return null;

  return (
    <div className={styles.globalSosContainer}>
      <button 
        className={styles.globalSosBtn} 
        onClick={() => dispatch({ type: 'OPEN_SOS' })}
        aria-label="Open SOS / Emergency Actions"
      >
        SOS
      </button>
    </div>
  );
}

function FsmRouter() {
  const { state } = useFsmState();

  if (state.startsWith('checkin_')) {
    return <CheckIn />;
  }
  if (state === 'coping_break') {
    return <CopingBreak />;
  }
  if (state === 'evaluation_summary') {
    return <EvaluationSummary />;
  }
  if (state === 'task_card') {
    return <TaskCard />;
  }
  if (state === 'post_activity') {
    return <PostActivity />;
  }
  if (state === 'sos') {
    return <SOS />;
  }

  // Shell routing (Tabs)
  return (
    <>
      <div className={styles.shellScrollArea}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/support" element={<SupportDirectory />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      
      {/* Tab Nav only shows in shell */}
      <BottomNav />
    </>
  );
}

function AppLayout() {
  const { state } = useFsmState();
  const isFullScreenFlow = state !== 'idle';

  return (
    <div className={styles.layout}>
      <AriaLiveAnnouncer />
      {/* SOS is fixed top-right across all screens except when in SOS itself */}
      <GlobalSOS />

      <main className={isFullScreenFlow ? styles.mainFullScreen : styles.mainShell}>
        <FsmRouter />
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
