import { parseNormalData } from "@/lib/parseNormalData";
import parseAddress from "@/lib/parseAddress";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { useGlobalStore } from "@/zustand/useGlobalStore";

export const getAllEmployeeData = async () => {
  const setGlobalRules = useGlobalStore.getState().setGlobalRules;
  const setPayPeriodData = useGlobalStore.getState().setPayPeriodData;
  try {
    const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs"));

    // Fetch pay period data
    const payPeriodResponse = deviceMACs.map(async (device) => {
      try {
        const res = await apiClient.get(
          getApiUrl(`/payPeriod/check/${device.deviceMAC}`)
        );

        return {
          deviceMAC: device.deviceMAC,
          payPeriod: JSON.parse(res.data.payPeriod),
        };
      } catch (error) {
        console.error(
          `Failed to fetch employees for ${device.deviceMAC}:`,
          error
        );
        return [];
      }
    });
    const payPeriodData = await Promise.all(payPeriodResponse);
    setPayPeriodData(payPeriodData);

    // Fetch global salary rules
    const salaryRulesResponse = deviceMACs.map(async (device) => {
      try {
        const res = await apiClient.get(
          getApiUrl(`/salaryRules/check/${device.deviceMAC}`)
        );

        const parsedSalaryRules = parseNormalData(res.data.salaryRules);

        return {
          deviceMAC: device.deviceMAC,
          salaryRules: parsedSalaryRules,
        };
      } catch (error) {
        console.error(
          `Failed to fetch employees for ${device.deviceMAC}:`,
          error
        );
        return [];
      }
    });
    const globalSalaryRules = await Promise.all(salaryRulesResponse);
    setGlobalRules(globalSalaryRules);
    // Fetch employees for each device
    const employeePromises = deviceMACs.map(async (device) => {
      try {
        const res = await apiClient.get(
          getApiUrl(`/employee/all/${device.deviceMAC}`)
        );

        return res.data.map((emp) => ({
          name: emp.name,
          employeeId: emp.employeeId,
          companyEmployeeId: emp.email?.split("|")[1],
          department: emp.department,
          email: emp.email?.split("|")[0],
          image: getApiUrl(`/media/${emp.imageFile}`),
          designation: emp.designation,
          deviceMAC: device.deviceMAC,
          address: parseAddress(emp.address),
          contactNumber: emp.contactNumber,
          salaryRules: emp.salaryRules,
          salaryInfo: JSON.parse(emp.payPeriod || "{}"),
        }));
      } catch (error) {
        console.error(
          `Failed to fetch employees for ${device.deviceMAC}:`,
          error
        );
        return [];
      }
    });

    const employeesArrays = await Promise.all(employeePromises);
    const employees = employeesArrays.flat();

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
    const processedEmployees = employees.map((emp) => {
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
          error
        );
        parsedSalaryRules = {};
        parsedPayPeriod = {};
      }

      return {
        ...emp,
        salaryInfo: parsedPayPeriod,
        salaryRules: parsedSalaryRules,
      };
    });

    const employeeCounts = deviceMACs.map((mac) => ({
      deviceMAC: mac.deviceMAC,
      count: processedEmployees.filter(
        (item) => item.deviceMAC === mac.deviceMAC
      ).length,
    }));

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
