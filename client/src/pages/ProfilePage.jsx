import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";

const ProfilePage = () => {

  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState("Martin Johnson");
  const [bio, setBio] = useState("Hi Everyone, I am Using QuickChat");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // save profile logic here
    console.log({ name, bio, selectedImg });

    navigate("/");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat
      flex items-center justify-center px-4"
    >

      {/* Main Container */}
      <div
        className="w-full max-w-2xl backdrop-blur-2xl
        text-gray-300 border-2 border-gray-600
        flex items-center justify-between
        max-sm:flex-col-reverse rounded-lg overflow-hidden"
      >

        {/* FORM SECTION */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-8 flex-1"
        >
          <h3 className="text-lg font-medium">Profile details</h3>

          {/* Upload Image */}
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png,.jpg,.jpeg"
              hidden
            />

            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : assets.avatar_icon
              }
              alt=""
              className={`w-12 h-12 ${
                selectedImg && "rounded-full"
              } object-cover`}
            />

            <p>Upload profile image</p>
          </label>

          {/* Name */}
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your name"
            className="p-2 border border-gray-500 rounded-md
            focus:outline-none focus:ring-2 focus:ring-violet-500
            bg-transparent"
          />

          {/* Bio */}
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
            rows={4}
            className="p-2 border border-gray-500 rounded-md
            focus:outline-none focus:ring-2 focus:ring-violet-500
            bg-transparent"
          ></textarea>

          {/* Button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400
            to-violet-600 text-white p-2 rounded-full
            text-lg cursor-pointer hover:opacity-90 transition"
          >
            Save
          </button>
        </form>

        {/* RIGHT SIDE IMAGE */}
        <img
          src={
            selectedImg
              ? URL.createObjectURL(selectedImg)
              : assets.logo_icon
          }
          alt=""
          className="max-w-44 aspect-square m-10 rounded-full
          max-sm:mt-8"
        />
      </div>
    </div>
  );
};

export default ProfilePage;