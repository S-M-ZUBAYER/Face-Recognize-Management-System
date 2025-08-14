import React, { useState, useRef, useEffect } from "react";
import { Client } from "@stomp/stompjs";

const Warehouse = () => {
  const [devices, setDevices] = useState([]);
  const [messageCounts, setMessageCounts] = useState({});
  const stompClientsRef = useRef({});

  const generateMac = () => {
    const hex = "0123456789abcdef";
    let mac = [];
    for (let i = 0; i < 6; i++) {
      mac.push(
        hex[Math.floor(Math.random() * 16)] +
          hex[Math.floor(Math.random() * 16)]
      );
    }
    return mac.join("_");
  };

  const generateEmployeeId = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const connectDevice = (mac, employeeId) => {
    const key = `${mac}_${employeeId}`;
    if (stompClientsRef.current[key]) return;

    const client = new Client({
      brokerURL: "ws://192.168.1.52:8786/ws",
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    client.onConnect = () => {
      console.log(`Connected: ${key}`);

      client.publish({
        destination: "/app/connect",
        body: JSON.stringify({ mac, employeeId }),
      });

      const topic = `/topic/notifications/${mac}/${employeeId}`;
      client.subscribe(topic, (message) => {
        setMessageCounts((prev) => ({
          ...prev,
          [key]: prev[key] ? prev[key] + 1 : 1,
        }));
        console.log(`Message for ${topic}:`, message.body);
      });
    };

    client.activate();
    stompClientsRef.current[key] = client;

    setDevices((prev) => [...prev, { mac, employeeId }]);
  };

  const disconnectDevice = (mac, employeeId) => {
    const key = `${mac}_${employeeId}`;
    if (stompClientsRef.current[key]) {
      stompClientsRef.current[key].deactivate();
      delete stompClientsRef.current[key];
      console.log(`Disconnected: ${key}`);
    }
    setDevices((prev) =>
      prev.filter((d) => !(d.mac === mac && d.employeeId === employeeId))
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const mac = generateMac();
      const employeeId = generateEmployeeId();
      connectDevice(mac, employeeId);
    }, 2);

    return () => clearInterval(interval);
  }, []);

  const totalMessages = Object.values(messageCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const totalDevices = devices.length;

  return (
    <div className="p-4">
      <h1 className="flex justify-center items-center text-3xl my-4 uppercase text-violet-500 font-medium">
        Warehouse Devices
      </h1>

      <div className="mb-4 text-center text-lg font-semibold">
        Total Devices: {totalDevices}
      </div>

      <div className="mb-6 text-center text-lg font-semibold">
        Total Messages: {totalMessages}
      </div>

      {devices.map((device, index) => {
        const key = `${device.mac}_${device.employeeId}`;
        return (
          <div key={index} className="border p-4 mb-4 rounded">
            <div className="mb-2">
              <span className="font-semibold">MAC:</span> {device.mac} |{" "}
              <span className="font-semibold">Employee ID:</span>{" "}
              {device.employeeId}
            </div>
            <button
              onClick={() => disconnectDevice(device.mac, device.employeeId)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Disconnect
            </button>
            <div className="mt-2">
              Messages received: {messageCounts[key] || 0}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Warehouse;
