import '../styles/globals.css';
import { StoreProvider } from '../providers/StoreProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { SocketProvider } from '../providers/SocketProvider';

export const metadata = {
  title: 'Saarthi TaskEngine - Task Automation & Job Processing Platform',
  description: 'Production-ready Micro SaaS Task Automation Platform with Redis Queue, BullMQ, and Real-Time Socket Updates.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-dark-bg text-gray-100 selection:bg-brand-500 selection:text-white">
        <StoreProvider>
          <QueryProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
