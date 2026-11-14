import type { SVGProps } from 'react'

// lucide-react v1 dropped brand icons; minimal inline replacements.
const base = (props: SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true, ...props,
})

export const Twitter = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}><path d="M18.244 2H21.5l-7.12 8.14L22.75 22h-6.55l-5.13-6.71L5.2 22H1.94l7.62-8.71L1.5 2h6.72l4.64 6.13L18.244 2Zm-1.15 18h1.8L7.02 3.9H5.1L17.094 20Z"/></svg>
)
export const Linkedin = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.84v1.54h.05c.54-.96 1.85-1.97 3.8-1.97 4.06 0 4.81 2.57 4.81 5.92V21h-4v-5.03c0-1.2-.02-2.74-1.8-2.74-1.8 0-2.07 1.3-2.07 2.65V21h-4V9.75Z"/></svg>
)
export const Github = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.72 0 0 .84-.28 2.75 1.05A9.4 9.4 0 0 1 12 6.84c.85 0 1.7.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"/></svg>
)
export const Facebook = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}><path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.95.3-1.6 1.65-1.6H17V3.85C16.7 3.8 15.7 3.7 14.55 3.7c-2.45 0-4.1 1.5-4.1 4.2v2.6H7.7v3.3h2.75V22h3.05Z"/></svg>
)
