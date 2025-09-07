// import { axiosApi } from "@/lib/axiosApi";
// import { Trash2 } from "lucide-react";
// import toast from "react-hot-toast";

export default function TaskCard({
  //   id,
  employeeName,
  reportDetails,
  image,
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
    <div className="border rounded-lg p-4 ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <img
            src={image || "https://i.pravatar.cc/150?img"}
            alt="image"
            className="w-7 h-7 rounded-full"
          />
          <span>{employeeName}</span>
        </div>
        {/* {show && (
          <Trash2
            className="w-4 h-4 text-red-300 cursor-pointer"
            onClick={handleDelete}
          />
        )} */}
      </div>
      <ul className="text-sm list-decimal pl-5 mt-1.5">
        <p className="break-words whitespace-pre-line max-w-full line-clamp-4">
          {reportDetails}
        </p>
      </ul>
    </div>
  );
}
