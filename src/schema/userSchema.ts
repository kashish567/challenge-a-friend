import mongoose, { models, Schema } from "mongoose";

const challengeSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    edcoins: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

const Challenge = models.Challenge || mongoose.model("Challenge", challengeSchema);

export default Challenge;
