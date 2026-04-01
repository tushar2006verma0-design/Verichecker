import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const { amount, currency, userId } = await request.json();

    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: currency || 'INR',
      receipt: `rcpt_${uuidv4().substring(0, 10)}`,
      notes: {
        userId: userId || 'anonymous',
        plan: 'premium'
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } export async function POST() {
  return new Response(
    JSON.stringify({ message: "Payments disabled for now" }),
    { status: 200 }
  );
}
