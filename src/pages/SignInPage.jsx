import Signin from "@/components/SignIn";
import image from "@/constants/image";
import React from "react";

function SignInPage() {
  return (
    <>
      <div className="w-screen h-screen flex justify-center items-center bg-[#E6ECF0] p-4">
        <div className="flex flex-col md:flex-row w-full max-w-6xl rounded-2xl overflow-hidden shadow-xl border border-[#E6ECF0] bg-white h-[65vh] ">
          {/* Left Side - Brand/Image Section */}
          <div className="w-full md:w-2/5 bg-[#E6ECF0] p-8 md:p-12 flex flex-col items-center justify-center text-white m-2 rounded-2xl ">
            <div className="flex flex-col justify-center items-center">
              <img
                src={image.BrandLogo}
                alt="Brand Logo"
                className="w-48 h-auto mb-6"
              />
              <p className="text-2xl font-bold text-center mb-4 text-[#004368] ">
                Log In to explore our site
              </p>
            </div>
            <img
              src={image.LoginLogo}
              alt="Login Illustration"
              className="w-64 h-auto mt-8"
            />
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full md:w-3/5 p-8 md:p-12 flex justify-center items-center">
            <Signin />
          </div>
        </div>
      </div>
    </>
  );
}

export default SignInPage;
