const mongoose = require("mongoose");

const chat = mongoose.Schema(
  {
    chatName: {
        type: String,
        trim: true
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    users: [{ // store user id for senders & recievers
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    latestMessage: { // store message's id
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chat);

module.exports = Chat;