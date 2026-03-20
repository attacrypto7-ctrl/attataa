const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  let pkRaw = process.env.FIREBASE_PRIVATE_KEY || '';
  let privateKey = pkRaw
    .replace(/\\n/g, '\n')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .trim();

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const db = admin.firestore();

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 1. Verify Webhook Token from Xendit
  const xenditToken = event.headers['x-callback-token'];
  if (xenditToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
    return { statusCode: 403, body: 'Invalid Callback Token' };
  }

  try {
    const data = JSON.parse(event.body);

    // 2. We only care if the invoice is PAID
    if (data.status === 'PAID') {
      const donationId = data.external_id;

      const donationRef = db.collection('donations').doc(donationId);
      const donationDoc = await donationRef.get();

      if (donationDoc.exists) {
        const currentData = donationDoc.data();
        
        // Prevent double counting (Idempotency)
        if (currentData.status !== 'COMPLETED') {
          // 3. Update Status to COMPLETED
          await donationRef.update({
            status: 'COMPLETED',
            paidAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // 4. Increment Total Donation Stats (Optional: Assuming you have a config doc)
          const statsRef = db.collection('config').doc('stats');
          await statsRef.set({
            totalDonasi: admin.firestore.FieldValue.increment(data.amount)
          }, { merge: true });
        }
      }
    }

    // 5. Always return 200 OK so Xendit knows we received it
    return { statusCode: 200, body: 'Webhook Received' };

  } catch (error) {
    console.error('Webhook processing error:', error);
    return { statusCode: 500, body: 'Webhook Processing Error' };
  }
};
