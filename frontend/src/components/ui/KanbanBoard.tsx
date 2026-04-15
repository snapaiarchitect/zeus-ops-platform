import { useState, useCallback } from 'react'
import { MoreHorizontal, Plus, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface KanbanItem {
  id: string
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assignee?: string
  dueDate?: string
  tags?: string[]
}

interface KanbanColumn {
  id: string
  title: string
  items: KanbanItem[]
  color?: string
}

interface KanbanBoardProps {
  columns: KanbanColumn[]
  onItemMove?: (itemId: string, fromColumn: string, toColumn: string) => void
  onItemClick?: (item: KanbanItem) => void
  onAddItem?: (columnId: string) => void
  className?: string
}

const priorityColors = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400',
}

export function KanbanBoard({
  columns,
  onItemMove,
  onItemClick,
  onAddItem,
  className,
}: KanbanBoardProps) {
  const [draggedItem, setDraggedItem] = useState<{ item: KanbanItem; fromColumn: string } | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const handleDragStart = (item: KanbanItem, columnId: string) => {
    setDraggedItem({ item, fromColumn: columnId })
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    if (draggedItem && draggedItem.fromColumn !== columnId) {
      onItemMove?.(draggedItem.item.id, draggedItem.fromColumn, columnId)
    }
    setDraggedItem(null)
    setDragOverColumn(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverColumn(null)
  }

  return (
    <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
      {columns.map((column) => (
        <div
          key={column.id}
          className={cn(
            'flex-shrink-0 w-80 rounded-lg border border-slate-700 bg-slate-800/30',
            dragOverColumn === column.id && 'ring-2 ring-cyan-500/50 bg-slate-800/50'
          )}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDrop={(e) => handleDrop(e, column.id)}
          onDragLeave={() => setDragOverColumn(null)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color || '#06b6d4' }}
              />
              <h3 className="font-semibold text-slate-200">{column.title}</h3>
              <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded-full">
                {column.items.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onAddItem?.(column.id)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Column Items */}
          <div className="p-3 space-y-3 min-h-[200px]">
            {column.items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item, column.id)}
                onDragEnd={handleDragEnd}
                onClick={() => onItemClick?.(item)}
                className={cn(
                  'p-4 rounded-md bg-slate-800 border border-slate-700 cursor-pointer',
                  'hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5',
                  'transition-all group',
                  draggedItem?.item.id === item.id && 'opacity-50'
                )}
              >
                {/* Drag Handle */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-slate-500" />
                  </div>
                  {item.priority && (
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded font-medium',
                        priorityColors[item.priority]
                      )}
                    >
                      {item.priority}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 className="font-medium text-slate-200 mb-1">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                    {item.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    {item.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {item.assignee && (
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs text-cyan-400">
                        {item.assignee.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>

                {item.dueDate && (
                  <div className="mt-2 text-xs text-slate-500">
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
