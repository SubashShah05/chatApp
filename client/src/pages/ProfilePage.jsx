




import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

const ProfilePage = () => {

  const { authUser, updateProfile } = useContext(AuthContext);

  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const navigate = useNavigate();

  // ✅ FIX: load authUser properly
  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName || "");
      setBio(authUser.bio || "");
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ If no image
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }

    // ✅ Convert image to base64
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Img = reader.result;

      console.log("BASE64:", base64Img?.substring(0, 50)); // debug

      await updateProfile({
        profilePic: base64Img,
        fullName: name,
        bio
      });

      navigate("/");
    };

    reader.readAsDataURL(selectedImg);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">

      <div className="w-full max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg overflow-hidden">

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-8 flex-1">

          <h3 className="text-lg font-medium">Profile details</h3>

          {/* Upload Image */}
          <label htmlFor="avatar" className="flex items-center gap-3 cursor-pointer">
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept="image/*"
              hidden
            />

            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : authUser?.profilePic || assets.avatar_icon
              }
              alt=""
              className="w-12 h-12 rounded-full"
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
            className="p-2 border border-gray-500 rounded-md bg-transparent"
          />

          {/* Bio */}
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
            rows={4}
            className="p-2 border border-gray-500 rounded-md bg-transparent"
          />

          {/* Button */}
          <button
            type="submit"
            className="bg-purple-500 text-white p-2 rounded-full"
          >
            Save
          </button>
        </form>

        {/* RIGHT IMAGE */}
        <img
          src={authUser?.profilePic || assets.logo_icon}
          alt=""
          className="max-w-44 aspect-square m-10 rounded-full"
        />

      </div>
    </div>
  );
};

export default ProfilePage;