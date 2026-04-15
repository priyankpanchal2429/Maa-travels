import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { UIProvider } from '@/context/UIContext';
import DrawerHost from '@/components/ui/Drawer/DrawerHost';
import ToastHost from '@/components/ui/Toast/ToastHost';

export const metadata: Metadata = {
  title: 'Bus Management System',
  description: 'Manage your bus fleet, drivers, staff and routes from one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <UIProvider>
              {children}
              <DrawerHost />
              <ToastHost />
            </UIProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
