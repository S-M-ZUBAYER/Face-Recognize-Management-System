import React from "react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { useUserData } from "@/hook/useUserData";
import {
  DashboardIcon,
  EmployeeIcon,
  SalaryCalculationIcon,
  AttendanceIcon,
  EmployeeManagementIcon,
  DeviceManagementIcon,
  AdminManagementIcon,
  TaskManagementIcon,
  LeaveManagementIcon,
  RulesIcon,
  LogoutIcon,
} from "@/constants/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { base64ToImage } from "@/lib/base64Toimage";

const links = [
  { label: "Dashboard", icon: DashboardIcon, path: "/" },
  { label: "Employee", icon: EmployeeIcon, path: "/employee" },
  { label: "Attendance", icon: AttendanceIcon, path: "/attendance" },
  {
    label: "Salary calculation",
    icon: SalaryCalculationIcon,
    path: "/salary-calculation",
  },
  {
    label: "Employee management",
    icon: EmployeeManagementIcon,
    path: "/employee-management",
  },
  {
    label: "Device management",
    icon: DeviceManagementIcon,
    path: "/device-management",
  },
  {
    label: "Admin management",
    icon: AdminManagementIcon,
    path: "/admin-management",
  },
  // {
  //   label: "Task management",
  //   icon: TaskManagementIcon,
  //   path: "/task-management",
  // },
  // {
  //   label: "Leave management",
  //   icon: LeaveManagementIcon,
  //   path: "/leave-management",
  // },
  // { label: "Rules", icon: RulesIcon, path: "/rules" },
];

