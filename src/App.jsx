// App.jsx
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import ErrorModal from "./components/ErrorModal";
import SubscriptionModal from "./components/SubscriptionModal";
import SubscriptionRequiredModal from "./components/SubscriptionRequiredModal";
import WarningModal from "./components/WarningModal";
import UpdateProgressModal from "./components/UpdateProgressModal";
import FileViewerModal from "./components/FileViewerModal";
import LeaveLoadingModal from "./components/LeaveLoadingModal";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
      <ErrorModal />
      <SubscriptionModal />
      <SubscriptionRequiredModal />
      <WarningModal />
      <UpdateProgressModal />
      <FileViewerModal />
      <LeaveLoadingModal />
    </BrowserRouter>
  );
}

export default App;
