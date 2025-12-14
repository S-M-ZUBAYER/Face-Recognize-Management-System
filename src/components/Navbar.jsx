import React, { memo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import SideDrawer from "./SideDrawer";
import { base64ToImage } from "@/lib/base64Toimage";
import useSubscriptionStore from "@/zustand/useSubscriptionStore";
import { useUserStore } from "@/zustand/useUserStore";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  // const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { setIsSubscriptionModal } = useSubscriptionStore();
  const { user } = useUserStore();
  let imageUrl = "https://i.pravatar.cc/300";
  if (user?.photo) {
    imageUrl = base64ToImage(user.photo);
  }
  const verify = user.emailVerified;

  const handleNavigate = () => {
    if (!verify) {
      navigate("/verification");
    }
  };
  // const handleShow = () => {
  //   setShow(!show);
  // };
  return (
    <div className="flex items-center justify-end gap-1 p-4 pt-8 pr-10 ">
      {/* {show && (
        <Input
          placeholder="Search"
          className="w-1/4 rounded-2xl"
          style={{
            outline: "none",
            boxShadow: "none",
          }}
        />
      )}

      <div onClick={handleShow} className="cursor-pointer text-[#54819A]">
        <SearchIcon />
      </div> */}
      {/* <div>
        <SideDrawer />
      </div> */}
      <div
        className="flex pl-5 pr-2  rounded-2xl py-1.5 gap-2 cursor-pointer border border-[#50500]"
        onClick={() => setIsSubscriptionModal(true)}
      >
        <p>Upgrade</p>
        <p className="bg-[#004368]  px-4 rounded-xl text-amber-50  ">Plan</p>
      </div>
      {/* <p>{user.userEmail} </p> */}

      <div className="flex items-center gap-4 pl-1.5">
        <Avatar>
          <AvatarImage src={imageUrl} />
        </Avatar>
      </div>
      <div
        className={` py-0.5 rounded-4xl  flex justify-center items-center ${
          verify
            ? "text-[#16A34A] text-[0.7vw] border border-[#50500] px-4 py-1.5  "
            : "border border-[#fdbcbc] px-4 py-1.5  text-[#ff0000] cursor-pointer "
        }`}
        onClick={handleNavigate}
      >
        <p>{verify ? "Email Verified" : "Email Unverified"} </p>
      </div>
    </div>
  );
};

export default memo(Navbar);
