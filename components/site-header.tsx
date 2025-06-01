"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Download, Menu, ChevronDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { motion } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Início", href: "/" },
  { name: "Serviços", href: "/services" },
  { name: "Como Funciona", href: "/how-it-works" },
  { name: "FAQ", href: "/faq" },
  { name: "Contato", href: "/contact" },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto flex h-16 items-center">
        <div className="mr-4 flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] pr-0">
              <div className="flex h-16 items-center border-b">
                <Link href="/" className="flex items-center space-x-2">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary"
                  >
                    <Download className="h-5 w-5 text-primary-foreground" />
                  </motion.div>
                  <span className="font-bold">Central Download</span>
                </Link>
              </div>
              <nav className="flex flex-col space-y-4 mt-6">
                {navigation.map((item) => (
                  <motion.div
                    key={item.href}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-1 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted ${
                        pathname === item.href ? "text-primary bg-primary/5" : "text-muted-foreground"
                      }`}
                    >
                      <span>{item.name}</span>
                      {pathname === item.href && (
                        <motion.div 
                          layoutId="activePage"
                          className="h-1 w-1 rounded-full bg-primary"
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="grid grid-cols-3 w-full items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary"
              >
                <Download className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <span className="font-bold">Central Download</span>
            </Link>
          </div>
          
          <div className="hidden md:flex justify-center items-center">
            <nav className="flex items-center space-x-2 md:space-x-1 lg:space-x-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-3 md:px-3 lg:px-4 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                  {pathname === item.href && (
                    <motion.div 
                      layoutId="activeIndicator" 
                      className="absolute -bottom-[1px] left-0 right-0 mx-auto h-1 w-12 rounded-full bg-primary"
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center justify-end space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm rounded-full">
                  Plataformas <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>YouTube</DropdownMenuItem>
                <DropdownMenuItem>Instagram</DropdownMenuItem>
                <DropdownMenuItem>Facebook</DropdownMenuItem>
                <DropdownMenuItem>Twitter</DropdownMenuItem>
                <DropdownMenuItem>SoundCloud</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="sm" className="rounded-full">
                <span>Iniciar</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}