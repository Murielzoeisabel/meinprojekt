const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const SUBSCRIPTIONS_PATH = path.join(__dirname, '../data/push_subscriptions.json');

// Initialize Web Push VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:notify@cat-slim-down.local',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('[WebPush] WARNING: VAPID keys are missing in env! Web Push notifications will fail.');
}

const readSubscriptions = () => {
  try {
    if (!fs.existsSync(SUBSCRIPTIONS_PATH)) {
      return [];
    }
    const data = fs.readFileSync(SUBSCRIPTIONS_PATH, 'utf8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('[WebPush] Error reading subscriptions:', error);
    return [];
  }
};

const writeSubscriptions = (subs) => {
  try {
    fs.mkdirSync(path.dirname(SUBSCRIPTIONS_PATH), { recursive: true });
    fs.writeFileSync(SUBSCRIPTIONS_PATH, JSON.stringify(subs, null, 2), 'utf8');
  } catch (error) {
    console.error('[WebPush] Error writing subscriptions:', error);
  }
};

const subscribeUser = (userId, subscription) => {
  const subs = readSubscriptions();
  // Filter out existing subscription for same endpoint to avoid duplicates
  const filtered = subs.filter(sub => sub.subscription.endpoint !== subscription.endpoint);
  filtered.push({ userId, subscription });
  writeSubscriptions(filtered);
};

const unsubscribeUserByEndpoint = (endpoint) => {
  const subs = readSubscriptions();
  const filtered = subs.filter(sub => sub.subscription.endpoint !== endpoint);
  writeSubscriptions(filtered);
};

const sendPushNotification = async (payload) => {
  const subs = readSubscriptions();
  console.log(`[WebPush] Sending notification to ${subs.length} subscribers...`);
  
  const payloadString = JSON.stringify(payload);
  
  const sendPromises = subs.map(async (sub) => {
    try {
      await webpush.sendNotification(sub.subscription, payloadString);
    } catch (error) {
      // If error status is 410 (Gone) or 404 (Not Found), delete subscription from DB
      if (error.statusCode === 410 || error.statusCode === 404) {
        console.log(`[WebPush] Subscription expired or unregistered (HTTP ${error.statusCode}). Deleting...`);
        unsubscribeUserByEndpoint(sub.subscription.endpoint);
      } else {
        console.error('[WebPush] Failed sending push message to client:', error.message);
      }
    }
  });

  await Promise.all(sendPromises);
};

module.exports = {
  subscribeUser,
  sendPushNotification
};
