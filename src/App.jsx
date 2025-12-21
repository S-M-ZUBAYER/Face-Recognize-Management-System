// App.jsx
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import ErrorModal from "./components/ErrorModal";
import SubscriptionModal from "./components/SubscriptionModal";
import SubscriptionRequiredModal from "./components/SubscriptionRequiredModal";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
      <ErrorModal />
      <SubscriptionModal />
      <SubscriptionRequiredModal />
    </BrowserRouter>
  );
}

export default App;
