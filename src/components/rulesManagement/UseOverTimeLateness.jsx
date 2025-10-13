export const UseOverTimeLateness = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-3.5 items-center justify-between">
        <label>Late Time </label>
        <input
          type="number"
          placeholder="Enter Time (Minutes)"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex gap-3.5 items-center justify-between">
        <label>Cost Over Time </label>
        <input
          type="number"
          placeholder="Enter Cost Over Time Minutes"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Details</h3>
        <div className="space-y-3.5">
          <p className="text-sm font-semibold">
            Replace lateness time with overtime
          </p>
          <p className="text-sm text-gray-500">
            <strong className="text-sm font-semibold mb-2">Example: </strong>
            The rule is to replace lateness first with holiday overtime,if not
            available then with weekend overtime.For example,if lateness is set
            to 1 minute and overtime replacement is also 1 minute,and the start
            time is 08:00,arriving at 08:10 means 10 minutes of lateness, and if
            there are 120 minutes of holiday overtime,it will be reduced to 110
            minutes.
          </p>
        </div>
      </div>

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
