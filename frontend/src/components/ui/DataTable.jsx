import { useEffect, useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  FaSearch, FaChevronUp, FaChevronDown,
  FaChevronLeft, FaChevronRight, FaTrash,
} from 'react-icons/fa'
import { ConfirmDialog } from './ConfirmDialog'

/* Checkbox that supports the native indeterminate state */
function IndeterminateCheckbox({ indeterminate, className = '', ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate ?? false
  }, [indeterminate])
  return (
    <input
      ref={ref}
      type="checkbox"
      className={`h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 accent-emerald-600 ${className}`}
      {...rest}
    />
  )
}

/* Checkbox column definition — injected when onDeleteSelected is provided */
const buildCheckboxColumn = () => ({
  id: '__select',
  enableSorting: false,
  header: ({ table }) => (
    <IndeterminateCheckbox
      checked={table.getIsAllPageRowsSelected()}
      indeterminate={table.getIsSomePageRowsSelected()}
      onChange={table.getToggleAllPageRowsSelectedHandler()}
    />
  ),
  cell: ({ row }) => (
    <IndeterminateCheckbox
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      onChange={row.getToggleSelectedHandler()}
      onClick={(e) => e.stopPropagation()}
    />
  ),
})

export function DataTable({
  columns,
  data,
  searchPlaceholder = 'Search…',
  pageSize = 10,
  onRowClick,
  onDeleteSelected,
}) {
  const [globalFilter,  setGlobalFilter]  = useState('')
  const [sorting,       setSorting]       = useState([])
  const [pagination,    setPagination]    = useState({ pageIndex: 0, pageSize })
  const [rowSelection,  setRowSelection]  = useState({})
  const [confirmOpen,   setConfirmOpen]   = useState(false)
  const [isDeleting,    setIsDeleting]    = useState(false)

  const allColumns = onDeleteSelected
    ? [buildCheckboxColumn(), ...columns]
    : columns

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { globalFilter, sorting, pagination, rowSelection },
    onGlobalFilterChange:  setGlobalFilter,
    onSortingChange:       setSorting,
    onPaginationChange:    setPagination,
    onRowSelectionChange:  setRowSelection,
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection:    !!onDeleteSelected,
    getRowId:              (row) => String(row.id ?? row.title ?? row.email),
    globalFilterFn:        'includesString',
  })

  const selectedRows  = table.getSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const handleDeleteConfirm = async () => {
    if (!onDeleteSelected) return
    setIsDeleting(true)
    try {
      await onDeleteSelected(selectedRows.map((r) => r.original))
      setRowSelection({})
    } finally {
      setIsDeleting(false)
      setConfirmOpen(false)
    }
  }

  const { pageIndex, pageSize: currentPageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const firstRow  = pageIndex * currentPageSize + 1
  const lastRow   = Math.min((pageIndex + 1) * currentPageSize, totalRows)

  return (
    <>
      <div className="rounded-[32px] bg-white shadow-md overflow-hidden">

        {/* ── Bulk action bar ── */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 bg-emerald-50 border-b border-emerald-100">
            <span className="text-sm font-medium text-emerald-800">
              {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRowSelection({})}
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
              >
                <FaTrash className="text-[10px]" />
                Delete {selectedCount} selected
              </button>
            </div>
          </div>
        )}

        {/* ── Search bar ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <label
            htmlFor="dt-search"
            className="flex items-center gap-2 flex-1 max-w-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 h-9 cursor-text hover:border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
          >
            <FaSearch className="text-slate-400 text-xs shrink-0" />
            <input
              id="dt-search"
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
          {globalFilter && (
            <button
              type="button"
              onClick={() => setGlobalFilter('')}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#13462D] text-sm font-semibold text-white">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    const sorted  = header.column.getIsSorted()
                    const isCheckbox = header.column.id === '__select'
                    return (
                      <th
                        key={header.id}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        className={[
                          'px-5 py-4 whitespace-nowrap select-none first:rounded-tl-2xl last:rounded-tr-2xl',
                          isCheckbox ? 'w-10' : '',
                          canSort ? 'cursor-pointer hover:bg-[#0f3a26] transition-colors' : '',
                        ].join(' ')}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="flex flex-col gap-[1px] opacity-60">
                              <FaChevronUp   size={8} className={sorted === 'asc'  ? 'opacity-100 text-emerald-300' : ''} />
                              <FaChevronDown size={8} className={sorted === 'desc' ? 'opacity-100 text-emerald-300' : ''} />
                            </span>
                          )}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={allColumns.length}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    {globalFilter ? `No results for "${globalFilter}"` : 'No data available.'}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={[
                      'border-b border-[#e3ece6] text-sm text-slate-700 transition hover:bg-[#f6fbf8]',
                      onRowClick ? 'cursor-pointer' : '',
                      row.getIsSelected() ? 'bg-emerald-50/60' : '',
                    ].join(' ')}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const stopClick = cell.column.id === 'actions' || cell.column.id === '__select'
                      return (
                        <td
                          key={cell.id}
                          className="px-5 py-4"
                          onClick={stopClick ? (e) => e.stopPropagation() : undefined}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalRows > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 text-sm text-slate-500">
            <span>
              {totalRows === 0 ? 'No results' : `Showing ${firstRow}–${lastRow} of ${totalRows}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaChevronLeft size={11} />
              </button>
              {Array.from({ length: table.getPageCount() }, (_, i) => i).map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => table.setPageIndex(i)}
                  className={[
                    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition',
                    pageIndex === i
                      ? 'bg-[#13462D] text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaChevronRight size={11} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => !isDeleting && setConfirmOpen(o)}
        title={`Delete ${selectedCount} ${selectedCount === 1 ? 'item' : 'items'}?`}
        description="This action cannot be undone. All selected records will be permanently removed."
        confirmLabel={isDeleting ? 'Deleting…' : `Delete ${selectedCount}`}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
