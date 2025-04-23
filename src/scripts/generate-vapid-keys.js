/**
 * Script to generate VAPID keys for web push notifications
 * 
 * Run with: node src/scripts/generate-vapid-keys.js
 */

const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('----------------------------------------');
console.log('VAPID Keys Generated');
console.log('----------------------------------------');
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('----------------------------------------');
console.log('Private Key:');
console.log(vapidKeys.privateKey);
console.log('----------------------------------------');
console.log('Add these to your .env file:');
console.log('');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('----------------------------------------'); 