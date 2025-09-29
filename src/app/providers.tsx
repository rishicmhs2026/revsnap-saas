'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize LogRocket
    // if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
    //   import('logrocket').then((LogRocket) => {
    //     LogRocket.default.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID!);
    //     console.log('LogRocket initialized');
    //   }).catch((error) => {
    //     console.warn('LogRocket initialization failed:', error);
    //   });
    // }

    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
          .then(function(registration) {
            console.log('RevSnap: Service Worker registered with scope:', registration.scope);
          }, function(err) {
            console.log('RevSnap: Service Worker registration failed:', err);
          });
      });
    }
  }, []);

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
} 