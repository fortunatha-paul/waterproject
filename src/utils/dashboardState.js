// Dashboard state management utilities for maintaining separate states
// across multiple browser tabs/windows of the same dashboard type

class DashboardStateManager {
  constructor(dashboardType) {
    this.dashboardType = dashboardType;
    this.sessionId = this.generateSessionId();
    this.storageKey = `dashboard_${dashboardType}_${this.sessionId}`;
  }

  generateSessionId() {
    // Get existing session ID for this tab or create new one
    const existingSession = sessionStorage.getItem(`dashboard_session_${window.location.pathname}`);
    if (existingSession) {
      return existingSession;
    }
    
    // Create new session ID with timestamp and random component
    const newSession = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(`dashboard_session_${window.location.pathname}`, newSession);
    return newSession;
  }

  // Save state to session storage (tab-specific)
  saveState(state) {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save dashboard state:', error);
    }
  }

  // Load state from session storage (tab-specific)
  loadState() {
    try {
      const saved = sessionStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load dashboard state:', error);
      return null;
    }
  }

  // Clear state for current session
  clearState() {
    try {
      sessionStorage.removeItem(this.storageKey);
      sessionStorage.removeItem(`dashboard_session_${window.location.pathname}`);
    } catch (error) {
      console.warn('Failed to clear dashboard state:', error);
    }
  }

  // Get all active sessions for this dashboard type
  getActiveSessions() {
    const sessions = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(`dashboard_session_`)) {
        sessions.push(key);
      }
    }
    return sessions;
  }
}

export default DashboardStateManager;
