import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from './ui/Button'

interface Testimonial {
  id: string
  quote: string
  author: string
  role: string
  company: string
  avatar?: string
  rating?: number
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[]
  autoPlay?: boolean
  autoPlayInterval?: number
  className?: string
}

export function TestimonialsCarousel({
  testimonials,
  autoPlay = true,
  autoPlayInterval = 5000,
  className,
}: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [testimonials.length])

  useEffect(() => {
    if (!autoPlay || isPaused) return

    const interval = setInterval(next, autoPlayInterval)
    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, isPaused, next])

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Content */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8 md:p-12"
          >
            {/* Quote Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center">
                <Quote className="w-6 h-6 text-cyan-500" />
              </div>
            </div>

            {/* Rating */}
            {testimonials[currentIndex].rating && (
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i < (testimonials[currentIndex].rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-600'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Quote */}
            <blockquote className="text-center mb-8">
              <p className="text-xl md:text-2xl text-slate-200 leading-relaxed">
                "{testimonials[currentIndex].quote}"
              </p>
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              {testimonials[currentIndex].avatar ? (
                <img
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].author}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                  {testimonials[currentIndex].author.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <p className="font-semibold text-white">
                  {testimonials[currentIndex].author}
                </p>
                <p className="text-sm text-slate-400">
                  {testimonials[currentIndex].role}
                </p>
                <p className="text-sm text-cyan-400">
                  {testimonials[currentIndex].company}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={prev}
          className="rounded-full"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Dots */}
        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'w-8 bg-cyan-500'
                  : 'bg-slate-600 hover:bg-slate-500'
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={next}
          className="rounded-full"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
