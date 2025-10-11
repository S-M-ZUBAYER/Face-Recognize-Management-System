export const LeaveForm = () => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-3">
          Annual Leave Days
        </label>
        <input
          type="number"
          placeholder="20"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-3">
          Sick Leave Days
        </label>
        <input
          type="number"
          placeholder="10"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 text-teal-600" />
          <span className="text-sm">Require approval for leave</span>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 text-teal-600" />
          <span className="text-sm">Carry forward unused leave</span>
        </label>
      </div>

      <button className="w-full py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
