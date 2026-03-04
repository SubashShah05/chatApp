import React, { useEffect, useRef } from "react";
import assets, { messagesDummyData } from "../assets/assets";
import { formatMessageTime } from "../lib/utils";

// ChatContainer component
// selectedUser → currently selected chat user
// setSelectedUser → function to change selected user
const ChatContainer = ({ selectedUser, setSelectedUser }) => {

  // Reference used for auto-scrolling to latest message
  const scrollEnd = useRef();

  // Auto scroll when component loads / messages update
  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // If user selected → show chat screen
  // else → show empty welcome screen
  return selectedUser ? (

    // Main chat container
    <div className="h-full overflow-scroll relative backdrop-blur-lg">

      {/* ===== Chat Header ===== */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">

        {/* User profile image */}
        <img
          src={assets.profile_martin}
          alt=""
          className="w-8 rounded-full"
        />

        {/* User name + online status */}
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          Martin Johnson

          {/* Green dot = online status */}
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
        </p>

        {/* Back button (only visible on mobile) */}
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7"
        />

        {/* Help icon (hidden on small screens) */}
        <img
          src={assets.help_icon}
          alt=""
          className="max-md:hidden max-w-5"
        />
      </div>

      {/* ===== Messages Area ===== */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">

        {/* Loop through all messages */}
        {messagesDummyData.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 ${
              msg.senderId !== "680f50e4f10f3cd28382ecf9"
                ? "flex-row-reverse"
                : "justify-end"
            }`}
          >

            {/* If message contains image */}
            {msg.image ? (
              <img
                src={msg.image}
                alt=""
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
              />
            ) : (

              /* Text message bubble */
              <p
                className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all
                bg-violet-500/30 text-white
                ${
                  msg.senderId === "680f50e4f10f3cd28382ecf9"
                    ? "rounded-br-none"
                    : "rounded-bl-none"
                }`}
              >
                {msg.text}
              </p>
            )}

            {/* Avatar + message time */}
            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === "680f50e4f10f3cd28382ecf9"
                    ? assets.avatar_icon
                    : assets.profile_martin
                }
                alt=""
                className="w-7 rounded-full"
              />

              <p className="text-gray-500">{formatMessageTime(msg.createdAt) }</p>
            </div>

          </div>
        ))}

        {/* Auto-scroll target */}
        <div ref={scrollEnd}></div>
      </div>

     {/* ===== bottom area// Message Input Area ===== */}
    <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
      <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
        <input type="text" placeholder="Send a message" 
        className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"/>
        <input type="file" id="image" accept="image/png, image/jpeg" hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer" />
        </label>
      </div>
      <img src={assets.send_button} alt="" className="w-5 cursor-pointer" />

    </div>
  

    </div>

  ) : (

    // ===== Empty Screen (No Chat Selected) =====
    <div
      className="flex flex-col items-center justify-center gap-2 text-gray-500
      bg-white/10 max-md:hidden h-full"
    >
      {/* App logo */}
      <img src={assets.logo_icon} className="max-w-16" alt="" />

      {/* Welcome text */}
      <p className="text-lg font-medium text-white">
        Chat anytime, anywhere
      </p>
    </div>
  );
};

export default ChatContainer;