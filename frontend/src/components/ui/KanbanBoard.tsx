import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface KanbanColumn<T> {
  id: string
  title: string
  items: T[]
  color?: string
}

interface KanbanBoardProps<T extends { id: string }> {
  columns: KanbanColumn<T>[]
  /** Render the card body for an item. */
  renderItem: (item: T) => ReactNode
  /** Called when a card is dropped into a different column. */
  onMoveItem?: (itemId: string, toColumn: string, fromColumn: string) => void
  onItemClick?: (item: T) => void
  className?: string
}

export function KanbanBoard<T extends { id: string }>({
  columns,
  renderItem,
  onMoveItem,
  onItemClick,
  className,
}: KanbanBoardProps<T>) {
  const [dragged, setDragged] = useState<{ id: string; from: string } | null>(null)
  const [overColumn, setOverColumn] = useState<string | null>(null)

  const finishDrag = () => {
    setDragged(null)
    setOverColumn(null)
  }

  return (
    <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
      {columns.map((column) => (
        <div
          key={column.id}
          data-testid={`kanban-column-${column.id}`}
          className={cn(
            'flex-shrink-0 w-72 rounded-lg border border-slate-700 bg-slate-800/30',
            overColumn === column.id && 'ring-2 ring-cyan-500/50 bg-slate-800/50'
          )}
          onDragOver={(e) => {
            e.preventDefault()
            setOverColumn(column.id)
          }}
          onDragLeave={() => setOverColumn(null)}
          onDrop={(e) => {
            e.preventDefault()
            if (dragged && dragged.from !== column.id) onMoveItem?.(dragged.id, column.id, dragged.from)
            finishDrag()
          }}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color || '#06b6d4' }} />
              <h3 className="font-semibold text-slate-200 text-sm">{column.title}</h3>
            </div>
            <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">{column.items.length}</span>
          </div>

          <div className="p-3 space-y-3 min-h-[160px]">
            {column.items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragged({ id: item.id, from: column.id })}
                onDragEnd={finishDrag}
                onClick={() => onItemClick?.(item)}
                className={cn('cursor-grab active:cursor-grabbing', dragged?.id === item.id && 'opacity-50')}
              >
                {renderItem(item)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
