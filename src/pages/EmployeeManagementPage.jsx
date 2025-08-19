import EmployeeManagementTable from "@/components/employeeManagement/EmployeeManagementTable";
import React from "react";

const employees = [
  {
    id: "TG0642",
    name: "Md Golam Rabbani Pias",
    designation: "Product Designer",
    department: "Software Development",
    workHour: "8 Hours",
    overtime: "No",
  },
  {
    id: "TG0643",
    name: "Priya Sharma",
    designation: "Frontend Developer",
    department: "Software Development",
    workHour: "8 Hours",
    overtime: "Yes",
  },
  {
    id: "TG0644",
    name: "John Smith",
    designation: "QA Engineer",
    department: "Quality Assurance",
    workHour: "8 Hours",
    overtime: "No",
  },
  {
    id: "TG0645",
    name: "Chen Wei",
    designation: "Lead Backend Engineer",
    department: "Software Development",
    workHour: "9 Hours",
    overtime: "No",
  },
  {
    id: "TG0646",
    name: "Anja Schmidt",
    designation: "UX/UI Designer",
    department: "Design",
    workHour: "8 Hours",
    overtime: "Yes",
  },
  {
    id: "TG0647",
    name: "Fatima Al-Sayed",
    designation: "Project Manager",
    department: "Project Management",
    workHour: "8 Hours",
    overtime: "No",
  },
  {
    id: "TG0648",
    name: "Carlos Rodriguez",
    designation: "Data Scientist",
    department: "Data & Analytics",
    workHour: "8 Hours",
    overtime: "Yes",
  },
  {
    id: "TG0649",
    name: "Adebayo Adekunle",
    designation: "Cybersecurity Analyst",
    department: "IT & Security",
    workHour: "8 Hours",
    overtime: "No",
  },
  {
    id: "TG0650",
    name: "Kenji Tanaka",
    designation: "DevOps Engineer",
    department: "IT & Operations",
    workHour: "8 Hours",
    overtime: "Yes",
  },
  {
    id: "TG0651",
    name: "Olga Petrova",
    designation: "Content Strategist",
    department: "Marketing",
    workHour: "8 Hours",
    overtime: "No",
  },
  {
    id: "TG0652",
    name: "Marco Rossi",
    designation: "Business Analyst",
    department: "Business Development",
    workHour: "9 Hours",
    overtime: "Yes",
  },
  {
    id: "TG0653",
    name: "Lee Ji-Eun",
    designation: "Mobile Developer (iOS)",
    department: "Software Development",
    workHour: "8 Hours",
    overtime: "No",
  },
  {
    id: "TG0654",
    name: "Amélie Dubois",
    designation: "Cloud Architect",
    department: "IT & Operations",
    workHour: "8 Hours",
    overtime: "Yes",
  },
];

function EmployeeManagementPage() {
  return (
    <>
      <EmployeeManagementTable employees={employees} />
    </>
  );
}

export default EmployeeManagementPage;
