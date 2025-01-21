import Room from "../models/Room.js";

const createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: true, message: "Room name is required." });
    }

    const isExist = await Room.findOne({ name });
    if (isExist) {
      return res.status(400).json({ error: true, message: "Room with this name already exist." });
    }

    const newRoom = { name, messages: [] };
    const room = await Room.create(newRoom);
    return res.status(200).json({ error: false, data: room });
  } catch (error) {
    console.log("createRoom error: ", error);
    next(error);
  }
};

const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    return res.status(200).json({ error: false, data: rooms });
  } catch (error) {
    console.log("getRooms error: ", error);
    next(error);
  }
};

export { createRoom, getRooms };
