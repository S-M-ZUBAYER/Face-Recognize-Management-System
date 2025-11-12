import Lottie from "lottie-react";
import LoadingAnimation from "../assets/loading2.json";

export default function FancyLoader() {
  return (
    <div
      className="flex items-center justify-center h-[70vh] bg-white"
      role="status"
      aria-label="Loading"
    >
      <Lottie
        animationData={LoadingAnimation}
        loop={true}
        style={{ width: 300 }}
      />
    </div>
  );
}
