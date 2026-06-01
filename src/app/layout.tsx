import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'ASCII//MATRIX — Neural Render Engine',
  description: 'Real-time ASCII art from webcam with background removal. Matrix-inspired UI.',
  keywords: ['ascii art', 'webcam', 'matrix', 'mediapipe', 'background removal'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ overflow: 'hidden', background: '#000' }}>
        {children}
      </body>
    </html>
  );
}
