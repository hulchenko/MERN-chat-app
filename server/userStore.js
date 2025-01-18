class UserStore {
  users = {};

  addUser(user) {
    this.users[user.username] = user;
  }

  getUser(username) {
    return this.users[username];
  }

  getAllUsers() {
    return Object.values(this.users);
  }
}

export default UserStore;
