class MessageStore {
  privateMessages = {};
  roomMessages = {};

  saveMessage(message) {
    if (message.from) {
      if (this.privateMessages[message.from]) {
        this.privateMessages[message.from].push(message);
      } else {
        this.privateMessages[message.from] = [message];
      }
    }
  }

  getMessages(username) {
    return this.privateMessages[username] || [];
  }

  saveRoomMessage(roomName, message) {
    if (roomName && message) {
      if (this.roomMessages[roomName]) {
        this.roomMessages[roomName].push(message);
      } else {
        this.roomMessages[roomName] = [message];
      }
    }
  }

  getRoomMessages(roomName) {
    return this.roomMessages[roomName] || [];
  }
}

export default MessageStore;
