import React, { memo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useUserData } from "@/hook/useUserData";
import SideDrawer from "./SideDrawer";
import { SearchIcon } from "@/constants/icons";
import { base64ToImage } from "@/lib/base64Toimage";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { user } = useUserData();
  let imageUrl = "https://i.pravatar.cc/300";
  if (user?.photo) {
    imageUrl = base64ToImage(user.photo);
  }
  const handleShow = () => {
    setShow(!show);
  };
  return (
    <div className="flex items-center justify-end gap-6 p-4 pt-8 pr-20 ">
      {show && (
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
      </div>
      <div>
        <SideDrawer />
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="w-[2vw]">
          <AvatarImage src={imageUrl} />
        </Avatar>
      </div>
    </div>
  );
};

export default memo(Navbar);
