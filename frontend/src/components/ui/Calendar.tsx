import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  color?: string
}

interface CalendarProps {
  events?: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  onAddEvent?: (date: Date) => void
  className?: string
}

export function Calendar({
  events = [],
  onEventClick,
  onDateClick,
  onAddEvent,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = useMemo(() => {
    const daysArray = []
    let day = calendarStart
    while (day <= calendarEnd) {
      daysArray.push(day)
      day = addDays(day, 1)
    }
    return daysArray
  }, [calendarStart, calendarEnd])

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.start, date))
  }

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const handleToday = () => setCurrentMonth(new Date())

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateClick?.(date)
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className={cn('bg-slate-900 rounded-lg border border-slate-700', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-50">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleToday}>
          Today
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 border-b border-slate-700">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isToday = isSameDay(day, new Date())

          return (
            <div
              key={idx}
              onClick={() => handleDateClick(day)}
              className={cn(
                'min-h-[100px] p-2 border-b border-r border-slate-700/50 cursor-pointer transition-colors',
                !isCurrentMonth && 'bg-slate-900/30 text-slate-600',
                isCurrentMonth && 'bg-slate-800/20 hover:bg-slate-800/40',
                isSelected && 'bg-cyan-500/10 ring-1 ring-cyan-500/50',
                'relative group'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isToday
                      ? 'bg-cyan-500 text-slate-950 w-7 h-7 rounded-full flex items-center justify-center'
                      : isCurrentMonth
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {isCurrentMonth && onAddEvent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddEvent(day)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-all"
                  >
                    <Plus className="h-3 w-3 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick?.(event)
                    }}
                    className={cn(
                      'text-xs px-2 py-1 rounded truncate cursor-pointer transition-colors',
                      event.color || 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                    )}
                    style={event.color ? {
                      backgroundColor: `${event.color}30`,
                      color: event.color,
                    } : undefined}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-slate-500 px-2">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
