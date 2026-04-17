import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { UIProvider } from '@/context/UIContext';
import { CollegeProvider } from '@/context/CollegeContext';
import { AlertProvider } from '@/context/AlertContext';
import DrawerHost from '@/components/ui/Drawer/DrawerHost';
import ToastHost from '@/components/ui/Toast/ToastHost';

export const metadata: Metadata = {
  title: 'Bus Management System',
  description: 'Manage your buses, drivers, staff and routes from one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <CollegeProvider>
            <AlertProvider>
              <UIProvider>
                {children}
                <DrawerHost />
                <ToastHost />
              </UIProvider>
            </AlertProvider>
          </CollegeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
