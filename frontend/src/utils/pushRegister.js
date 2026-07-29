import authFetch from '../shared/lib/authFetch';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushNotifications() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[PushRegister] Service worker or Push notifications not supported in this browser.');
    return;
  }

  try {
    // 1. Register Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('[PushRegister] Service Worker registered with scope:', registration.scope);

    // 2. Request Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[PushRegister] Notification permission denied.');
      return;
    }

    // 3. Get VAPID Public Key from backend
    const keyRes = await authFetch('/push/key');
    const { publicKey } = await keyRes.json();
    if (!publicKey) {
      console.warn('[PushRegister] VAPID Public Key missing on backend.');
      return;
    }

    // 4. Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // 5. Subscribe user
      const convertedKey = urlBase64ToUint8Array(publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });
      console.log('[PushRegister] Subscribed successfully.');
    }

    // 6. Send subscription to backend
    await authFetch('/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
    console.log('[PushRegister] Subscription synchronized with backend.');
  } catch (error) {
    console.error('[PushRegister] Error during push notification registration:', error);
  }
}
