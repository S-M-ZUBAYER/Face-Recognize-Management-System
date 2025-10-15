import { useState } from "react";

export const LateArrivalFine5 = () => {
  const [incrementalAmount, setIncrementalAmount] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-800 mb-3"></h3>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600">Incremental Value </p>
            <input
              type="number"
              value={incrementalAmount}
              onChange={(e) => setIncrementalAmount(e.target.value)}
              placeholder="Increment per late"
              className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <p className="text-sm text-gray-700 mb-3">
          The rule is that if you are late more than once, your fine will
          increase continuously.
        </p>

        <h4 className="text-sm font-semibold text-gray-900 mb-2">Example :</h4>
        <p className="text-sm text-gray-700">
          If the incremental amount is set at 50, then the first time he is
          late, his fine will be 50. But if he is late 4 times in that month,
          then his fine will increase continuously. First day = 50, second day =
          100, third day = 150, fourth day = 200 Then his total fine is 50 + 100
          + 150 + 200 = 500
        </p>
      </div>

      <hr className="border-gray-200" />

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
