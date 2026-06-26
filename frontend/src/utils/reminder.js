export const REMINDER_ENABLED_KEY = 'cat-slim-down-weight-reminder-enabled';
export const REMINDER_NEXT_AT_KEY = 'cat-slim-down-weight-reminder-next-at';
export const REMINDER_FREQUENCY_KEY = 'cat-slim-down-weight-reminder-frequency';
export const REMINDER_DAY_KEY = 'cat-slim-down-weight-reminder-day';
export const REMINDER_TIME_KEY = 'cat-slim-down-weight-reminder-time';

export const DEFAULT_FREQUENCY = 'weekly';
export const DEFAULT_DAY = '4'; // Donnerstag (0: So, 1: Mo, ..., 4: Do)
export const DEFAULT_TIME = '16:00';

export function getNextReminderTime(fromDate = new Date()) {
  const frequency = localStorage.getItem(REMINDER_FREQUENCY_KEY) || DEFAULT_FREQUENCY;
  const day = Number(localStorage.getItem(REMINDER_DAY_KEY) ?? DEFAULT_DAY);
  const timeStr = localStorage.getItem(REMINDER_TIME_KEY) || DEFAULT_TIME;

  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = Number(hoursStr || 16);
  const minutes = Number(minutesStr || 0);

  const resultDate = new Date(fromDate);
  resultDate.setHours(hours, minutes, 0, 0);

  if (frequency === 'daily') {
    if (fromDate.getTime() >= resultDate.getTime()) {
      resultDate.setDate(resultDate.getDate() + 1);
    }
    return resultDate.getTime();
  } else {
    // wöchentlich
    const currentDay = fromDate.getDay();
    let daysToAdd = (day - currentDay + 7) % 7;

    if (daysToAdd === 0) {
      if (fromDate.getTime() >= resultDate.getTime()) {
        daysToAdd = 7;
      }
    }

    resultDate.setDate(resultDate.getDate() + daysToAdd);
    return resultDate.getTime();
  }
}

export function resetWeightReminder() {
  const enabled = localStorage.getItem(REMINDER_ENABLED_KEY) === 'true';
  if (enabled) {
    const frequency = localStorage.getItem(REMINDER_FREQUENCY_KEY) || DEFAULT_FREQUENCY;
    const bufferMs = frequency === 'daily'
      ? 12 * 60 * 60 * 1000 // 12 Stunden Puffer für täglich
      : 3 * 24 * 60 * 60 * 1000; // 3 Tage Puffer für wöchentlich
    const nextTime = getNextReminderTime(new Date(Date.now() + bufferMs));
    localStorage.setItem(REMINDER_NEXT_AT_KEY, String(nextTime));
  }
}

export function checkAndTriggerReminder() {
  const enabled = localStorage.getItem(REMINDER_ENABLED_KEY) === 'true';
  if (!enabled) return;

  const nextAt = Number(localStorage.getItem(REMINDER_NEXT_AT_KEY));
  if (!nextAt || Date.now() < nextAt) return;

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification("Zeit zum Wiegen! 🐱", {
      body: "Trage das neue Gewicht deiner Katze ein, um ihren Fortschritt zu verfolgen.",
      icon: "/vite.svg"
    });

    notification.onclick = () => {
      window.focus();
    };

    // Nächste Erinnerung planen
    localStorage.setItem(REMINDER_NEXT_AT_KEY, String(getNextReminderTime()));
  }
}
