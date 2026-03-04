

import React from 'react'
import assets, { imagesDummyData } from '../assets/assets'

function RightSidebar({ selectedUser }) {

  // Show sidebar only when user is selected
  return selectedUser && (
    <div
      className={`bg-[#8185B2]/10 text-white
      w-full md:w-[320px] lg:w-[350px]
      h-full overflow-y-auto
      ${selectedUser ? "max-md:hidden" : ""}`}
    >

      {/* User info section */}
      <div className='pt-16 flex flex-col items-center gap-3 text-center px-4'>

        {/* Profile Image */}
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt=""
          className='w-20 md:w-24 lg:w-28 aspect-square rounded-full object-cover'
        />

        {/* User Name */}
        <h1 className='text-lg md:text-xl font-medium flex items-center gap-2'>
          <span className='w-2 h-2 rounded-full bg-green-500'></span>
          {selectedUser.fullName}
        </h1>

        {/* Bio */}
        <p className='text-sm md:text-base text-gray-300 max-w-[250px]'>
          {selectedUser.bio}
        </p>

        <hr className='border-[#ffffff50] my-4 w-full' />

        {/* Media Section */}
        <div className='w-full px-2 text-xs'>
          <p className='text-left mb-2'>Media</p>

          <div
            className='max-h-[200px] overflow-y-auto
            grid grid-cols-2 gap-3 opacity-80'
          >
            {imagesDummyData.map((url, index) => (
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

        {/* ============================= */}
        {/* LOGOUT BUTTON STYLES */}
        {/* ============================= */}

       

        
        
        <button
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