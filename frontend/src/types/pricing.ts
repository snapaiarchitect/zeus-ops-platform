export interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  popular?: boolean
}

export interface CalculatorOption {
  label: string
  basePrice: number
  perUnit: number
}

export interface FAQItem {
  question: string
  answer: string
}
