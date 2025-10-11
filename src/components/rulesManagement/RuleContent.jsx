import { WorkShiftTimeForm } from "./WorkShiftTimeForm";
import { HolidayForm } from "./HolidayForm";
import { WeekendForm } from "./WeekendForm";
import { LatenessForm } from "./LatenessForm";
import { LeaveForm } from "./LeaveForm";
import { DefaultForm } from "./DefaultForm";
import { EmptyState } from "./EmptyState";
import RuleHeader from "./RuleHeader";

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
      case "lateness":
        return <LatenessForm />;
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
