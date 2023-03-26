import './globals.css'

export const metadata = {
  title: 'Eye - Simple Analytics',
  description: 'Simple non intrusive analytics for your website.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
