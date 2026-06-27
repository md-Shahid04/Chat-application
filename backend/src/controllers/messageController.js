import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
  const { recipientId, text } = req.body;
  let fileUrl = "";

  if (req.file) {
    fileUrl = `/uploads/${req.file.filename}`;
  }

  try {
    if (!recipientId) {
      return res
        .status(400)
        .json({ message: "Target recipient parameter missing." });
    }
    if (!text && !fileUrl) {
      return res
        .status(400)
        .json({ message: "Cannot process blank conversational entities." });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      text,
      fileUrl,
    });

    const populatedMessage = await newMessage.populate(
      "sender recipient",
      "username profilePic about",
    );
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;
  try {
    const conversationHistory = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender recipient", "username profilePic about");
    res.json(conversationHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
