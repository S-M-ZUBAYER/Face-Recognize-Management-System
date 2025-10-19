import React from "react";

const ExcelFormatExample = () => {
  return (
    <div className="bg-gray-100 rounded-xl  border border-gray-200 mx-4 p-4">
      <h3 className="font-semibold text-sm  mb-3">Excel Format Example:</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-300 text-gray-800 font-semibold">
              <th className="p-2 border border-gray-400 text-left w-1/3">
                Type
              </th>
              <th className="p-2 border border-gray-400 text-left w-1/3">
                Start
              </th>
              <th className="p-2 border border-gray-400 text-left w-1/3">
                End
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border border-gray-300">working</td>
              <td className="p-2 border border-gray-300">09:00</td>
              <td className="p-2 border border-gray-300">12:00</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-2 border border-gray-300">working</td>
              <td className="p-2 border border-gray-300">13:00</td>
              <td className="p-2 border border-gray-300">17:00</td>
            </tr>
            <tr>
              <td className="p-2 border border-gray-300">overtime</td>
              <td className="p-2 border border-gray-300">17:30</td>
              <td className="p-2 border border-gray-300">20:00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelFormatExample;
