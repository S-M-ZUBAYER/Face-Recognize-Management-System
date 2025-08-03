import { useState } from "react";
// import { useNotificationStore } from "@/Zustand/useNotificationStore";
// import { useWebSocket } from "@/hook/useWebSocket";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { icons } from "@/constants/icons";
// import { useNavigate } from "react-router-dom";
// import useTaskColumns from "@/hook/useTasksData";
// import useTaskData from "@/hook/useTaskData";
// import { useBugData } from "@/hook/useBugData";
// import { useGetAllProjectData } from "@/hook/useGetAllprojectData";

const SideDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  //   const navigate = useNavigate();
  //   const { fetchTasks } = useTaskColumns();
  //   const { fetchTaskById } = useTaskData();
  //   const { fetchBugsById } = useBugData();
  //   const { refetch } = useGetAllProjectData();
  //   const { unreadCount, messages, markAsRead, seenMessageIds } =
  //     useNotificationStore();

  //   useWebSocket();

  //   const handleNavigation = (path, id) => {
  //     markAsRead(id);
  //     setIsOpen(false);
  //     if (path.includes("task")) {
  //       fetchTasks();
  //       fetchTaskById();
  //     } else if (path.includes("bug")) {
  //       fetchBugsById();
  //     } else if (path.includes("project")) {
  //       refetch();
  //     }
  //     navigate(path);
  //   };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        <div className="relative p-1 rounded-full">
          <div className="w-7 h-7 flex items-center justify-center rounded-full">
            <img src={icons.notification} alt="notification" />
          </div>
          {/* {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
              {unreadCount}
            </span>
          )} */}
        </div>
      </DrawerTrigger>

      <DrawerContent className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg border-l z-50">
        <DrawerHeader>
          <DrawerTitle>Notifications</DrawerTitle>
          <DrawerDescription>Your recent messages</DrawerDescription>
        </DrawerHeader>

        <div className="max-h-[calc(100vh-160px)] overflow-y-auto px-4 custom-scrollbar">
          {/* {messages.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications</p>
          ) : (
            <ul className="space-y-2 list-none">
              {messages.map((msg, index) => {
                const prevMsg = messages[index - 1];
                const showDateHeader =
                  index === 0 || msg.date !== prevMsg?.date;

                return (
                  <div key={msg.id}>
                    {showDateHeader && (
                      <p className="text-xs font-semibold text-gray-500 my-2 text-center">
                        {msg.date || "Unknown date"}
                      </p>
                    )}

                    <li
                      className={`px-2 py-2 border-b last:border-b-0 text-sm rounded-md cursor-pointer transition ${
                        seenMessageIds.has(msg.id)
                          ? "bg-white hover:bg-gray-100"
                          : "bg-gray-300 hover:bg-gray-200"
                      }`}
                      onClick={() => handleNavigation(msg.path, msg.id)}
                    >
                      <strong>From:</strong> {msg.name}
                      <br />
                      <span
                        className="flex text-start"
                        dangerouslySetInnerHTML={{ __html: msg.message }}
                      />
                    </li>
                  </div>
                );
              })}
            </ul>
          )} */}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SideDrawer;
