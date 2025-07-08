'use client';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useState } from 'react';

export default function PaymentButton({
  amount,
  currency,
}: {
  amount: string;
  currency: string;
}) {
  const [paid, setPaid] = useState(false);

  if (paid) {
    return (
      <p className="text-center text-green-400">
        Thank you! Your art is on its way.
      </p>
    );
  }

  return (
    <div className="mx-auto w-1/2">
      <PayPalButtons
        style={{ layout: 'vertical' }}
        createOrder={async (_, actions) => {
          // Provide the full shape, including intent
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  value: amount,
                  currency_code: currency,
                },
              },
            ],
          } as any); // cast to any if TS still complains
        }}
        onApprove={async (_data, actions) => {
          const details = await actions.order!.capture();
          // Optionally verify on your server here...
          setPaid(true);
        }}
      />
    </div>
  );
}
