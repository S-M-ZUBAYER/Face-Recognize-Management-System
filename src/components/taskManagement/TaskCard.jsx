// import { axiosApi } from "@/lib/axiosApi";
// import { Trash2 } from "lucide-react";
// import toast from "react-hot-toast";
import image from "@/constants/image";
import format from "date-fns/format";

export default function TaskCard({
  //   id,
  employeeName,
  reportDetails,
  employeeImage,
  date,
  //   fn,
}) {
  //   const { user } = useUserData();
  //   const show = user.name === employeeName;
  //   const handleDelete = async () => {
  //     try {
  //       await axiosApi.post("/dailyTaskReport/deleteById", {
  //         id,
  //       });
  //       toast.success("Your Task Report Deleted");
  //       fn();
  //     } catch (error) {
  //       console.error("error", error);
  //     }
  //   };
  return (
    <div className="border rounded-lg px-6 py-4   border-[#F0E6FF]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <img
            src={employeeImage || "https://i.pravatar.cc/150?img"}
            alt="image"
            className="w-7 h-7 rounded-full"
          />
          <span className="text-[16px]  font-[500] capitalize font-poppins-regular  text-[#1F1F1F]">
            {employeeName}
          </span>
        </div>
        {/* {show && (
          <Trash2
            className="w-4 h-4 text-red-300 cursor-pointer"
            onClick={handleDelete}
          />
        )} */}
      </div>
      <ul className="text-sm list-decimal  mt-2.5 ml-1 ">
        <p className="break-words whitespace-pre-line max-w-full line-clamp-4 text-[#2B2B2B] font-normal text-[13px] leading-5 font-poppins-regular">
          {reportDetails.map((detail, index) => (
            <li key={index} className="line-clamp-2">
              {index + 1}. {detail}
            </li>
          ))}
        </p>
      </ul>
      <div className="flex items-center gap-3 mt-4">
        <img src={image.calendar} alt="calendar" />
        <p className="text-[#004368] font-[400] text-[12px] leading-normal font-poppins-regular">
          {format(date, "dd MMMM yyyy")}
        </p>
      </div>
    </div>
  );
}
