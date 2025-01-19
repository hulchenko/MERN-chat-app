export default class RoomStore {
  TTL = 60 * 60 * 24; // 1 day;

  constructor(redisClient) {
    this.redis = redisClient;
  }

  async saveRoom(username, roomName) {
    const key = `room:${username}`;
    const room = JSON.stringify(roomName);
    await this.redis.rpush(key, room);
    await this.redis.expire(key, this.TTL);
  }

  async removeRoom(username, roomName) {
    const key = `room:${username}`;
    const room = JSON.stringify(roomName);
    await this.redis.lrem(key, 1, room);
  }

  async getUserRooms(username) {
    const key = `room:${username}`;
    const redisRooms = await this.redis.lrange(key, 0, -1);
    const parsedRooms = redisRooms.map((room) => JSON.parse(room));
    return parsedRooms;
  }

  async removeUserRooms(username) {
    const key = `room:${username}`;
    await this.redis.del(key);
  }
}
