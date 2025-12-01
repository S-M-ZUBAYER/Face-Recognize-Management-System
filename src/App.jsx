// App.jsx
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import ErrorModal from "./components/ErrorModal";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
      <ErrorModal />
    </BrowserRouter>
  );
}

export default App;
