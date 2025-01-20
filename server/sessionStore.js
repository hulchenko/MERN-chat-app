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
    //     {
    //    'long-token-string': {
    //     userID: '67856f7275bb61631f098de4',
    //     username: 'test',
    //     connected: true
    //   }
    // }
    const sessions = await this.redis.keys("session:*");
    for (const sessionKey of sessions) {
      if (sessionKey) {
        const redisSession = await this.redis.get(sessionKey);
        const parsedSession = JSON.parse(redisSession);
        if (parsedSession.username === username) {
          return true;
        }
      }
    }
    return false;
  }
}

export default SessionStore;
