'use client';

import dynamic from 'next/dynamic';

const DepositApp = dynamic(() => import('@/components/deposit-app'), {
  ssr: false,
});
export default function Home() {
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-black">
      <DepositApp />
    </main>
  );
}