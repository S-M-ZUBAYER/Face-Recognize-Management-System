import { useDeviceMACs } from "./useDeviceMACs";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import isEqual from "lodash.isequal";
import { setAttendanceArray } from "@/utils/attendance/attendanceDataCache";

let cachedAttendance = [];
let cachedDeviceKey = "";
let hasCachedAttendance = false;
let pendingAttendanceRequest = null;

const getDeviceKey = (deviceMACs) =>
  deviceMACs
    .map((mac) => mac.deviceMAC)
    .filter(Boolean)
    .sort()
    .join("|");

const fetchAttendanceForDevice = async (deviceMAC) => {
  try {
    const res = await apiClient.get(getApiUrl("/attendance/attendance-by-device"), {
      params: { deviceId: deviceMAC },
    });

    return { data: res.data || [], hasError: false };
  } catch (error) {
    console.error(
      `❌ Failed to fetch attendance data for device ${deviceMAC}:`,
      error,
    );

    return { data: [], hasError: true };
  }
};

const fetchAttendanceForDevices = async (deviceMACs, { force = false } = {}) => {
  const deviceKey = getDeviceKey(deviceMACs);

  if (!force && hasCachedAttendance && cachedDeviceKey === deviceKey) {
    return { data: cachedAttendance, hasError: false };
  }

  if (
    !force &&
    pendingAttendanceRequest &&
    pendingAttendanceRequest.deviceKey === deviceKey
  ) {
    return pendingAttendanceRequest.promise;
  }

  const promise = Promise.all(
    deviceMACs.map((mac) => fetchAttendanceForDevice(mac.deviceMAC)),
  ).then((results) => {
    const data = results.flatMap((result) => result.data);
    const hasError = results.some((result) => result.hasError);

    cachedDeviceKey = deviceKey;
    cachedAttendance = data;
    hasCachedAttendance = true;

    return { data, hasError };
  });

  pendingAttendanceRequest = { deviceKey, promise };

  try {
    return await promise;
  } finally {
    if (pendingAttendanceRequest?.promise === promise) {
      pendingAttendanceRequest = null;
    }
  }
};

export const useAttendanceData = () => {
  const { deviceMACs, isLoading: macsLoading } = useDeviceMACs();
  const deviceKey = useMemo(() => getDeviceKey(deviceMACs), [deviceMACs]);
  const [Attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const prevRef = useRef([]);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadAttendance = useCallback(
    async ({ force = false } = {}) => {
      if (macsLoading) return [];

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      if (deviceMACs.length === 0) {
        cachedAttendance = [];
        cachedDeviceKey = "";
        hasCachedAttendance = false;

        if (mountedRef.current) {
          setAttendance([]);
          setIsError(false);
          setIsLoading(false);
          setIsFetching(false);
        }

        return [];
      }

      if (mountedRef.current) {
        const hasMatchingCache =
          !force && hasCachedAttendance && cachedDeviceKey === deviceKey;

        setIsFetching(true);
        setIsLoading(!hasMatchingCache);
      }

      const { data, hasError } = await fetchAttendanceForDevices(deviceMACs, {
        force,
      });

      if (mountedRef.current && requestIdRef.current === requestId) {
        setAttendance(data);
        setIsError(hasError);
        setIsFetching(false);
        setIsLoading(false);
      }

      return data;
    },
    [deviceKey, deviceMACs, macsLoading],
  );

  useEffect(() => {
    if (macsLoading) {
      setIsLoading(true);
      return;
    }

    loadAttendance();
  }, [deviceKey, loadAttendance, macsLoading]);

  // Keep latest raw attendance available to normal salary utilities.
  useEffect(() => {
    // avoid unnecessary updates
    if (!isEqual(prevRef.current, Attendance)) {
      prevRef.current = Attendance;
      setAttendanceArray(Attendance);
    }
  }, [Attendance]);

  const refresh = useCallback(
    () => loadAttendance({ force: true }),
    [loadAttendance],
  );

  return {
    Attendance,
    isLoading: isLoading || macsLoading,
    isError,
    isFetching,
    refresh,
    refetch: refresh,
  };
};
