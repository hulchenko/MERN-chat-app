class SessionStore {
  sessions = {};

  findSession(id) {
    // console.log("Find session: ", this.sessions[id]);
    return this.sessions[id];
  }

  saveSession(id, session) {
    this.sessions[id] = session;
    // console.log("Save session: ", this.sessions[id]);
  }

  removeSession(id) {
    delete this.sessions[id];
  }

  getAllSessions() {
    // console.log("All sessions: ", this.sessions);
    return this.sessions;
  }
}

export default SessionStore;
