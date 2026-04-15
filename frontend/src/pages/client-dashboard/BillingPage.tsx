import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CreditCard,
  Download,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Zap,
  ArrowRight,
  Shield,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'

interface Invoice {
  id: string
  number: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  description: string
}

const invoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-2026-001',
    date: '2026-04-01',
    amount: 149,
    status: 'paid',
    description: 'Professional Plan - April 2026',
  },
  {
    id: '2',
    number: 'INV-2026-002',
    date: '2026-03-01',
    amount: 149,
    status: 'paid',
    description: 'Professional Plan - March 2026',
  },
  {
    id: '3',
    number: 'INV-2026-003',
    date: '2026-02-01',
    amount: 149,
    status: 'paid',
    description: 'Professional Plan - February 2026',
  },
  {
    id: '4',
    number: 'INV-2026-004',
    date: '2026-05-01',
    amount: 149,
    status: 'pending',
    description: 'Professional Plan - May 2026',
  },
]

const paymentMethods = [
  {
    id: '1',
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2027,
    isDefault: true,
  },
]

export function ClientBillingPage() {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly')

  const currentPlan = {
    name: 'Professional',
    price: 149,
    period: 'month',
    features: ['20 AI Agents', '10,000 tasks/month', 'Priority support'],
    nextBilling: 'May 1, 2026',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-slate-400">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan */}
      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{currentPlan.name} Plan</h2>
              <p className="text-slate-400">
                ${currentPlan.price}/{currentPlan.period}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentPlan.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-slate-400 text-sm">Next billing date</p>
            <p className="text-white font-medium">{currentPlan.nextBilling}</p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm">
                Change Plan
              </Button>
              <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Payment Methods */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Payment Methods</h2>
            <Button variant="outline" size="sm" onClick={() => setIsAddCardOpen(true)}>
              Add Card
            </Button>
          </div>

          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-6 bg-slate-700 rounded flex items-center justify-center text-xs text-slate-300">
                    {method.brand}
                  </div>
                  <div>
                    <p className="text-white">
                      •••• •••• •••• {method.last4}
                    </p>
                    <p className="text-slate-400 text-sm">
                      Expires {method.expMonth}/{method.expYear}
                    </p>
                  </div>
                </div>
                {method.isDefault && (
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Billing Address */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Billing Address</h3>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
            <div className="text-slate-400 text-sm">
              <p className="text-white">John Doe</p>
              <p>123 AI Boulevard, Suite 500</p>
              <p>San Francisco, CA 94105</p>
              <p>United States</p>
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Invoice History</h2>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <div className="divide-y divide-slate-800">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{invoice.number}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          invoice.status === 'paid'
                            ? 'bg-green-500/20 text-green-400'
                            : invoice.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{invoice.description}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">${invoice.amount}</p>
                    <Button variant="ghost" size="sm" className="gap-1 mt-1">
                      <Download className="w-3 h-3" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Current Usage</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">AI Agents</span>
              <span className="text-white">12/20</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-3/5 bg-cyan-500 rounded-full" />
            </div>
            <p className="text-slate-500 text-xs mt-1">60% used this month</p>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Tasks</span>
              <span className="text-white">6,240/10,000</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-3/5 bg-cyan-500 rounded-full" />
            </div>
            <p className="text-slate-500 text-xs mt-1">62% used this month</p>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Storage</span>
              <span className="text-white">45GB/100GB</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-2/5 bg-cyan-500 rounded-full" />
            </div>
            <p className="text-slate-500 text-xs mt-1">45% used</p>
          </div>
        </div>
      </div>

      {/* Add Card Dialog */}
      <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Card Number</Label>
              <Input placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expiry</Label>
                <Input placeholder="MM/YY" />
              </div>
              <div>
                <Label>CVC</Label>
                <Input placeholder="123" />
              </div>
            </div>
            <div>
              <Label>Name on Card</Label>
              <Input placeholder="John Doe" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCardOpen(false)}>
              Cancel
            </Button>
            <Button>Add Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
