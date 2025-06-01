"use client"

import { motion } from "framer-motion"
import { Download, Zap, Shield, Clock, ArrowRight } from "lucide-react"

const features = [
  {
    icon: Download,
    title: "Download Rápido",
    description: "Baixe seus conteúdos favoritos em segundos, sem esperas ou limitações de velocidade.",
  },
  {
    icon: Zap,
    title: "Alta Qualidade",
    description: "Escolha entre diferentes qualidades de download para obter o melhor resultado para suas necessidades.",
  },
  {
    icon: Shield,
    title: "Seguro",
    description: "Downloads seguros e sem anúncios. Sua privacidade é nossa prioridade, sem rastreamento ou coleta de dados.",
  },
  {
    icon: Clock,
    title: "24/7 Disponível",
    description: "Serviço disponível o tempo todo, para que você possa fazer seus downloads quando quiser.",
  },
]

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemFadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

export function Features() {
  return (
    <section className="w-full bg-gradient-to-b from-secondary/30 to-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-12 text-center"
        >
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm mb-4">
            <Zap className="mr-1 h-3.5 w-3.5 text-primary" />
            <span className="text-primary font-medium">Recursos Incríveis</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher nossa plataforma?</h2>
          <p className="text-muted-foreground text-lg">
            Nossa ferramenta foi projetada para tornar o download de conteúdo o mais simples e eficiente possível.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemFadeIn}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all hover:shadow-md bg-background/80"
            >
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-all duration-300"></div>
              <div className="relative space-y-3">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                  className="text-sm font-medium text-primary group-hover:underline underline-offset-4"
                >
                  Saiba mais
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex justify-center mt-12"
        >
          <div className="inline-flex items-center rounded-full bg-muted px-5 py-2 text-sm text-muted-foreground">
            <span>Mais de <b>1 milhão</b> de usuários satisfeitos</span>
            <div className="ml-3 flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 w-6 rounded-full bg-primary/80 border-2 border-background"></div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}