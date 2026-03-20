const admin = require('firebase-admin');
const { Xendit } = require('xendit-node');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  let pkRaw = process.env.FIREBASE_PRIVATE_KEY || '';
  console.log("raw key length:", pkRaw.length);
  console.log("raw key start:", pkRaw.slice(0, 30));
  console.log("raw key end:", pkRaw.slice(-30));
  
  let privateKey = pkRaw
    .replace(/\\n/g, '\n')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .trim();
    
  console.log("cleaned key length:", privateKey.length);
  console.log("cleaned key start:", privateKey.slice(0, 30));
  console.log("cleaned key end:", privateKey.slice(-30));

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log("Firebase App Initialized successfully");
  } catch (err) {
    console.error("Firebase Init Error:", err.message);
    throw err;
  }
}

const db = admin.firestore();
const xenditClient = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY });

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount, name, email } = JSON.parse(event.body);

    if (!amount || !name || !email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // 1. Create a placeholder document in Firestore to get an ID
    const donationRef = db.collection('donations').doc();
    const donationId = donationRef.id;

    // 2. Create Xendit Invoice
    const invoiceData = {
      externalId: donationId, 
      amount: parseInt(amount),
      payerEmail: email,
      description: `Donasi YGGB - ${name}`,
      customer: {
        givenNames: name,
        email: email,
      },
      successRedirectUrl: `${process.env.SITE_URL}?donation=${donationId}&status=success`,
      failureRedirectUrl: `${process.env.SITE_URL}?donation=${donationId}&status=failed`,
    };

    const invoice = await xenditClient.Invoice.createInvoice({ data: invoiceData });

    // 3. Save initial PENDING status to Firestore
    await donationRef.set({
      id: donationId,
      status: 'PENDING', // Will be updated to PAID via Webhook
      amount: invoiceData.amount,
      name: invoiceData.customer.givenNames,
      email: invoiceData.payerEmail,
      invoiceUrl: invoice.invoiceUrl,
      invoiceId: invoice.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 4. Return the Checkout URL to frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        checkoutUrl: invoice.invoiceUrl,
        donationId: donationId 
      }),
    };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server Error', details: error.message }),
    };
  }
};
