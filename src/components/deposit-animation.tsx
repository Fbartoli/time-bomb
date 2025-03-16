"use client"

import { motion } from "framer-motion"

export default function DepositAnimation() {
  return (
    <motion.div
      className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Coin shower animation */}
      <div className="relative h-full w-full overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            initial={{
              top: "-10%",
              left: `${Math.random() * 100}%`,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              top: "110%",
              rotate: Math.random() > 0.5 ? 180 : -180,
              opacity: 0,
            }}
            transition={{
              duration: 2 + Math.random() * 1,
              ease: "easeIn",
            }}
          >
            {i % 3 === 0 ? "💰" : i % 3 === 1 ? "💎" : "🪙"}
          </motion.div>
        ))}
      </div>

      {/* Success message */}
      <motion.div
        className="absolute bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl shadow-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <h3 className="text-xl font-bold">1 USDC Deposited! 🚀</h3>
      </motion.div>
    </motion.div>
  )
}

