"use client"

import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { 
  YouTubeIcon, 
  InstagramIcon, 
  FacebookIcon, 
  TwitterIcon, 
  TwitchIcon, 
  SoundCloudIcon, 
  TikTokIcon, 
  PinterestIcon 
} from "@/icons/platform-icons"

// Modelo de dados para as plataformas
interface Platform {
  id: number
  name: string
  icon: React.FC
  color: string
}

const platforms: Platform[] = [
  { id: 1, name: "YouTube", icon: YouTubeIcon, color: "text-red-600" },
  { id: 2, name: "Instagram", icon: InstagramIcon, color: "text-pink-600" },
  { id: 3, name: "Facebook", icon: FacebookIcon, color: "text-blue-600" },
  { id: 4, name: "Twitter", icon: TwitterIcon, color: "text-sky-500" },
  { id: 5, name: "Twitch", icon: TwitchIcon, color: "text-purple-600" },
  { id: 6, name: "SoundCloud", icon: SoundCloudIcon, color: "text-orange-500" },
  { id: 7, name: "TikTok", icon: TikTokIcon, color: "text-black dark:text-white" },
  { id: 8, name: "Pinterest", icon: PinterestIcon, color: "text-red-600" },
]

// Função para distribuir plataformas em colunas
const distributePlatforms = (platforms: Platform[], columnCount: number) => {
  const shuffled = [...platforms].sort(() => Math.random() - 0.5)
  const columns: Platform[][] = Array.from({ length: columnCount }, () => [])
  
  shuffled.forEach((platform, index) => {
    columns[index % columnCount].push(platform)
  })
  
  return columns
}

interface PlatformColumnProps {
  platforms: Platform[]
  columnIndex: number
  currentTime: number
}

// Componente para uma coluna de plataformas
function PlatformColumn({ platforms, columnIndex, currentTime }: PlatformColumnProps) {
  const CYCLE_DURATION = 3000
  const columnDelay = columnIndex * 300
  const adjustedTime = (currentTime + columnDelay) % (CYCLE_DURATION * platforms.length)
  const currentIndex = Math.floor(adjustedTime / CYCLE_DURATION)
  const currentPlatform = platforms[currentIndex]
  
  const Icon = currentPlatform.icon
  
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: columnIndex * 0.15, duration: 0.5 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentPlatform.id}-${currentIndex}`}
          className="flex flex-col items-center space-y-3"
          initial={{ y: 20, opacity: 0, scale: 0.8 }}
          animate={{ 
            y: 0, 
            opacity: 1, 
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 20,
              mass: 0.8,
            }
          }}
          exit={{ 
            y: -20, 
            opacity: 0,
            scale: 0.8,
            transition: { 
              duration: 0.3,
              ease: "easeInOut"
            }
          }}
        >
          <div className={`rounded-full p-3 bg-white shadow-md dark:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:scale-110`}>
            <Icon />
          </div>
          <span className={`text-sm font-medium ${currentPlatform.color}`}>
            {currentPlatform.name}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export function PlatformCarousel() {
  const [columnCount] = useState(4)
  const [platformColumns, setPlatformColumns] = useState<Platform[][]>([])
  const [currentTime, setCurrentTime] = useState(0)
  
  // Inicializa as colunas quando o componente é montado
  useEffect(() => {
    setPlatformColumns(distributePlatforms(platforms, columnCount))
  }, [columnCount])
  
  // Atualiza o tempo para controlar a animação
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(prev => prev + 100)
    }, 100)
    
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className="w-full py-6">
      <div className="flex flex-wrap justify-center items-center">
        {platformColumns.map((columnPlatforms, index) => (
          <PlatformColumn
            key={index}
            platforms={columnPlatforms}
            columnIndex={index}
            currentTime={currentTime}
          />
        ))}
      </div>
    </div>
  )
}