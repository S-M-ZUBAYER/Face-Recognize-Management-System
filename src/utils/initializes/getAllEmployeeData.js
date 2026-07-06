import { parseNormalData } from "@/lib/parseNormalData";
import parseAddress from "@/lib/parseAddress";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { useGlobalStore } from "@/zustand/useGlobalStore";

const parseEmployeePayPeriod = (payPeriod) => {
  if (payPeriod === null || payPeriod === undefined || payPeriod === "") {
    return {};
  }

  try {
    return parseNormalData(payPeriod);
  } catch (error) {
    console.warn("Failed to parse employee pay period:", error);
    return {};
  }
};

const normalizeEmployeeResponse = (data) => {
  const rows = Array.isArray(data) ? data : data?.data;

  if (Array.isArray(rows)) {
    return rows.flatMap((item) => {
      if (Array.isArray(item?.employees)) {
        return item.employees.map((employee) => ({
          ...employee,
          deviceMAC: employee.deviceMAC || item.deviceMAC,
        }));
      }

      if (Array.isArray(item?.data)) {
        return item.data.map((employee) => ({
          ...employee,
          deviceMAC: employee.deviceMAC || item.deviceMAC,
        }));
      }

      return item ? [item] : [];
    });
  }

  if (data && typeof data === "object") {
    return Object.entries(data).flatMap(([deviceMAC, employees]) =>
      Array.isArray(employees)
        ? employees.map((employee) => ({
            ...employee,
            deviceMAC: employee.deviceMAC || deviceMAC,
          }))
        : [],
    );
  }

  return [];
};

