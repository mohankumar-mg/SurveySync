import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../authService";
import { useAuth } from "../AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Make sure to import the CSS

const SignIn = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Import setUser from AuthContext
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();

    const user = await signIn(email, password);

    if (user) {
      if (user === "verify-email") {
        toast.info("Please verify your email before signing in.");
      } else {
        setUser(user); // Immediately update context user state

        console.log("Sign-In Successful!");
        toast.success("Sign-In Successful!");

        // Add a small delay before navigating
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500); // Delay of 500ms
      }
    } else {
      console.log("Sign-In Failed");
      toast.error("Sign-In Error: Create an Account to Sign in!");
    }
  };

  return (
    <div className="flex justify-center items-center">
      <form
        onSubmit={handleSignIn}
        className="mt-[130px] w-[40%] mx-[30%] flex justify-center shadow-2xl shadow-teal-500/50 w-[400px]"
      >
        <div className="mx-[20px] my-[70px] flex flex-col justify-center items-center">
          <label
            htmlFor="email"
            className="flex items-center w-[100%] rounded-xl"
          >
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
              name="password"
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
              Sign in
            </button>
            <p>
              Don't Have an account?{" "}
              <Link to="/sign-up" className="text-[#C57BFA] italic">
                Create an account
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

export default SignIn;
