import { useState, useEffect } from 'react'
import { bookingsService } from '@/services/bookings.service'
import { leadsService } from '@/services/leads.service'
import type { Lead } from '@/types/crm'
import type { Booking, BookingStatus, BookingEventType } from '@/types/booking'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Calendar } from '@/components/ui/Calendar'
import { 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter
} from 'lucide-react'

const EVENT_TYPES = [
  { id: 'discovery', label: 'Discovery Call', duration: 30, color: 'cyan' },
  { id: 'strategy', label: 'Strategy Session', duration: 60, color: 'purple' },
  { id: 'demo', label: 'Product Demo', duration: 45, color: 'blue' },
  { id: 'consultation', label: 'Consultation', duration: 30, color: 'green' },
  { id: 'check_in', label: 'Check-in', duration: 15, color: 'yellow' }
]

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: CalendarIcon },
  completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
  no_show: { label: 'No Show', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: AlertCircle }
}

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [formError, setFormError] = useState('')
  const [newBooking, setNewBooking] = useState({ leadId: '', eventType: 'discovery' as BookingEventType, scheduledAt: '', duration: 30, notes: '' })

  useEffect(() => {
    loadBookings()
  }, [filterStatus])

  const loadBookings = async () => {
    try {
      const data = await bookingsService.getAll(filterStatus ? { status: filterStatus } : undefined)
      setBookings(data.bookings)
    } catch (error) {
      console.error('Failed to load bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    leadsService.getAll({ limit: 100 }).then((d) => setLeads(d.leads)).catch(() => undefined)
  }, [])

  const handleCreate = async () => {
    setFormError('')
    if (!newBooking.leadId || !newBooking.scheduledAt) {
      setFormError('Choose a lead and a date/time.')
      return
    }
    try {
      await bookingsService.create({
        leadId: newBooking.leadId,
        eventType: newBooking.eventType,
        scheduledAt: new Date(newBooking.scheduledAt).toISOString(),
        duration: newBooking.duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes: newBooking.notes,
      })
      setIsCreateOpen(false)
      setNewBooking({ leadId: '', eventType: 'discovery', scheduledAt: '', duration: 30, notes: '' })
      loadBookings()
    } catch (error: any) {
      setFormError(error?.response?.data?.error || 'Could not create the booking.')
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await bookingsService.updateStatus(bookingId, newStatus as BookingStatus)
      loadBookings()
    } catch (error) {
      console.error('Failed to update booking:', error)
    }
  }

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledAt)
      return bookingDate.toDateString() === date.toDateString()
    }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  }

  const upcomingBookings = bookings
    .filter(b => new Date(b.scheduledAt) > new Date() && b.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 10)

  const dailyBookings = getBookingsForDate(selectedDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Bookings</h1>
          <p className="text-slate-400 mt-1">Manage meetings and appointments</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0f0f1b] border border-white/10 rounded-lg px-4 py-2 text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Total Bookings</p>
          <p className="text-2xl font-bold text-white">{bookings.length}</p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Upcoming</p>
          <p className="text-2xl font-bold text-cyan-400">
            {bookings.filter(b => b.status === 'scheduled' && new Date(b.scheduledAt) > new Date()).length}
          </p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-400">
            {bookings.filter(b => b.status === 'completed').length}
          </p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4">
          <p className="text-slate-400 text-sm">This Week</p>
          <p className="text-2xl font-bold text-purple-400">
            {bookings.filter(b => {
              const date = new Date(b.scheduledAt)
              const now = new Date()
              const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
              const weekEnd = new Date(weekStart)
              weekEnd.setDate(weekEnd.getDate() + 7)
              return date >= weekStart && date < weekEnd
            }).length}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-[#0f0f1b] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Calendar</h2>
          <div className="grid grid-cols-1 gap-6">
            <Calendar
              selected={selectedDate}
              onSelect={setSelectedDate}
              events={bookings
                .filter((b) => b.status !== 'cancelled')
                .map((b) => ({
                  id: b.id,
                  title: EVENT_TYPES.find((e) => e.id === b.eventType)?.label ?? b.eventType,
                  start: new Date(b.scheduledAt),
                  end: new Date(new Date(b.scheduledAt).getTime() + b.duration * 60000),
                }))}
              className="w-full"
            />
            <div>
              <h3 className="text-lg font-medium text-white mb-4">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {dailyBookings.length > 0 ? (
                  dailyBookings.map(booking => {
                    const eventType = EVENT_TYPES.find(e => e.id === booking.eventType)
                    const StatusIcon = STATUS_CONFIG[booking.status].icon
                    return (
                      <div
                        key={booking.id}
                        className="p-4 bg-[#0a0a0f] border border-white/10 rounded-lg hover:border-cyan-500/30 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-${eventType?.color}-500/10`}>
                              <CalendarIcon className={`w-4 h-4 text-${eventType?.color}-400`} />
                            </div>
                            <div>
                              <p className="font-medium text-white">{eventType?.label}</p>
                              <p className="text-sm text-slate-400">
                                {new Date(booking.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} • {eventType?.duration} min
                              </p>
                            </div>
                          </div>
                          <span className={`flex items-center gap-1 text-xs ${STATUS_CONFIG[booking.status].color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {STATUS_CONFIG[booking.status].label}
                          </span>
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-slate-500 mt-2 ml-11">{booking.notes}</p>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <CalendarIcon className="w-8 h-8 mx-auto mb-2" />
                    <p>No bookings for this date</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Upcoming</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map(booking => {
                const eventType = EVENT_TYPES.find(e => e.id === booking.eventType)
                return (
                  <div key={booking.id} className="p-4 bg-[#0a0a0f] border border-white/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-${eventType?.color}-500/10 text-${eventType?.color}-400`}>
                        {eventType?.label}
                      </span>
                    </div>
                    <p className="font-medium text-white">
                      {new Date(booking.scheduledAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {booking.meetingUrl && (
                      <a 
                        href={booking.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-cyan-400 hover:underline mt-1"
                      >
                        <Video className="w-3 h-3" />
                        Join Meeting
                      </a>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No upcoming bookings</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Bookings Table */}
      <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">All Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-400 text-sm border-b border-white/10">
                <th className="pb-3 font-medium">Event</th>
                <th className="pb-3 font-medium">Date & Time</th>
                <th className="pb-3 font-medium">Duration</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {bookings.map(booking => {
                const eventType = EVENT_TYPES.find(e => e.id === booking.eventType)
                const config = STATUS_CONFIG[booking.status]
                return (
                  <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${eventType?.color}-500/10`}>
                          <CalendarIcon className={`w-4 h-4 text-${eventType?.color}-400`} />
                        </div>
                        <span className="text-white">{eventType?.label}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">
                      {new Date(booking.scheduledAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 text-slate-300">{booking.duration} min</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${config.bg} ${config.color} border border-white/10`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="py-4">
                      {booking.status === 'scheduled' && (
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusChange(booking.id, 'completed')}
                          >
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                          >
                            <XCircle className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Booking Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {formError && <p role="alert" className="text-sm text-red-400">{formError}</p>}
            <select
              aria-label="Lead"
              value={newBooking.leadId}
              onChange={(e) => setNewBooking({ ...newBooking, leadId: e.target.value })}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-slate-300"
            >
              <option value="">Select a lead…</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>{[l.firstName, l.lastName].filter(Boolean).join(' ') || l.email}{l.company ? ` — ${l.company}` : ''}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <select
                aria-label="Event type"
                value={newBooking.eventType}
                onChange={(e) => {
                  const t = EVENT_TYPES.find((x) => x.id === e.target.value)
                  setNewBooking({ ...newBooking, eventType: e.target.value as BookingEventType, duration: t?.duration ?? 30 })
                }}
                className="bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-slate-300"
              >
                {EVENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <input
                aria-label="Date and time"
                type="datetime-local"
                value={newBooking.scheduledAt}
                onChange={(e) => setNewBooking({ ...newBooking, scheduledAt: e.target.value })}
                className="bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-slate-300"
              />
            </div>
            <textarea
              placeholder="Notes..."
              value={newBooking.notes}
              onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
              className="w-full h-20 bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-slate-300 resize-none"
            />
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleCreate}>Create Booking</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
