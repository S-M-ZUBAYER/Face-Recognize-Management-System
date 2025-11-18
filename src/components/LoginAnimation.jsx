import React from "react";
import Lottie from "lottie-react";
import loginAnimation from "../assets/login.json";

const LoginAnimation = () => {
  return (
    <div className="w-[24vw] justify-center">
      <Lottie
        animationData={loginAnimation}
        loop={true}
        style={{ width: 350, height: 350 }}
      />
    </div>
  );
};

export default LoginAnimation;
