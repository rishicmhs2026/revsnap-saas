import LogRocket from 'logrocket';

export function initializeLogRocket() {
  const appId = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID;
  
  if (!appId) {
    console.warn('LogRocket app ID not configured');
    return;
  }

  LogRocket.init(appId);

  // Identify user when they log in
  LogRocket.identify('user', {
    name: 'User Name',
    email: 'user@example.com',
  });

  // Track custom events
  LogRocket.track('User Action', {
    action: 'button_click',
    page: 'dashboard',
  });
}

export function identifyUser(userId: string, userData: any) {
  LogRocket.identify(userId, userData);
}

export function trackEvent(eventName: string, properties?: any) {
  LogRocket.track(eventName, properties);
}

export function captureException(error: Error, context?: any) {
  LogRocket.captureException(error, {
    extra: context,
  });
} 