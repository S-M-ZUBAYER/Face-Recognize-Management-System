import {
  motion as MotionSVG,
  motion as MotionText,
  motion as MotionDiv,
} from "framer-motion";
import { Button } from "@/components/ui/button";

const Animated404 = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-[78vw] bg-white dark:bg-gray-900 text-gray-800 dark:text-white p-4">
      <MotionSVG.svg
        xmlns="http://www.w3.org/2000/svg"
        width="300"
        height="300"
        viewBox="0 0 24 24"
        fill="none"
        className="mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <MotionSVG.circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ strokeDasharray: "0, 100" }}
          animate={{ strokeDasharray: "100, 0" }}
          transition={{ duration: 1 }}
        />
        <MotionSVG.text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="8"
          fill="currentColor"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          404
        </MotionSVG.text>
      </MotionSVG.svg>

      <MotionDiv.h1
        className="text-4xl font-bold mb-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Page Not Found
      </MotionDiv.h1>

      <MotionDiv.p
        className="text-lg text-center mb-6 max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Sorry, the page you are looking for doesn't exist or has been moved.
      </MotionDiv.p>

      <MotionDiv.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          onClick={() =>
            (window.location.href = "/Face_Attendance_Management_System")
          }
        >
          Go Back Home
        </Button>
      </MotionDiv.div>
    </div>
  );
};

export default Animated404;
