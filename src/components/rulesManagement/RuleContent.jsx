import { WorkShiftTimeForm } from "./WorkShiftTimeForm";
import { HolidayForm } from "./HolidayForm";
import { WeekendForm } from "./WeekendForm";
import { LatenessForm } from "./LatenessForm";
import { LeaveForm } from "./LeaveForm";
import { DefaultForm } from "./DefaultForm";
import { EmptyState } from "./EmptyState";
import RuleHeader from "./RuleHeader";
import { WorkOnHoliday } from "./WorkOnHoliday";
import { FlexibleWork } from "./FlexibleWork";
import { UseOverTimeLateness } from "./UseOverTimeLateness";
import { OvertImeCount } from "./OvertimeCount";
import { WeekendOvertime } from "./WeekendOvertime";
import { HolidayOvertime } from "./HolidayOvertime";

export const RuleContent = ({ selectedRule, onBack }) => {
  if (!selectedRule) {
    return <EmptyState />;
  }

  const renderForm = () => {
    switch (selectedRule.component) {
      case "workShift":
        return <WorkShiftTimeForm />;
      case "holiday":
        return <HolidayForm />;
      case "weekend":
        return <WeekendForm />;
      case "workOnHoliday":
        return <WorkOnHoliday />;
      case "lateness":
        return <LatenessForm />;
      case "flexible":
        return <FlexibleWork />;
      case "overtimeOffset":
        return <UseOverTimeLateness />;
      case "overtimeCount":
        return <OvertImeCount />;
      case "weekendOvertime":
        return <WeekendOvertime />;
      case "holidayOvertime":
        return <HolidayOvertime />;
      case "leave":
        return <LeaveForm />;
      default:
        return <DefaultForm />;
    }
  };

  return (
    <div className="border  border-gray-200 rounded-xl  py-2.5  w-[70%]">
      <RuleHeader title={selectedRule.title} onBack={onBack} />
      <div className="overflow-y-auto custom-scrollbar flex-1 h-[70vh] justify-center items-center px-8 ">
        {renderForm()}
      </div>
    </div>
  );
};
