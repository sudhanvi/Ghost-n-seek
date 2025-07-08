// src/components/PayPalProvider.tsx
'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import type { ReactNode } from 'react';

export default function PayPalProvider({ children }: { children: ReactNode }) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: 'INR',
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}
