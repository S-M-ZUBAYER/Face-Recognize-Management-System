import React, { memo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useUserData } from "@/hook/useUserData";
import SideDrawer from "./SideDrawer";
import { base64ToImage } from "@/lib/base64Toimage";
import useSubscriptionStore from "@/zustand/useSubscriptionStore";

const Navbar = () => {
  // const [show, setShow] = useState(false);
  const { setIsSubscriptionModal } = useSubscriptionStore();
  const { user } = useUserData();
  let imageUrl = "https://i.pravatar.cc/300";
  if (user?.photo) {
    imageUrl = base64ToImage(user.photo);
  }
  // const handleShow = () => {
  //   setShow(!show);
  // };
  return (
    <div className="flex items-center justify-end gap-6 p-4 pt-8 pr-10 ">
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
        className="flex pl-5 pr-2 border border-[#B0C5D0] rounded-2xl py-1.5 gap-2 cursor-pointer"
        onClick={() => setIsSubscriptionModal(true)}
      >
        <p>Upgrade</p>
        <p className="bg-[#004368]  px-4 rounded-xl text-amber-50  ">Plan</p>
      </div>
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={imageUrl} />
        </Avatar>
      </div>
    </div>
  );
};

export default memo(Navbar);