export const getAllEmployeeData = async () => {
  const setGlobalRules = useGlobalStore.getState().setGlobalRules;
  const setPayPeriodData = useGlobalStore.getState().setPayPeriodData;
  try {
    const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs"));

    // Fetch pay period data
    const payPeriodData = [];

    for (const device of deviceMACs) {
      try {
        const res = await apiClient.get(
          getApiUrl(`/payPeriod/check/${device.deviceMAC}`),
        );

        payPeriodData.push({
          deviceMAC: device.deviceMAC,
          payPeriod: parseNormalData(res.data.payPeriod),
        });
      } catch (error) {
        console.error(
          `Failed to fetch employees for ${device.deviceMAC}:`,
          error,
        );
        payPeriodData.push([]);
      }
    }

    setPayPeriodData(payPeriodData);

    // Fetch global salary rules
    const globalSalaryRules = [];

    for (const device of deviceMACs) {
      try {
        const res = await apiClient.get(
          getApiUrl(`/salaryRules/check/${device.deviceMAC}`),
        );

        const parsedSalaryRules = parseNormalData(res.data.salaryRules);

        globalSalaryRules.push({
          deviceMAC: device.deviceMAC,
          salaryRules: parsedSalaryRules,
        });
      } catch (error) {
        console.error(
          `Failed to fetch employees for ${device.deviceMAC}:`,
          error,
        );
        globalSalaryRules.push([]);
      }
    }

    setGlobalRules(globalSalaryRules);
    // Fetch employees for all devices in one request
    const employees = [];
    const deviceMacArray = deviceMACs.map((device) => device.deviceMAC);
    // console.log(deviceMacArray);

    try {
      const res = await apiClient.post(
        getApiUrl("/employee/all/web"),
        deviceMacArray,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const employeeRows = normalizeEmployeeResponse(res.data);

      for (const emp of employeeRows) {
        const [email, companyEmployeeId] = String(emp.email || "").split("|");
        const imageFile = emp.image || emp.imageFile;

        employees.push({
          name: emp.name,
          employeeId: emp.employeeId,
          companyEmployeeId,
          department: emp.department,
          email,
          image: imageFile ? getApiUrl(`/media/${imageFile}`) : "",
          designation: emp.designation,
          deviceMAC: emp.deviceMAC,
          address: parseAddress(emp.address),
          contactNumber: emp.contactNumber,
          joiningDate: emp.startDate,
          salaryRules: emp.salaryRules,
          salaryInfo: parseEmployeePayPeriod(emp.payPeriod),
        });
      }
    } catch (error) {
      console.error("Failed to fetch employees for devices:", error);
    }

    // Helper functions (same as your existing logic)
    const getPayInfoByDevice = (mac) => {
      if (!payPeriodData || !globalSalaryRules) {
        return { PayPeriod: {}, SalaryRules: {} };
      }

      const found = payPeriodData.find((d) => d.deviceMAC === mac);
      const Rule = globalSalaryRules.find((rule) => rule.deviceMAC === mac);

      return {
        PayPeriod: found?.payPeriod || {},
        SalaryRules: Rule?.salaryRules || {},
      };
    };

    const isInvalidSalaryInfo = (salaryInfo) => {
      return (
        salaryInfo === 999 ||
        salaryInfo === "999" ||
        salaryInfo === null ||
        salaryInfo === undefined ||
        (typeof salaryInfo === "object" && Object.keys(salaryInfo).length === 0)
      );
    };

    const isInvalidSalaryRules = (salaryRules) => {
      return (
        salaryRules === 999 ||
        salaryRules === "999" ||
        salaryRules === null ||
        salaryRules === undefined ||
        (salaryRules?.rules &&
          (!Array.isArray(salaryRules.rules) || salaryRules.rules.length === 0))
      );
    };

    // Process employees (same as your existing logic)
    const processedEmployees = [];

    for (const emp of employees) {
      let payPeriod, salaryRules;

      const hasInvalidSalaryInfo = isInvalidSalaryInfo(emp.salaryInfo);
      const hasInvalidSalaryRules = isInvalidSalaryRules(emp.salaryRules);

      if (hasInvalidSalaryInfo || hasInvalidSalaryRules) {
        const { SalaryRules, PayPeriod } = getPayInfoByDevice(emp.deviceMAC);

        payPeriod =
          hasInvalidSalaryInfo && !isInvalidSalaryInfo(PayPeriod)
            ? PayPeriod
            : emp.salaryInfo;
        salaryRules =
          hasInvalidSalaryRules && !isInvalidSalaryRules(SalaryRules)
            ? SalaryRules
            : emp.salaryRules;

        if (hasInvalidSalaryInfo && isInvalidSalaryInfo(payPeriod)) {
          payPeriod = {};
        }
        if (hasInvalidSalaryRules && isInvalidSalaryRules(salaryRules)) {
          salaryRules = {};
        }
      } else {
        payPeriod = emp.salaryInfo;
        salaryRules = emp.salaryRules;
      }

      let parsedSalaryRules;
      let parsedPayPeriod;
      try {
        parsedSalaryRules = parseNormalData(salaryRules);
        parsedPayPeriod = parseNormalData(payPeriod);
      } catch (error) {
        console.warn(
          `Error parsing salary rules for employee ${emp.employeeId}:`,
          error,
        );
        parsedSalaryRules = {};
        parsedPayPeriod = {};
      }

      processedEmployees.push({
        ...emp,
        salaryInfo: parsedPayPeriod,
        salaryRules: parsedSalaryRules,
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const employeeCounts = [];

    for (const mac of deviceMACs) {
      let count = 0;
      let resignCount = 0;

      for (const item of processedEmployees) {
        if (item.deviceMAC !== mac.deviceMAC) continue;

        if (
          item.address?.type !== "resigned" ||
          item.address?.r_date >= today
        ) {
          count++;
        }

        if (item.address?.type === "resigned" && item.address?.r_date < today) {
          resignCount++;
        }
      }

      employeeCounts.push({
        deviceMAC: mac.deviceMAC,
        count,
        resignCount,
      });
    }

    // console.log(employeeCounts);

    // Store in Zustand
    const { setEmployeesArray, setEmployeeCount, setDeviceCount } =
      useEmployeeStore.getState();
    setEmployeesArray(processedEmployees);
    setEmployeeCount(employeeCounts);
    setDeviceCount(deviceMACs.length);

    // return {
    //   success: true,
    //   employeeCount: processedEmployees.length,
    //   deviceCount: deviceMACs.length
    // };
  } catch (error) {
    console.error("Failed to initialize employee store:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
