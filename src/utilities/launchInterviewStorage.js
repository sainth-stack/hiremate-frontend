const STORAGE_KEY = 'admin_launch_interview';

/** @typedef {{ id: number, title: string, difficulty: string, description: string, created_at?: string }} LaunchInterviewTemplate */

/** @param {LaunchInterviewTemplate} interview */
export function saveLaunchInterview(interview) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(interview));
}

/** @returns {LaunchInterviewTemplate | null} */
export function readLaunchInterview() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearLaunchInterview() {
  sessionStorage.removeItem(STORAGE_KEY);
}
