import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
// import { useEmployeeData } from "@/hook/useEmployeeData";
// import FancyLoader from "./components/FancyLoader";

function App() {
  // const { isLoading } = useEmployeeData();

  // if (isLoading) {
  //   return (
  //     <>
  //       <div className="flex items-center justify-center h-screen">
  //         <FancyLoader />
  //       </div>
  //     </>
  //   );
  // }
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
