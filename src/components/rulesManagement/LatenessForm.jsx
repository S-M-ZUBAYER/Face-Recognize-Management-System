export const LatenessForm = () => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-3">
          Grace Period (minutes)
        </label>
        <input
          type="number"
          placeholder="0"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-3">
          Warning After (occurrences)
        </label>
        <input
          type="number"
          placeholder="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-3">Penalty Type</label>
        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
          <option>Warning only</option>
          <option>Salary deduction</option>
          <option>Written warning</option>
        </select>
      </div>

      <button className="w-full py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
