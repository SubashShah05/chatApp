import React, { useState } from "react";
import assets from "../assets/assets";

const LoginPage = () => {

  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const onSubmitHandler = (event) => {
    event.preventDefault();

    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    console.log({ fullName, email, password, bio });
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center
      flex items-center justify-center gap-8
      sm:justify-evenly max-sm:flex-col
      backdrop-blur-2xl px-4"
    >

      {/* ---------- LEFT ---------- */}
      <img
        src={assets.logo_big}
        alt=""
        className="w-[min(30vw,250px)]"
      />

      {/* ---------- RIGHT ---------- */}
      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/10 text-white
        border-gray-500 p-6 flex flex-col gap-6
        rounded-lg shadow-lg w-full max-w-md"
      >

        {/* Header */}
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}

          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt=""
              className="w-5 cursor-pointer"
            />
          )}
        </h2>

        {/* Full Name */}
        {currState === "Sign up" && !isDataSubmitted && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            placeholder="Full Name"
            required
            className="p-2 border border-gray-500 rounded-md
            focus:outline-none focus:ring-2
            focus:ring-violet-500 bg-transparent"
          />
        )}

        {/* Email */}
        {!isDataSubmitted && (
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder="Email Address"
            required
            className="p-2 border border-gray-500 rounded-md
            focus:outline-none focus:ring-2
            focus:ring-violet-500 bg-transparent"
          />
        )}

        {/* Password */}
        {!isDataSubmitted && (
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            placeholder="Password"
            required
            className="p-2 border border-gray-500 rounded-md
            focus:outline-none focus:ring-2
            focus:ring-violet-500 bg-transparent"
          />
        )}

        {/* Bio */}
        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            placeholder="Provide a short bio..."
            required
            className="p-2 border border-gray-500 rounded-md
            focus:outline-none focus:ring-2
            focus:ring-violet-500 bg-transparent"
          ></textarea>
        )}

        {/* Button */}
        <button
          type="submit"
          className="py-3 bg-gradient-to-r
          from-purple-400 to-violet-600
          text-white rounded-md cursor-pointer"
        >
          {currState === "Sign up"
            ? isDataSubmitted
              ? "Create Account"
              : "Next"
            : "Login Now"}
        </button>

        {/* Terms */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        {/* Switch Auth */}
        <div className="flex flex-col gap-2">
          {currState === "Sign up" ? (
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-400 cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              Create an account{" "}
              <span
                onClick={() => setCurrState("Sign up")}
                className="font-medium text-violet-400 cursor-pointer"
              >
                Click here
              </span>
            </p>
          )}
        </div>

      </form>
    </div>
  );
};

export default LoginPage;