const Sidebar = () => {
  const { user } = useUserData();
  let imageUrl = "https://i.pravatar.cc/300";
  if (user?.photo) {
    imageUrl = base64ToImage(user.photo);
  }
  return (
    <aside className="w-80 h-screen  border-[#F0E6FF] border-r p-6 flex flex-col justify-between bg-[#E6ECF0] ">
      <div className=" flex flex-col justify-center items-center">
        <div className="py-10 w-full px-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="145"
            height="28"
            viewBox="0 0 145 28"
            fill="none"
          >
            <g clipPath="url(#clip0_769_7740)">
              <path
                d="M14.1496 17.5833V13.0209H25.9495V23.8071C24.8016 24.9157 23.1409 25.8905 20.9644 26.7343C18.788 27.5781 16.5853 28 14.3535 28C11.5186 28 9.04502 27.4064 6.93852 26.2164C4.8291 25.0292 3.24412 23.3299 2.18358 21.1215C1.12304 18.9101 0.592773 16.5067 0.592773 13.9083C0.592773 11.0888 1.18423 8.5836 2.36713 6.3926C3.55296 4.19869 5.28361 2.51689 7.56493 1.34719C9.30433 0.451003 11.4662 0 14.0564 0C17.4215 0 20.0525 0.704146 21.9434 2.11535C23.8372 3.52655 25.0521 5.47314 25.597 7.96093L20.1603 8.97641C19.7786 7.64668 19.0589 6.59628 18.0042 5.82812C16.9495 5.05996 15.6326 4.67297 14.0564 4.67297C11.6643 4.67297 9.76176 5.42949 8.3516 6.94544C6.93852 8.4614 6.23344 10.7077 6.23344 13.6872C6.23344 16.8995 6.94726 19.3116 8.37782 20.9178C9.80838 22.524 11.6818 23.327 14.001 23.327C15.1489 23.327 16.2969 23.103 17.4507 22.652C18.6044 22.2039 19.5921 21.6569 20.4196 21.0167V17.5833H14.1496Z"
                fill="#004368"
              />
              <path
                d="M35.9346 27.5372H30.7368V7.92297H35.5646V10.7105C36.3891 9.39236 37.1321 8.52527 37.7935 8.10628C38.4519 7.68728 39.2007 7.47778 40.0398 7.47778C41.2227 7.47778 42.3649 7.80367 43.4604 8.45544L41.8521 12.98C40.9751 12.4126 40.1622 12.1304 39.4105 12.1304C38.6821 12.1304 38.0673 12.3312 37.5604 12.7298C37.0534 13.1313 36.6572 13.8529 36.3687 14.9004C36.0803 15.9479 35.9346 18.1389 35.9346 21.4763V27.5372Z"
                fill="#004368"
              />
              <path
                d="M44.4971 17.4551C44.4971 15.7326 44.9225 14.0624 45.7732 12.4505C46.624 10.8385 47.8302 9.60479 49.3889 8.75516C50.9477 7.90553 52.69 7.48071 54.613 7.48071C57.5848 7.48071 60.0205 8.44382 61.9173 10.37C63.8169 12.2963 64.7667 14.7317 64.7667 17.6734C64.7667 20.6413 63.8082 23.1 61.8911 25.0524C59.9739 27.0048 57.5615 27.9795 54.6508 27.9795C52.8503 27.9795 51.1342 27.5722 49.4997 26.7604C47.8652 25.9486 46.624 24.7556 45.7732 23.1873C44.9225 21.6189 44.4971 19.7073 44.4971 17.4551ZM49.8231 17.7316C49.8231 19.6782 50.2863 21.1679 51.2099 22.2009C52.1335 23.2338 53.2756 23.7517 54.6304 23.7517C55.9853 23.7517 57.1245 23.2338 58.0422 22.2009C58.96 21.1679 59.4203 19.6636 59.4203 17.6937C59.4203 15.7733 58.96 14.2952 58.0422 13.2623C57.1245 12.2293 55.9853 11.7114 54.6304 11.7114C53.2727 11.7114 52.1335 12.2293 51.2099 13.2623C50.2863 14.2952 49.8231 15.785 49.8231 17.7316Z"
                fill="#004368"
              />
              <path
                d="M66.7485 27.5374V23.4929L74.1082 15.0519C75.3173 13.6727 76.2089 12.695 76.7887 12.116C76.1856 12.1538 75.3902 12.1771 74.4025 12.1887L67.4682 12.2265V7.9231H83.7055V11.598L76.1972 20.2427L73.5517 23.1059C74.9939 23.0186 75.8884 22.9779 76.2322 22.9779H84.2765V27.5403H66.7485V27.5374Z"
                fill="#004368"
              />
              <path
                d="M85.6865 27.5374V23.4929L93.0462 15.0519C94.2553 13.6727 95.1469 12.695 95.7267 12.116C95.1236 12.1538 94.3282 12.1771 93.3405 12.1887L86.4062 12.2265V7.9231H102.643V11.598L95.1352 20.2427L92.4897 23.1059C93.9319 23.0186 94.8264 22.9779 95.1702 22.9779H103.215V27.5403H85.6865V27.5374Z"
                fill="#004368"
              />
              <path
                d="M106.713 5.26364V0.462646H111.911V5.26364H106.713ZM106.713 27.5374V7.9231H111.911V27.5374H106.713Z"
                fill="#004368"
              />
              <path
                d="M117.237 5.26364V0.462646H122.435V5.26364H117.237ZM117.237 27.5374V7.9231H122.435V27.5374H117.237Z"
                fill="#004368"
              />
              <path
                d="M139.133 21.2959L144.31 22.163C143.643 24.0602 142.594 25.5034 141.158 26.4956C139.721 27.4878 137.924 27.9824 135.768 27.9824C132.353 27.9824 129.824 26.868 128.184 24.6392C126.89 22.8526 126.24 20.6005 126.24 17.88C126.24 14.6298 127.091 12.0839 128.793 10.242C130.494 8.40018 132.644 7.48071 135.246 7.48071C138.168 7.48071 140.473 8.44382 142.163 10.37C143.853 12.2963 144.66 15.2496 144.587 19.2272H131.566C131.604 20.7664 132.024 21.9652 132.825 22.8206C133.626 23.6761 134.625 24.1038 135.82 24.1038C136.633 24.1038 137.318 23.8827 137.874 23.4375C138.431 22.9923 138.85 22.2794 139.133 21.2959ZM139.43 16.0498C139.392 14.5484 139.005 13.4049 138.265 12.6251C137.524 11.8423 136.624 11.4524 135.564 11.4524C134.43 11.4524 133.492 11.8656 132.752 12.6891C132.012 13.5154 131.648 14.6357 131.659 16.0498H139.43Z"
                fill="#004368"
              />
            </g>
            <defs>
              <clipPath id="clip0_769_7740">
                <rect
                  width="144"
                  height="28"
                  fill="white"
                  transform="translate(0.592773)"
                />
              </clipPath>
            </defs>
          </svg>
        </div>
        <div className="space-y-2">
          {links.map((link, idx) => (
            <NavLink
              key={idx}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-all relative",
                  isActive
                    ? "text-[#004368] before:absolute before:left-[-30px] before:top-0 before:bottom-0 before:w-1 before:bg-[#004368]"
                    : "text-[#BDBDBD] hover:text-[#004368]"
                )
              }
            >
              <link.icon />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
      <div className="pl-9">
        <div
          className="flex items-center gap-2 justify-between"
          onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("deviceMACs");
            window.location.href = "/signin";
          }}
        >
          <div className="flex items-center gap-2">
            <Avatar className="w-[2vw]">
              <AvatarImage src={imageUrl} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <p className="text-[#2A2A2A] text-[14px]  font-[700] uppercase ">
              {user?.userName}
            </p>
          </div>
          <LogoutIcon />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
