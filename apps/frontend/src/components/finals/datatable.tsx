import { type ColumnDef, flexRender, type Table as TableType } from "@tanstack/react-table"

interface DataTableProps<TData, TValue> {
  table: TableType<TData>
  columns: ColumnDef<TData, TValue>[]
}

function DataTable<TData, TValue>({table, columns}: DataTableProps<TData, TValue>) {
    return (
    <div className="w-full min-w-0 overflow-x-auto">
      <table className="w-full min-w-fit table-auto">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                if (header.isPlaceholder) {
                  return <th key={header.id} />;
                }

                const canSort = header.column.getCanSort();
                const sorting = header.column.getIsSorted();
                const sortIndicator =
                  sorting === "asc" ? " ⏶" : sorting === "desc" ? " ⏷" : null;

                return (
                  <th
                    key={header.id}
                    className={`whitespace-nowrap px-2 text-left text-sm font-semibold text-gray-700 ${canSort ? "cursor-pointer select-none" : ""}`}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {sortIndicator}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-white">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="whitespace-nowrap px-2 text-sm text-gray-600"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-2 py-6 text-center text-sm text-gray-500">
                No results.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    )
}

export default DataTable
