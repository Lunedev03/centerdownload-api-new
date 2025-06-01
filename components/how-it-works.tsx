"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link2, Download, Check } from "lucide-react"
import Image from "next/image"

const steps = [
  {
    icon: Link2,
    title: "Cole o Link",
    description: "Cole o link do conteúdo que deseja baixar",
    image: "https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?q=80&w=2070&auto=format&fit=crop" 
  },
  {
    icon: Download,
    title: "Selecione o Formato",
    description: "Escolha o formato e a qualidade desejada",
    image: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?q=80&w=2070&auto=format&fit=crop"
  },
  {
    icon: Check,
    title: "Download Pronto",
    description: "Seu download começará automaticamente",
    image: "https://images.unsplash.com/photo-1571786256017-aee7a0c009b6?q=80&w=2070&auto=format&fit=crop"
  },
]

export function HowItWorks() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const autoPlayInterval = 4000

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100))
      } else {
        setCurrentStep((prev) => (prev + 1) % steps.length)
        setProgress(0)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [progress, steps.length, autoPlayInterval])

  return (
    <section className="w-full bg-background py-12 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-10 text-center">
          Como Funciona
        </h2>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10 max-w-6xl mx-auto">
          <div className="order-2 md:order-1 space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-6 md:gap-8 cursor-pointer"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: index === currentStep ? 1 : 0.3 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  setCurrentStep(index)
                  setProgress(0)
                }}
                whileHover={{ scale: 1.01 }}
              >
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index === currentStep
                      ? "bg-primary border-primary text-primary-foreground scale-110"
                      : "bg-muted border-muted-foreground"
                  }`}
                >
                  {index <= currentStep ? (
                    <span className="text-lg font-bold">✓</span>
                  ) : (
                    <span className="text-lg font-semibold">{index + 1}</span>
                  )}
                </motion.div>

                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-semibold">{step.title}</h3>
                  <p className="text-sm md:text-lg text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="order-1 md:order-2 relative h-[200px] md:h-[300px] lg:h-[400px] overflow-hidden rounded-lg">
            <AnimatePresence mode="wait">
              {steps.map(
                (step, index) =>
                  index === currentStep && (
                    <motion.div
                      key={index}
                      className="absolute inset-0 rounded-lg overflow-hidden"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Image
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover transition-transform transform"
                        width={1000}
                        height={500}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index === 0}
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-background via-background/50 to-transparent" />
                      <div className="absolute bottom-5 left-5 bg-background/70 backdrop-blur-sm p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <step.icon className="h-5 w-5 text-primary" />
                          <span className="font-semibold">{step.title}</span>
                        </div>
                      </div>
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
            
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <motion.div 
                className="h-full bg-primary" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}