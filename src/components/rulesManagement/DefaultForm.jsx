import RuleHeader from "./RuleHeader";

export const DefaultForm = ({ title, onBack }) => {
  return (
    <div className="space-y-6">
      <RuleHeader title={title} onBack={onBack} />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Configuration for "{title}" will be available here.
        </p>
      </div>

      <button className="w-full py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
