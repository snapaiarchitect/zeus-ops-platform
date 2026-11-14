import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  /** Column heading (`title` is accepted as an alias). */
  header?: React.ReactNode
  title?: React.ReactNode
  sortable?: boolean
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
  className?: string
  emptyMessage?: string
}

type SortDirection = 'asc' | 'desc' | null

export function DataTable<T extends object>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  className,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [filter, setFilter] = useState('')

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => {
        if (prev === 'asc') return 'desc'
        if (prev === 'desc') return null
        return 'asc'
      })
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data

    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortColumn] as string | number | null | undefined
      const bValue = (b as Record<string, unknown>)[sortColumn] as string | number | null | undefined

      if (aValue === bValue) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1

      const comparison = aValue < bValue ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortColumn, sortDirection])

  const filteredData = useMemo(() => {
    if (!filter) return sortedData
    
    return sortedData.filter(item =>
      columns.some(col => {
        const value = (item as Record<string, unknown>)[col.key]
        return String(value).toLowerCase().includes(filter.toLowerCase())
      })
    )
  }, [sortedData, filter, columns])

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return <ChevronsUpDown className="h-4 w-4 ml-1 text-slate-500" />
    if (sortDirection === 'asc') return <ChevronUp className="h-4 w-4 ml-1 text-cyan-500" />
    return <ChevronDown className="h-4 w-4 ml-1 text-cyan-500" />
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Filter..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-9 w-64 rounded-md border border-slate-700 bg-slate-800/50 px-3 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <span className="text-sm text-slate-400">
          {filteredData.length} of {data.length} items
        </span>
      </div>
      
      <div className="rounded-md border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-sm font-medium text-slate-200"
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center hover:text-cyan-400 transition-colors"
                    >
                      {column.header ?? column.title}
                      <SortIcon column={column.key} />
                    </button>
                  ) : (
                    (column.header ?? column.title)
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'bg-slate-900/50 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-slate-800/50'
                  )}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm text-slate-300">
                      {column.render
                        ? column.render(item)
                        : String((item as Record<string, unknown>)[column.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
