class SessionStore {
  TTL = 60 * 60 * 24; // 1 day; //TODO review how it can be extended

  constructor(redisClient) {
    this.redis = redisClient;
  }

  async findSession(id) {
    const key = `session:${id}`;
    const redisSession = await this.redis.get(key);
    const parsedSession = JSON.parse(redisSession);
    return parsedSession;
  }

  async saveSession(id, sess) {
    const key = `session:${id}`;
    const session = JSON.stringify(sess);
    await this.redis.set(key, session);
    await this.redis.expire(key, this.TTL);
  }

  async removeSession(id) {
    const key = `session:${id}`;
    await this.redis.del(key);
  }

  async isConnected(username) {
    const sessions = await this.redis.keys("session:*");
    console.log("Current sessions: ", sessions.length);
    for (const sessionKey of sessions) {
      if (sessionKey) {
        const redisSession = await this.redis.get(sessionKey);
        const parsedSession = JSON.parse(redisSession);
        if (parsedSession.username === username && parsedSession.connected === true) {
          return true;
        }
      }
    }
    return false;
  }
}

export default SessionStore;
