import React, { memo, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import SideDrawer from "./SideDrawer";
import { base64ToImage } from "@/lib/base64Toimage";
import useSubscriptionStore from "@/zustand/useSubscriptionStore";
import { useUserStore } from "@/zustand/useUserStore";
import { useNavigate } from "react-router-dom";
import useResponsiveStore from "@/zustand/useResponsiveStore";

const Navbar = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  const { setIsSubscriptionModal, subScriptionDaysRemaining } =
    useSubscriptionStore();

  const { isSmallLaptop } = useResponsiveStore();
  // console.log(subScriptionDaysRemaining);
  const { user } = useUserStore();
  let imageUrl = "https://i.pravatar.cc/300";
  if (user?.photo) {
    imageUrl = base64ToImage(user.photo);
  }
  const verify = user.emailVerified;

  const handleNavigate = () => {
    if (!verify) {
      navigate("/Face_Attendance_Management_System/verification");
    }
  };

  return (
    <div className="flex items-center justify-end gap-1 p-4 pt-8 pr-10 ">
      {/* <div
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          subScriptionDaysRemaining > 30
            ? "bg-green-100 text-green-800"
            : subScriptionDaysRemaining > 7
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
        }`}
      >
        {subScriptionDaysRemaining > 0
          ? `${subScriptionDaysRemaining} days remaining`
          : "Expired"}
      </div> */}
      <div
        className="relative flex pl-5 pr-2 rounded-2xl py-1.5 gap-2 cursor-pointer border border-[#50500]"
        onClick={() => setIsSubscriptionModal(true)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <p>Upgrade</p>
        <p className="bg-[#004368] px-4 rounded-xl text-amber-50">Plan</p>

        {showTooltip && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2  text-[#004368] text-xs px-2 py-1 rounded whitespace-nowrap z-10">
            {subScriptionDaysRemaining} days remaining
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 pl-1.5 relative">
        {subScriptionDaysRemaining > 30 && (
          <div
            className={`absolute -top-3 -right-5 bg-[#FFCF35]   text-[#fbfdff] ${isSmallLaptop ? "text-[10px] " : "text-[12px] "} font-bold px-2 py-0.5 rounded-full z-10 flex items-center justify-center`}
          >
            VIP
          </div>
        )}
        <Avatar>
          <AvatarImage src={imageUrl} />
        </Avatar>
      </div>

      <div
        className={`py-0.5 rounded-4xl flex justify-center items-center ${
          verify
            ? "text-[#16A34A] text-[0.7vw]  px-4 py-1.5"
            : "border border-[#fdbcbc] px-4 py-1.5 text-[#ff0000] cursor-pointer"
        }`}
        onClick={handleNavigate}
      >
        <p>{verify ? "Email Verified" : "Email Unverified"} </p>
      </div>
    </div>
  );
};

export default memo(Navbar);
