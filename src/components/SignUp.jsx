import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { signUp } from "../authService"; // Ensure your signUp function is handling Firebase user creation properly
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Make sure to import the CSS

const SignUp = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();

    const user = await signUp(username, email, password);
    if (user) {
      await signOut();

      console.log(
        "Sign-Up Successful! User Profile saved! Verification email sent."
      );
      toast.success(
        "Sign-Up Successful! User Profile saved! Verification email sent."
      );

      // Add a small delay before navigating
      setTimeout(() => {
        navigate("/sign-in");
      }, 2500); // Delay of 500ms
    } else {
      console.log("Sign-Up Failed");
      toast.error("Sign-Up Failed");
    }
  };

  return (
    <div className="flex justify-center items-center">
      <form
        onSubmit={handleSignUp}
        className="mt-[130px] w-[40%] mx-[30%] flex justify-center shadow-2xl shadow-teal-500/50 w-[400px]"
      >
        <div className="mx-[20px] my-[70px] flex flex-col justify-center items-center">
          <label htmlFor="username" className="block w-[100%]">
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Username"
              className="block bg-[#F5F5F5] h-[35px] w-[100%] rounded-xl pl-[10px]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label htmlFor="email" className="block mt-[35px] w-[100%]">
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              className="block bg-[#F5F5F5] h-[35px] w-[100%] rounded-xl pl-[10px]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label htmlFor="password" className="block mt-[35px] w-[100%] ">
            <input
              id="password"
              type="password"
              placeholder="Password"
              className="block bg-[#F5F5F5] h-[35px] w-[100%] rounded-xl pl-[10px]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <div className="flex flex-col items-center mt-[40px] w-[100%]">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 mb-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-[100%]"
            >
              Sign up
            </button>
            <p>
              Already Have an account?{" "}
              <Link to="/sign-in" className="text-[#C57BFA]">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </form>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
      />
    </div>
  );
};

export default SignUp;
