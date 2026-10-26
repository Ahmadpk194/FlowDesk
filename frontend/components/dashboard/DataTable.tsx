'use client';

type Column = {
  header: string;
  accessor: string;
  className?: string;
};

type DataTableProps = {
  columns: Column[];
  data: any[];
  renderCell?: (col: Column, row: any) => React.ReactNode;
};

export default function DataTable({ columns, data, renderCell }: DataTableProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-[#F8FAFC] transition-colors duration-150">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 text-sm text-gray-900 ${col.className || ''}`}>
                    {renderCell ? renderCell(col, row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}