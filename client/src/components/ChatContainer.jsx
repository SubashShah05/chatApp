// components/ChatContainer.jsx
import React, { useState, useContext, useEffect, useRef } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = () => {

  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages, markMessageAsRead } = useContext(ChatContext);
  const { authUser, onlineUsers, socket } = useContext(AuthContext);
  const [typingUser, setTypingUser] = useState(false);

  const scrollEnd = useRef();
  const [input, setInput] = useState("");
  const typingTimeoutRef = useRef();

  // ✅ Handle typing indicator
  const handleTyping = (e) => {
    setInput(e.target.value);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (e.target.value.length > 0) {
      socket?.emit("typing", {
        receiverId: selectedUser?._id,
        isTyping: true
      });
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("typing", {
        receiverId: selectedUser?._id,
        isTyping: false
      });
    }, 1000);
  };

  // ✅ Listen for typing events
  useEffect(() => {
    const typingHandler = (event) => {
      if (event.detail.userId === selectedUser?._id) {
        setTypingUser(event.detail.isTyping);
        if (!event.detail.isTyping) {
          setTimeout(() => setTypingUser(false), 1000);
        }
      }
    };

    window.addEventListener('userTyping', typingHandler);
    return () => window.removeEventListener('userTyping', typingHandler);
  }, [selectedUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    await sendMessage({ text: input.trim() });
    setInput("");
    
    // Stop typing indicator
    socket?.emit("typing", {
      receiverId: selectedUser?._id,
      isTyping: false
    });
  };

  // Handle sending image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  // ✅ Get message status icon
  const getMessageStatusIcon = (message) => {
    if (message.senderId._id !== authUser._id) return null;

    if (message.seen) {
      return (
        <span className="text-blue-500 text-xs ml-1" title="Read">
          ✓✓
        </span>
      );
    }
    if (message.delivered) {
      return (
        <span className="text-gray-400 text-xs ml-1" title="Delivered">
          ✓✓
        </span>
      );
    }
    return (
      <span className="text-gray-400 text-xs ml-1" title="Sent">
        ✓
      </span>
    );
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // ✅ Mark messages as seen when chat is open
  useEffect(() => {
    if (messages.length > 0 && selectedUser) {
      const unreadMessages = messages.filter(
        msg => msg.senderId._id === selectedUser._id && !msg.seen
      );
      unreadMessages.forEach(msg => {
        markMessageAsRead(msg._id);
      });
    }
  }, [messages, selectedUser]);

  // Auto scroll
  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/* Chat Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(String(selectedUser._id)) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7"
        />
        <img
          src={assets.help_icon}
          alt=""
          className="max-md:hidden max-w-5"
        />
      </div>

      {/* Messages Area */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 ${
              msg.senderId._id !== authUser._id
                ? "flex-row-reverse"
                : "justify-end"
            }`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                alt=""
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
              />
            ) : (
              <div className="relative">
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all
                  ${msg.senderId._id === authUser._id 
                    ? "bg-violet-500/30 text-white rounded-br-none" 
                    : "bg-gray-500/30 text-white rounded-bl-none"}`}
                >
                  {msg.text}
                  {/* ✅ Message status indicator */}
                  {msg.senderId._id === authUser._id && (
                    <span className="absolute -bottom-5 right-0">
                      {getMessageStatusIcon(msg)}
                    </span>
                  )}
                </p>
              </div>
            )}

            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId._id === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className="w-7 rounded-full"
              />
              <p className="text-gray-500">{formatMessageTime(msg.createdAt)}</p>
            </div>
          </div>
        ))}

        {/* ✅ Typing indicator */}
        {typingUser && (
          <div className="text-gray-400 text-sm italic mb-2">
            {selectedUser.fullName} is typing...
          </div>
        )}

        <div ref={scrollEnd}></div>
      </div>

      {/* Message Input Area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={handleTyping}
            value={input}
            onKeyDown={(e) => e.key === "Enter" ? handleSendMessage(e) : null}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer" />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt=""
          className="w-5 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div
      className="flex flex-col items-center justify-center gap-2 text-gray-500
      bg-white/10 max-md:hidden h-full"
    >
      <img src={assets.logo_icon} className="max-w-16" alt="" />
      <p className="text-lg font-medium text-white">
        Chat anytime, anywhere
      </p>
    </div>
  );
};

export default ChatContainer;