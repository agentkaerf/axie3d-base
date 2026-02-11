import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Axie Adventure',
  description: 'A 3D adventure game with Axie characters',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
