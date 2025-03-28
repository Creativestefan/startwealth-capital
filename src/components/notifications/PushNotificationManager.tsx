'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { subscribeUserToPush, unsubscribeUserFromPush } from '@/app/actions/push-notifications';
import { Button } from '@/components/ui/button';
import { BellIcon, BellOffIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Type definition for Web Push Subscription
interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

interface WebPushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: PushSubscriptionKeys;
}

/**
 * Utility function to convert base64 string to Uint8Array for applicationServerKey
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
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

export default function PushNotificationManager() {
  const { data: session } = useSession();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check if push notifications are supported
  useEffect(() => {
    if (!session?.user) return;
    
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      checkSubscriptionStatus();
      pingServiceWorker();
    }
  }, [session]);
  
  // Check if the user is already subscribed
  async function checkSubscriptionStatus() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }
  
  // Ping the service worker to check if it's alive
  async function pingServiceWorker() {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length === 0) {
        console.log('No service workers registered');
        return;
      }
      
      // Take the first registration with an active worker
      const registration = registrations.find(reg => reg.active) || registrations[0];
      
      if (!registration.active) {
        console.log('Service worker not active, cannot ping');
        return;
      }
      
      // Create a message channel for the response
      const messageChannel = new MessageChannel();
      
      // Set up a promise to wait for response
      const pingPromise = new Promise<boolean>((resolve) => {
        // Listen for response on port1
        messageChannel.port1.onmessage = (event) => {
          console.log('Received response from service worker:', event.data);
          resolve(true);
        };
        
        // Set timeout for response
        setTimeout(() => {
          console.log('Service worker ping timed out');
          resolve(false);
        }, 3000);
      });
      
      // Post the message to the service worker
      registration.active.postMessage(
        { type: 'PING', timestamp: Date.now() },
        [messageChannel.port2]
      );
      
      // Wait for response
      const result = await pingPromise;
      console.log('Service worker ping result:', result);
      
    } catch (error) {
      console.error('Error pinging service worker:', error);
    }
  }
  
  // Register service worker and subscribe to push notifications
  async function subscribe() {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      // First ping service worker to check if it's working
      await pingServiceWorker();
      
      // First check notification permission status and display it
      const existingPermission = Notification.permission;
      console.log("Current notification permission status:", existingPermission);
      
      // First ask for notification permission explicitly
      console.log("Requesting notification permission...");
      const permissionResult = await Notification.requestPermission();
      console.log("Permission request result:", permissionResult);
      
      if (permissionResult !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }
      
      console.log("Notification permission granted, setting up service worker...");
      
      let registration: ServiceWorkerRegistration;

      // First check if service worker is already registered
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log("Existing service worker registrations:", registrations.length);
      
      const existingRegistration = registrations.find(reg => reg.active);
      
      if (existingRegistration) {
        console.log('Using existing service worker registration', existingRegistration);
        registration = existingRegistration;
      } else {
        console.log('Registering new service worker');
        // Register service worker if not already registered
        try {
          registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          console.log('Service worker registered successfully', registration);
        } catch (regError) {
          console.error('Service worker registration failed:', regError);
          throw regError;
        }
        
        // Wait for the service worker to be ready/active
        if (registration.installing || registration.waiting) {
          console.log('Waiting for service worker to be activated...');
          console.log('Current state:', 
            registration.installing ? 'installing' : 
            registration.waiting ? 'waiting' : 
            registration.active ? 'active' : 'unknown');
            
          await new Promise<boolean>((resolve) => {
            const timeout = setTimeout(() => {
              console.log('Service worker activation timed out');
              resolve(false);
            }, 10000); // 10s timeout
            
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                console.log('New service worker found, initial state:', newWorker.state);
                newWorker.addEventListener('statechange', () => {
                  console.log('Service worker state changed to:', newWorker.state);
                  if (newWorker.state === 'activated') {
                    console.log('Service worker activated');
                    clearTimeout(timeout);
                    resolve(true);
                  }
                });
              }
            });
          });
        }
      }
      
      console.log('Service worker registration state:', 
        registration.installing ? 'installing' : 
        registration.waiting ? 'waiting' : 
        registration.active ? 'active' : 'unknown');
      
      // Ensure service worker is active
      if (!registration.active) {
        console.error('Service worker not active after waiting');
        throw new Error('Service worker not active');
      }
      
      console.log("Creating push subscription...");
      
      // Get permission status again before subscribing
      const finalPermission = Notification.permission;
      console.log("Final permission status before subscribing:", finalPermission);
      
      // Get or create a push subscription
      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
          )
        });
        
        console.log("Push subscription created successfully:", subscription);
        
        // Convert PushSubscription to plain object for server
        const subscriptionObject = subscription.toJSON() as unknown as WebPushSubscription;
        
        // Save subscription to the server
        const result = await subscribeUserToPush(session.user.id, subscriptionObject);
        console.log("Server subscription result:", result);
        
        if (result.success) {
          setIsSubscribed(true);
          toast.success('Successfully subscribed to notifications!');
          
          // Show a test notification to confirm it works
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              const testNotification = new Notification('Notifications Enabled', {
                body: 'You will now receive notifications from StratWealth Capital',
                icon: '/favicon.ico'
              });
              console.log("Test notification sent:", testNotification);
            } catch (notifyError) {
              console.error("Error showing test notification:", notifyError);
            }
          }
        } else {
          console.error("Subscription saved to server but reported failure:", result);
          toast.error('Failed to subscribe to notifications.');
        }
      } catch (subscribeError) {
        console.error("Error during push subscription:", subscribeError);
        throw subscribeError;
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      let errorMessage = 'Failed to subscribe. Please try again.';
      
      if (error instanceof Error) {
        // Provide more specific error messages
        if (error.name === 'InvalidStateError') {
          errorMessage = 'Please reload the page and try again. Service worker is not ready.';
        } else if (error.name === 'NotAllowedError') {
          errorMessage = 'Permission denied. Please allow notifications in your browser settings.';
        } else if (error.message.includes('Permission not granted')) {
          errorMessage = 'You must allow notification permissions to enable notifications.';
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }
  
  // Unsubscribe from push notifications
  async function unsubscribe() {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe on the browser
        await subscription.unsubscribe();
        
        // Remove subscription from the server
        const result = await unsubscribeUserFromPush(session.user.id);
        
        if (result.success) {
          setIsSubscribed(false);
          toast.success('Successfully unsubscribed from notifications.');
        } else {
          toast.error('Failed to unsubscribe from notifications.');
        }
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Failed to unsubscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  if (!session?.user || !isSupported) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-3 w-3 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          <span className="text-sm font-medium">
            {isSubscribed ? 'Push notifications are enabled in this browser' : 'Push notifications are disabled in this browser'}
          </span>
        </div>
      </div>
      
      {loading ? (
        <div className="bg-gray-100 p-3 rounded-md">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Processing notification settings...</span>
          </div>
        </div>
      ) : isSubscribed ? (
        <Button
          variant="outline"
          size="sm"
          onClick={unsubscribe}
          disabled={loading}
          className="w-full"
        >
          <BellOffIcon className="h-4 w-4 mr-2" />
          Disable Notifications in this Browser
        </Button>
      ) : (
        <Button
          variant="default"
          size="sm"
          onClick={subscribe}
          disabled={loading}
          className="w-full"
        >
          <BellIcon className="h-4 w-4 mr-2" />
          Enable Notifications in this Browser
        </Button>
      )}

      {/* Debug information - remove in production */}
      <div className="text-xs text-gray-500 mt-2">
        <p>If you're having trouble with notifications:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Try reloading the page before enabling</li>
          <li>Check that you haven't blocked notifications for this site</li>
          <li>Ensure your browser allows notifications (Chrome/Firefox/Safari settings)</li>
        </ul>
      </div>
    </div>
  );
}
