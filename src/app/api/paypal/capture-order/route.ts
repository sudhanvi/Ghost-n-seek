// src/app/api/paypal/capture-order/route.ts
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

const env = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID!,
  process.env.PAYPAL_CLIENT_SECRET!
);
const client = new paypal.core.PayPalHttpClient(env);

export async function POST(req: Request) {
  const { orderID } = await req.json();

  // Initialize the capture request
  const request = new paypal.orders.OrdersCaptureRequest(orderID);

  // The SDK’s types require a "payment_source" property,
  // even though the API works fine with an empty body.
  // We cast to `any` to satisfy the compiler.
  request.requestBody({ payment_source: {} } as any);

  const capture = await client.execute(request);
  return NextResponse.json(capture.result);
}
