function macFirst6ToInt(mac) {
  const cleanMac = mac.replace(/[_:-]/g, "");
  const first6 = cleanMac.substring(0, 6);
  return parseInt(first6, 16);
}

function convertDeviceArray(devices) {
  return devices.map((device) => ({
    macInt: macFirst6ToInt(device.deviceMAC),
  }));
}
export default convertDeviceArray;
