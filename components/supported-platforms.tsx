"use client"

import { motion } from "framer-motion"
import { Youtube, Instagram, Facebook, Music2 } from "lucide-react"

const platforms = [
  { icon: Youtube, color: "text-red-500", delay: 0 },
  { icon: Instagram, color: "text-pink-500", delay: 0.1 },
  { icon: Facebook, color: "text-blue-500", delay: 0.2 },
  { icon: Music2, color: "text-purple-500", delay: 0.3 },
]

export function SupportedPlatforms() {
  return (
    <div className="flex flex-wrap justify-center gap-8">
      {platforms.map((Platform, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: Platform.delay,
            ease: "easeOut",
          }}
        >
          <Platform.icon className={`h-10 w-10 ${Platform.color}`} />
        </motion.div>
      ))}
    </div>
  )
}