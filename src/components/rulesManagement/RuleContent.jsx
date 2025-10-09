import { WorkShiftTimeForm } from "./WorkShiftTimeForm";
import { HolidayForm } from "./HolidayForm";
import { WeekendForm } from "./WeekendForm";
import { LatenessForm } from "./LatenessForm";
import { LeaveForm } from "./LeaveForm";
import { DefaultForm } from "./DefaultForm";
import { EmptyState } from "./EmptyState";

export const RuleContent = ({ selectedRule, onBack }) => {
  if (!selectedRule) {
    return <EmptyState />;
  }

  const renderForm = () => {
    switch (selectedRule.component) {
      case "workShift":
        return <WorkShiftTimeForm onBack={onBack} />;
      case "holiday":
        return <HolidayForm onBack={onBack} />;
      case "weekend":
        return <WeekendForm onBack={onBack} />;
      case "lateness":
        return <LatenessForm onBack={onBack} />;
      case "leave":
        return <LeaveForm onBack={onBack} />;
      default:
        return <DefaultForm title={selectedRule.title} onBack={onBack} />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 overflow-y-auto flex-1 h-[80vh] justify-center items-center ">
      {renderForm()}
    </div>
  );
};
