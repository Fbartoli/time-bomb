# Time Tomb 💰

A decentralized social experiment where time literally equals money. Time Tomb is a unique DeFi game built on blockchain technology where players compete to be the last depositor when time runs out.

## What is Time Tomb?

Time Tomb is an innovative DeFi game where:
- Players deposit 1 USDC to become the current leader
- The first deposit starts a 24-hour timer
- Each new deposit extends the timer by 5 minutes
- When the timer hits zero, the last depositor wins all accumulated USDC

## Features

- 🕒 Real-time countdown timer
- 💎 Secure USDC deposits
- 👑 Live leader tracking
- 🌐 Farcaster integration
- ⚡ Instant deposits and withdrawals
- 🎮 Interactive UI with deposit animations

## Getting Started

### Prerequisites

- MetaMask or any Web3 wallet
- USDC on the supported network
- A Farcaster account (optional)

### Installation

First, clone the repository:

```bash
git clone https://github.com/yourusername/time-tomb.git
cd time-tomb
```

Install dependencies:

```bash
pnpm install
```

Create a `.env.local` file with your configuration:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_ERC20_ADDRESS=your_usdc_contract_address
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Play

1. Connect your Web3 wallet
2. Ensure you have USDC in your wallet
3. Click "Approve USDC" (first time only)
4. Click "Deposit 1 USDC" to become the leader
5. Watch the timer and strategize your next move
6. If you're the last depositor when the timer hits zero, you win all deposits!

## Built With

- [Next.js](https://nextjs.org/) - The React framework
- [Wagmi](https://wagmi.sh/) - React Hooks for Ethereum
- [TailwindCSS](https://tailwindcss.com/) - For styling
- [Framer Motion](https://www.framer.com/motion/) - For animations
- [Farcaster](https://www.farcaster.xyz/) - For social integration

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
