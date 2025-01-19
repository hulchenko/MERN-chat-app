import User from "./models/User.js";

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

  async getAllDBUsers() {
    return await User.find();
  }
}

export default UserStore;
