// const connection = require("./db_connection");
// const mongoose = require('mongoose');
const mongoose = require("./db_connection");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  created: { type: Date, default: Date.now },
  owner: {type: Schema.Types.ObjectId, ref: "User"},
  content: { type: String, required: true },
  users: [{type: Schema.Types.ObjectId, ref: "User"}],
});

const UserSchema = new Schema({
  created: { type: Date, default: Date.now },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});

const MoveSchema = new Schema({
  created: { type: Date, default: Date.now },
  game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
  position: { type: Number, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  other: { type: String, default: "" }
});

const VotedMoveSchema = new Schema({
  created: { type: Date, default: Date.now },
  game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  other: { type: String, default: "" }
});

const GameSchema = new Schema({
  created: { type: Date, default: Date.now },
  lastPlayed: { type: Date, default: Date.now },
  over: { type: Boolean, default: false },
  timeToVote: { type: Number, default: 60 }
});

module.exports = {
  Item: mongoose.model("Item", ItemSchema),
  User: mongoose.model("User", UserSchema),
  Move: mongoose.model("Move", MoveSchema),
  VotedMove: mongoose.model("VotedMove", VotedMoveSchema),
  Game: mongoose.model("Game", GameSchema)
};
