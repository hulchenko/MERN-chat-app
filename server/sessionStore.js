class SessionStore {
  sessions = {};

  findSession(id) {
    return this.sessions[id] || null;
  }

  saveSession(id, session) {
    this.sessions[id] = session;
  }

  removeSession(id) {
    delete this.sessions[id];
  }

  getAllSessions() {
    return this.sessions;
  }

  isConnected(username) {
    return Object.entries(this.sessions).some(([sessionID, body]) => body.username === username);
  }
}

export default SessionStore;
