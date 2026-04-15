import { useState, useEffect } from 'react'
import { contactsService } from '@/services/contacts.service'
import { Contact } from '@/types/crm'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { DataTable } from '@/components/ui/DataTable'
import { 
  Plus, 
  Search, 
  Mail,
  Phone,
  Building,
  MapPin,
  Tag,
  MoreHorizontal
} from 'lucide-react'

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const [newContact, setNewContact] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    phone: '',
    linkedinUrl: '',
    website: '',
    city: '',
    state: '',
    country: '',
    tags: '',
    notes: ''
  })

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const data = await contactsService.getAll()
      setContacts(data.contacts)
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateContact = async () => {
    try {
      await contactsService.create({
        ...newContact,
        tags: newContact.tags.split(',').map(t => t.trim()).filter(Boolean)
      })
      setIsCreateDialogOpen(false)
      setNewContact({
        email: '', firstName: '', lastName: '', company: '', jobTitle: '',
        phone: '', linkedinUrl: '', website: '', city: '', state: '',
        country: '', tags: '', notes: ''
      })
      loadContacts()
    } catch (error) {
      console.error('Failed to create contact:', error)
    }
  }

  const filteredContacts = contacts.filter(contact =>
    searchQuery === '' ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const columns = [
    {
      key: 'name',
      header: 'Contact',
      render: (contact: Contact) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-medium">
            {contact.firstName?.[0]}{contact.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium text-white">{contact.firstName} {contact.lastName}</p>
            <p className="text-sm text-slate-400">{contact.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'company',
      header: 'Company & Title',
      render: (contact: Contact) => (
        <div>
          <p className="text-slate-300">{contact.company || '-'}</p>
          <p className="text-sm text-slate-500">{contact.jobTitle || '-'}</p>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (contact: Contact) => (
        <div className="flex items-center gap-1 text-slate-400 text-sm">
          <MapPin className="w-3 h-3" />
          {contact.city || contact.state || contact.country 
            ? `${contact.city || ''}${contact.city && contact.state ? ', ' : ''}${contact.state || ''}`
            : '-'}
        </div>
      )
    },
    {
      key: 'tags',
      header: 'Tags',
      render: (contact: Contact) => (
        <div className="flex flex-wrap gap-1">
          {contact.tags?.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {tag}
            </span>
          ))}
          {contact.tags && contact.tags.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400">
              +{contact.tags.length - 3}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (contact: Contact) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.location.href = `mailto:${contact.email}`}
          >
            <Mail className="w-4 h-4" />
          </Button>
          {contact.phone && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.href = `tel:${contact.phone}`}
            >
              <Phone className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSelectedContact(contact)
              setIsDetailsOpen(true)
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Contacts</h1>
          <p className="text-slate-400 mt-1">Manage your network and clients</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search contacts by name, email, company, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Total Contacts</p>
          <p className="text-2xl font-bold text-white mt-1">{contacts.length}</p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Clients</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">
            {contacts.filter(c => c.isClient).length}
          </p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Companies</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">
            {new Set(contacts.map(c => c.company).filter(Boolean)).size}
          </p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4">
          <p className="text-slate-400 text-sm">With LinkedIn</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {contacts.filter(c => c.linkedinUrl).length}
          </p>
        </div>
      </div>

      {/* Contacts Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredContacts}
          keyExtractor={(contact) => contact.id}
        />
      )}

      {/* Create Contact Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={newContact.firstName}
                onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
              />
              <Input
                placeholder="Last Name"
                value={newContact.lastName}
                onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
              />
            </div>
            <Input
              type="email"
              placeholder="Email *"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Company"
                value={newContact.company}
                onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
              />
              <Input
                placeholder="Job Title"
                value={newContact.jobTitle}
                onChange={(e) => setNewContact({ ...newContact, jobTitle: e.target.value })}
              />
            </div>
            <Input
              placeholder="Phone"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="LinkedIn URL"
                value={newContact.linkedinUrl}
                onChange={(e) => setNewContact({ ...newContact, linkedinUrl: e.target.value })}
              />
              <Input
                placeholder="Website"
                value={newContact.website}
                onChange={(e) => setNewContact({ ...newContact, website: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="City"
                value={newContact.city}
                onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
              />
              <Input
                placeholder="State"
                value={newContact.state}
                onChange={(e) => setNewContact({ ...newContact, state: e.target.value })}
              />
              <Input
                placeholder="Country"
                value={newContact.country}
                onChange={(e) => setNewContact({ ...newContact, country: e.target.value })}
              />
            </div>
            <Input
              placeholder="Tags (comma-separated)"
              value={newContact.tags}
              onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
            />
            <textarea
              placeholder="Notes..."
              value={newContact.notes}
              onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
              className="w-full h-24 bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateContact} className="flex-1">
                Create Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-xl font-medium">
                  {selectedContact.firstName?.[0]}{selectedContact.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {selectedContact.firstName} {selectedContact.lastName}
                  </h3>
                  <p className="text-slate-400">{selectedContact.jobTitle}</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-white/10">
                {selectedContact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${selectedContact.email}`} className="text-cyan-400 hover:underline">
                      {selectedContact.email}
                    </a>
                  </div>
                )}
                {selectedContact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${selectedContact.phone}`} className="text-cyan-400 hover:underline">
                      {selectedContact.phone}
                    </a>
                  </div>
                )}
                {selectedContact.company && (
                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{selectedContact.company}</span>
                  </div>
                )}
                {(selectedContact.city || selectedContact.state) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">
                      {[selectedContact.city, selectedContact.state, selectedContact.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {selectedContact.tags && selectedContact.tags.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedContact.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedContact.notes && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-slate-400 mb-2">Notes</p>
                  <p className="text-slate-300 text-sm">{selectedContact.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
