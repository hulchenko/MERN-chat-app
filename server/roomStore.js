export default class RoomStore {
  rooms = {};

  saveRoom(username, roomName) {
    if (this.rooms[username]) {
      this.rooms[username].push(roomName);
    } else {
      this.rooms[username] = [roomName];
    }
  }

  removeRoom(username, roomName) {
    if (this.rooms[username]) {
      const roomIdx = this.rooms[username].findIndex((room) => room === roomName);
      if (roomIdx !== -1) {
        this.rooms[username].splice(roomIdx, 1);
      }
    }
  }

  getUserRooms(username) {
    return this.rooms[username] || [];
  }

  removeUserRooms(username) {
    delete this.rooms[username];
  }
}
