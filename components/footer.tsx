"use client"

import { Download, Mail, Github, Twitter, Instagram, Facebook, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemFadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="container mx-auto py-12 md:py-16"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="h-10 w-10 rounded-full bg-primary flex items-center justify-center"
              >
                <Download className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <span className="font-bold text-xl">Central Download</span>
            </Link>
            <p className="text-muted-foreground max-w-xs">
              Baixe conteúdo de qualquer plataforma em segundos. Vídeos, áudios, fotos e muito mais.
            </p>
            <div className="flex space-x-3 pt-2">
              {[
                { icon: Mail, label: "Email", href: "mailto:contato@centraldownload.com" },
                { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
                { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
                { icon: Github, label: "GitHub", href: "https://github.com" },
                { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
              ].map((social, index) => (
                <motion.div key={index} whileHover={{ y: -5, scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link href={social.href} className="rounded-full p-2 bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors">
                    <social.icon className="h-4 w-4" />
                    <span className="sr-only">{social.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="text-base font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-3">
              {[
                { name: "Início", href: "/" },
                { name: "Serviços", href: "/services" },
                { name: "Como Funciona", href: "/how-it-works" },
                { name: "FAQ", href: "/faq" },
                { name: "Contato", href: "/contact" },
              ].map((item, index) => (
                <motion.li key={index} variants={itemFadeIn}>
                  <Link 
                    href={item.href} 
                    className="text-muted-foreground hover:text-primary flex items-center group"
                  >
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.span>
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="text-base font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {[
                { name: "Termos de Uso", href: "/terms" },
                { name: "Política de Privacidade", href: "/privacy" },
                { name: "Aviso Legal", href: "/disclaimer" },
                { name: "Cookies", href: "/cookies" },
              ].map((item, index) => (
                <motion.li key={index} variants={itemFadeIn}>
                  <Link 
                    href={item.href} 
                    className="text-muted-foreground hover:text-primary flex items-center group"
                  >
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.span>
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="space-y-4"
          >
            <h3 className="text-base font-semibold">Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Receba dicas e novidades sobre downloads e nossos serviços.
            </p>
            <form className="flex space-x-2">
              <Input 
                type="email" 
                placeholder="Digite seu email" 
                className="max-w-xs rounded-full bg-muted border-0 focus-visible:ring-primary" 
              />
              <Button type="submit" size="sm" className="rounded-full">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Assinar</span>
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-xl border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Download Seguro</h4>
                  <p className="text-xs text-muted-foreground">
                    Ferramentas 100% seguras e sem anúncios
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        <Separator className="my-8" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-between gap-4 md:flex-row text-sm text-muted-foreground"
        >
          <p>© {new Date().getFullYear()} Central Download. Todos os direitos reservados.</p>
          <p className="flex items-center">
            <span className="mr-2">Feito com</span> 
            <motion.span
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                repeatType: "reverse", 
                duration: 1.5 
              }}
              className="text-red-500"
            >
              ❤️
            </motion.span>
            <span className="ml-2">no Brasil</span>
          </p>
          <p>Use este serviço de forma responsável e respeite os direitos autorais.</p>
        </motion.div>
      </motion.div>
    </footer>
  )
}