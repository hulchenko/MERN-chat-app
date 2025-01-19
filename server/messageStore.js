class MessageStore {
  TTL = 60 * 60 * 24; // 1 day;

  constructor(redisClient) {
    this.redis = redisClient;
  }

  async savePrivateMessage(msg) {
    const key = `private:${msg.from}`;
    const message = JSON.stringify(msg);
    await this.redis.rpush(key, message);
    await this.redis.expire(key, this.TTL);
  }

  async getPrivateMessages(username) {
    const key = `private:${username}`;
    const redisMessages = await this.redis.lrange(key, 0, -1);
    const parsedMessages = redisMessages?.map((msg) => JSON.parse(msg)) || [];
    return parsedMessages;
  }

  async saveRoomMessage(roomName, msg) {
    const key = `room:${roomName}`;
    const message = JSON.stringify(msg);
    await this.redis.rpush(key, message);
    await this.redis.expire(key, this.TTL);
  }

  async getRoomMessages(roomName) {
    const key = `room:${roomName}`;
    const redisMessages = await this.redis.lrange(key, 0, -1);
    const parsedMessages = redisMessages?.map((msg) => JSON.parse(msg)) || [];
    return parsedMessages;
  }
}

export default MessageStore;
