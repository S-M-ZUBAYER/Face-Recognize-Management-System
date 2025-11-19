import FancyLoader from "@/components/FancyLoader";
import ResignedEmployeeTable from "@/components/resignedEmployee/ResignedEmployeeTable";
import { useEmployees } from "@/hook/useEmployees";

const ResignedEmployeePage = () => {
  const { resignedEmployees, isLoading } = useEmployees();

  if (isLoading) {
    <FancyLoader />;
  }
  return (
    <div className="p-4 space-y-4">
      <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F]">
        Resigned Employee List
      </p>
      <ResignedEmployeeTable employees={resignedEmployees} />
    </div>
  );
};

export default ResignedEmployeePage;
