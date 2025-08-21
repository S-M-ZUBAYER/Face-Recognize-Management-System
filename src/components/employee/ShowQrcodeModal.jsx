import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import image from "@/constants/image";
import { motion, AnimatePresence } from "framer-motion";

export function ShowQrCodeModal({ deviceMAC, employeeId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [macDevice, setMacDevice] = useState(deviceMAC);
  const [Id, setId] = useState(employeeId);

  const qrValue = `employeeId-${Id} ; macId-${macDevice}`;

  useEffect(() => {
    setMacDevice(deviceMAC);
    setId(employeeId);
  }, [isOpen, deviceMAC, employeeId]);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        <img src={image.qrCodeIcon} alt="qr code" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-transparent backdrop-blur-sm bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative p-4 "
            >
              <div className="relative bg-[#FFFFFF] rounded-lg shadow dark:bg-gray-700 px-10 py-10 ">
                <div
                  onClick={() => setIsOpen(false)}
                  aria-label="Close dialog"
                  className="absolute top-3 right-3 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <QRCodeCanvas
                    value={qrValue}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
