import LoginAnimation from "@/components/LoginAnimation";
import Signin from "@/components/SignIn";
import React from "react";

function SignInPage() {
  return (
    <>
      <div className="w-[100vw] flex justify-center items-center h-screen">
        <div className="flex justify-center items-center shadow-md rounded-lg px-10 py-20 border border-[#E6ECF0] bg-white">
          <LoginAnimation />
          <Signin />
        </div>
      </div>
    </>
  );
}

export default SignInPage;
