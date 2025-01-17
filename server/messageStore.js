class MessageStore {
  messages = {};

  saveMessage(message) {
    if (message.from) {
      if (this.messages[message.from]) {
        this.messages[message.from].push(message);
      } else {
        this.messages[message.from] = [message];
      }
    }
  }

  getMessages(username) {
    return this.messages[username] || [];
  }
}

export default MessageStore;
