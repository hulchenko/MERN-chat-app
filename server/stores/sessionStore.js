class SessionStore {
  TTL = 60 * 60 * 24;

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

  async removeUserSessions(username) {
    if (!username) return;
    const sessions = await this.redis.keys("session:*");
    for (const sessionKey of sessions) {
      const redisSession = await this.redis.get(sessionKey);
      const parsedSession = JSON.parse(redisSession);
      if (parsedSession?.username === username) {
        await this.redis.del(sessionKey);
      }
    }
    console.log("Sessions after removed: ", sessions.length);
  }

  async isConnected(username) {
    if (!username) return false;
    const sessions = await this.redis.keys("session:*");
    console.log("Current sessions: ", sessions.length);
    for (const sessionKey of sessions) {
      const redisSession = await this.redis.get(sessionKey);
      const parsedSession = JSON.parse(redisSession);
      if (parsedSession?.username === username && parsedSession?.connected === true) {
        return true;
      }
    }
    return false;
  }
}

export default SessionStore;
