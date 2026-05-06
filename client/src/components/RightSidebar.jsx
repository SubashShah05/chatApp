// components/RightSidebar.jsx
import React, { useState, useEffect } from 'react'
import assets from '../assets/assets'
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'

function RightSidebar() {

  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers, userStatuses } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([])

  useEffect(() => {
    setMsgImages(
      messages.filter(msg => msg.image).map(msg => msg.image)
    )
  }, [messages])

  // ✅ Get last seen text
  const getLastSeenText = () => {
    if (!selectedUser) return '';
    const status = userStatuses[selectedUser._id];
    
    if (onlineUsers.includes(String(selectedUser._id))) {
      return 'Online';
    }
    
    if (status?.lastSeen) {
      const lastSeen = new Date(status.lastSeen);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastSeen) / 1000 / 60);
      
      if (diffMinutes < 1) return 'Last seen just now';
      if (diffMinutes < 60) return `Last seen ${diffMinutes} minutes ago`;
      if (diffMinutes < 1440) return `Last seen ${Math.floor(diffMinutes / 60)} hours ago`;
      return `Last seen ${Math.floor(diffMinutes / 1440)} days ago`;
    }
    
    return 'Offline';
  };

  return selectedUser && (
    <div
      className={`bg-[#8185B2]/10 text-white
      w-full md:w-[320px] lg:w-[350px]
      h-full overflow-y-auto
      ${selectedUser ? "max-md:hidden" : ""}`}
    >
      <div className='pt-16 flex flex-col items-center gap-3 text-center px-4'>
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt=""
          className='w-20 md:w-24 lg:w-28 aspect-square rounded-full object-cover'
        />

        <h1 className='text-lg md:text-xl font-medium flex items-center gap-2'>
          {selectedUser.fullName}
          {onlineUsers.includes(String(selectedUser._id)) && (
            <span className='w-2.5 h-2.5 rounded-full bg-green-500'></span>
          )}
        </h1>

        {/* ✅ Last seen status */}
        <p className='text-xs text-gray-400'>{getLastSeenText()}</p>

        <p className='text-sm md:text-base text-gray-300 max-w-[250px]'>
          {selectedUser.bio}
        </p>

        <hr className='border-[#ffffff50] my-4 w-full' />

        <div className='w-full px-2 text-xs'>
          <p className='text-left mb-2'>Media ({msgImages.length})</p>

          <div
            className='max-h-[200px] overflow-y-auto
            grid grid-cols-2 gap-3 opacity-80'
          >
            {msgImages.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url)}
                className='cursor-pointer rounded'
              >
                <img
                  src={url}
                  alt="media"
                  className='w-full h-full rounded-md object-cover'
                />
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => logout()}
          className='mt-4 mb-6 w-full max-w-[200px]
          py-2 rounded-md
          bg-red-500 text-white
          text-sm md:text-base font-medium
          hover:bg-red-600
          transition'
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default RightSidebar