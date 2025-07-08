// src/app/api/paypal/create-order/route.ts
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

const env = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID!,
  process.env.PAYPAL_CLIENT_SECRET!
);
const client = new paypal.core.PayPalHttpClient(env);

export async function POST(req: Request) {
  const { amount, currency = 'INR' } = await req.json();
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{ amount: { currency_code: currency, value: amount } }],
  });
  const order = await client.execute(request);
  return NextResponse.json(order.result);
}
