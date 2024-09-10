import mongoose, { models, Schema } from "mongoose";

const roomSchema = new Schema(
  {
    roomCode: {
      type: Number,
      required: true,
    },
    roomCreatedBy: {
      type: String,
      required: false,
    },
    player1Name: {
      type: String,
      required: false,
    },
    player2Name: {
      type: String,
      required: false,
    },
    playerCount: {
      type: Number,
      required: false,
      default: 0,
    },
    playerIds: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
      required: false,
    },
    winner: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Room = models.Room || mongoose.model("Room", roomSchema);

export default Room;
