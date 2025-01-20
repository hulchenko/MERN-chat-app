export default class RoomStore {
  TTL = 60 * 60 * 24; // 1 day;

  constructor(redisClient) {
    this.redis = redisClient;
  }

  async saveRoom(username, roomName) {
    const key = `room:${username}`;
    await this.redis.rpush(key, roomName);
    await this.redis.expire(key, this.TTL);
  }

  async removeRoom(username, roomName) {
    const key = `room:${username}`;
    await this.redis.lrem(key, 1, roomName);
  }

  async getUserRooms(username) {
    const key = `room:${username}`;
    const rooms = await this.redis.lrange(key, 0, -1);
    return rooms;
  }

  async removeUserRooms(username) {
    const key = `room:${username}`;
    await this.redis.del(key);
  }
}
