import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const ChatWindow = ({ recipient, closeChat }) => {
  const { user, socket, onlineUsers, backendUrl } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [recipientTyping, setRecipientTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const scrollAnchorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/messages/${recipient._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error(
          "Failed to parse remote historical conversational logs:",
          err,
        );
      }
    };
    fetchHistory();
    setRecipientTyping(false);
  }, [recipient]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageInbound = (message) => {
      if (
        message.sender._id === recipient._id ||
        message.sender === recipient._id
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleTypingEvent = (data) => {
      if (data.senderId === recipient._id) {
        setRecipientTyping(true);
      }
    };

    const handleStopTypingEvent = (data) => {
      if (data.senderId === recipient._id) {
        setRecipientTyping(false);
      }
    };

    socket.on("receive_message", handleMessageInbound);
    socket.on("typing", handleTypingEvent);
    socket.on("stop_typing", handleStopTypingEvent);

    return () => {
      socket.off("receive_message", handleMessageInbound);
      socket.off("typing", handleTypingEvent);
      socket.off("stop_typing", handleStopTypingEvent);
    };
  }, [socket, recipient]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, recipientTyping]);

  const handleTextComposition = (e) => {
    setInputText(e.target.value);
    if (!socket) return;

    socket.emit("typing", { recipientId: recipient._id, senderId: user._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        recipientId: recipient._id,
        senderId: user._id,
      });
    }, 2000);
  };

  const handleMediaSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedMedia(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const clearMediaBuffer = () => {
    setSelectedMedia(null);
    setMediaPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedMedia) return;

    const formData = new FormData();
    formData.append("recipientId", recipient._id);
    if (inputText.trim()) formData.append("text", inputText.trim());
    if (selectedMedia) formData.append("file", selectedMedia);

    try {
      setIsSending(true);
      if (socket)
        socket.emit("stop_typing", {
          recipientId: recipient._id,
          senderId: user._id,
        });

      const res = await api.post("/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setInputText("");
      clearMediaBuffer();

      setMessages((prev) => [...prev, res.data]);
      if (socket) socket.emit("send_message", res.data);
    } catch (err) {
      console.error("Failed to transmit message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isOnline = onlineUsers.includes(recipient._id);

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950">
      {/* Header Panel navbar */}
      <div className="p-4 bg-neutral-900 border-b border-neutral-800/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={closeChat}
            className="p-1 text-neutral-400 hover:text-neutral-200 md:hidden mr-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.0}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <div className="relative shrink-0">
            <img
              src={
                recipient.profilePic
                  ? `${backendUrl}${recipient.profilePic}`
                  : `https://api.dicebear.com/7.x/initials/svg?seed=${recipient.username}`
              }
              alt="Recipient Avatar"
              className="w-10 h-10 rounded-full object-cover border border-neutral-800"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-neutral-900 rounded-full" />
            )}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-bold text-neutral-200 truncate">
              {recipient.username}
            </h3>
            <p className="text-xs text-neutral-500 truncate">
              {recipientTyping ? (
                <span className="text-emerald-400 font-medium animate-pulse">
                  typing...
                </span>
              ) : isOnline ? (
                "Online"
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Conversational Feed Area Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-neutral-950/20">
        {messages.map((msg) => {
          const isOwnMessage =
            msg.sender._id === user._id || msg.sender === user._id;
          return (
            <div
              key={msg._id}
              className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] md:max-w-[60%] rounded-2xl p-3 shadow-md border flex flex-col gap-1.5
                ${isOwnMessage ? "bg-emerald-600/10 border-emerald-500/20 text-neutral-200 rounded-tr-none" : "bg-neutral-900 border-neutral-800/80 text-neutral-300 rounded-tl-none"}`}
              >
                {msg.fileUrl && (
                  <div className="rounded-xl overflow-hidden border border-neutral-950/20 bg-neutral-950/40">
                    <img
                      src={`${backendUrl}${msg.fileUrl}`}
                      alt="Attachment"
                      className="max-h-60 w-full object-cover"
                    />
                  </div>
                )}
                {msg.text && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                )}
                <span className="text-[9px] text-neutral-500 font-medium self-end">
                  {formatTimestamp(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        {recipientTyping && (
          <div className="flex w-full justify-start">
            <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl rounded-tl-none p-3 flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
        <div ref={scrollAnchorRef} />
      </div>

      {/* Media Upload Preview Container Block */}
      {mediaPreview && (
        <div className="p-3 bg-neutral-900/90 border-t border-neutral-800 flex items-center gap-4 shrink-0 px-6">
          <div className="relative w-20 h-20 rounded-lg border border-neutral-700 overflow-hidden bg-neutral-950 shrink-0">
            <img
              src={mediaPreview}
              alt="Upload preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={clearMediaBuffer}
              className="absolute top-1 right-1 p-0.5 bg-neutral-950/80 hover:bg-neutral-950 rounded-full text-neutral-400 hover:text-neutral-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3 h-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-xs text-neutral-400 truncate flex-1">
            Image attachment selected ready for dispatch
          </p>
        </div>
      )}

      {/* Interactive Control Input Bar Footer */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-neutral-900 border-t border-neutral-800/60 flex items-center gap-3 shrink-0"
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleMediaSelection}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-xl transition-colors shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </button>
        <input
          type="text"
          value={inputText}
          onChange={handleTextComposition}
          placeholder="Type a message..."
          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500/30"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || (!inputText.trim() && !selectedMedia)}
          className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 rounded-xl transition-colors font-semibold shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L6 12zm0 0h7"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
