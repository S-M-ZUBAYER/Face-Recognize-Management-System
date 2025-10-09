import { ArrowLeft } from "lucide-react";

const RuleHeader = ({ title, onBack }) => {
  return (
    <div className="flex items-center gap-3 mb-8">
      <button
        onClick={onBack}
        className=" hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
};

export default RuleHeader;
