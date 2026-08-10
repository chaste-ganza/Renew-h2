import { engine } from '@core/fsm/emitter';
import { getBootStatus, initEngine } from '../main';
import { beginNewSession } from '@security/session';

const output = document.getElementById('output')!;
const questionEl = document.getElementById('question')!;

// Wire up the RAM-purge listeners, same as the real app would on boot.
initEngine();

console.log('[harness] boot status:', getBootStatus());

// Render the current snapshot every time it changes.
engine.subscribe((snapshot) => {
    output.textContent = JSON.stringify(snapshot, null, 2);
    questionEl.textContent = snapshot.context.checkInQuestion
        ? `Check-in question: "${snapshot.context.checkInQuestion}"`
        : '';
});

// Wiring every button with a `data-event` attribute to dispatch that
// exact event type directly (for events with no extra payload).
document.querySelectorAll<HTMLButtonElement>('[data-event]').forEach((btn) => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.event as Parameters<typeof engine.dispatch>[0]['type'];
        void engine.dispatch({ type } as never);
    });
});

// Buttons needing extra payload data get wired individually below,
// since their event shape isn't just `{ type }`.

document.querySelector('[data-passphrase]')?.addEventListener('click', async () => {
    const { saltBase64 } = await beginNewSession('test-passphrase-for-harness');
    void engine.dispatch({ type: 'ONBOARDING_PASSPHRASE_SET', saltBase64 });
});

document.querySelector<HTMLButtonElement>('[data-age]')?.addEventListener('click', (e) => {
    const ageRange = (e.currentTarget as HTMLButtonElement).dataset.age as
        | '13-17' | '18-24' | '25-34' | '35+';
    void engine.dispatch({ type: 'ONBOARDING_AGE_SUBMITTED', ageRange });
});

document.querySelectorAll<HTMLButtonElement>('[data-onboarding-theme]').forEach((btn) => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.onboardingTheme as 'companion' | 'aesthetic';
        void engine.dispatch({ type: 'ONBOARDING_THEME_SELECTED', theme });
    });
});

document.querySelectorAll<HTMLButtonElement>('[data-theme]').forEach((btn) => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme as 'companion' | 'aesthetic';
        void engine.dispatch({ type: 'THEME_CHANGED', theme });
    });
});

document.querySelector<HTMLButtonElement>('[data-mood]')?.addEventListener('click', (e) => {
    const mood = (e.currentTarget as HTMLButtonElement).dataset.mood!;
    void engine.dispatch({ type: 'CHECKIN_MOOD_SELECTED', mood });
});

document.querySelector('[data-followup]')?.addEventListener('click', () => {
    void engine.dispatch({
        type: 'CHECKIN_FOLLOWUP_SUBMITTED',
        notes: 'test notes from harness',
    });
});