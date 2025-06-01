"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  Download, 
  Link as LinkIcon,
  ChevronDown
} from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlatformCarousel } from "@/components/platform-carousel"

const formSchema = z.object({
  url: z
    .string()
    .min(1, "URL é obrigatória")
    .url("URL inválida")
    .refine(
      (url) => {
        const supportedDomains = [
          "youtube.com", "youtu.be",
          "instagram.com", "www.instagram.com",
          "facebook.com", "www.facebook.com", "fb.com", "fb.watch",
          "tiktok.com", "www.tiktok.com", "vm.tiktok.com",
          "twitter.com", "www.twitter.com", "x.com", "t.co",
          "soundcloud.com", "www.soundcloud.com", "snd.sc",
          "twitch.tv", "www.twitch.tv", "clips.twitch.tv",
          "pinterest.com", "www.pinterest.com", "pin.it",
          "vimeo.com", "www.vimeo.com",
          "dailymotion.com", "www.dailymotion.com", "dai.ly"
        ]
        // Verificação melhorada que considera subdomínios
        return supportedDomains.some((domain) => {
          const urlObj = new URL(url);
          const hostname = urlObj.hostname;
          return hostname === domain || hostname.endsWith('.' + domain);
        });
      },
      {
        message: "URL não suportada. Use links das plataformas suportadas.",
      }
    ),
})

export function DownloadForm() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      
      // Validar URL
      const url = new URL(values.url);
      const hostname = url.hostname;
      
      // Lista de domínios suportados
      const supportedDomains = [
        "youtube.com", "youtu.be", "www.youtube.com",
        "instagram.com", "www.instagram.com",
        "facebook.com", "www.facebook.com", "fb.com", "fb.watch",
        "tiktok.com", "www.tiktok.com", "vm.tiktok.com",
        "twitter.com", "www.twitter.com", "x.com", "t.co",
        "soundcloud.com", "www.soundcloud.com", "snd.sc",
        "twitch.tv", "www.twitch.tv", "clips.twitch.tv",
        "pinterest.com", "www.pinterest.com", "pin.it"
      ];
      
      // Verificar se a URL é suportada
      if (!supportedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
        throw new Error("URL não suportada");
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push(`/download?url=${encodeURIComponent(values.url)}`)
    } catch (error) {
      console.error("Erro ao processar URL:", error);
      let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      
      if (error instanceof Error) {
        if (error.message === "URL não suportada") {
          errorMessage = "URL não suportada. Use links das plataformas suportadas.";
        } else if (error.message.includes("Invalid URL")) {
          errorMessage = "URL inválida. Verifique o endereço e tente novamente.";
        }
      }
      
      toast({
        title: "Erro ao processar URL",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="mb-6">
        <PlatformCarousel />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <div className="flex items-center rounded-full shadow-sm shadow-black/5 overflow-hidden border border-input w-full">
                      <div className="flex items-center pl-4">
                        <LinkIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input
                        {...field}
                        type="url"
                        placeholder="Cole o link aqui..."
                        className="h-14 text-lg border-0 rounded-none shadow-none focus-visible:ring-0 flex-1 pl-2"
                        disabled={loading}
                      />
                      <Button 
                        type="submit" 
                        size="lg" 
                        disabled={loading}
                        className="rounded-full min-w-[120px]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processando
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-5 w-5" />
                            BAIXAR
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-4 flex justify-center"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">
              Plataformas suportadas <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-[220px]">
            <DropdownMenuLabel>Plataformas suportadas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">YouTube</DropdownMenuItem>
            <DropdownMenuItem className="gap-2">Instagram</DropdownMenuItem>
            <DropdownMenuItem className="gap-2">Facebook</DropdownMenuItem>
            <DropdownMenuItem className="gap-2">Twitter</DropdownMenuItem>
            <DropdownMenuItem className="gap-2">SoundCloud</DropdownMenuItem>
            <DropdownMenuItem className="gap-2">Twitch</DropdownMenuItem>
            <DropdownMenuItem className="gap-2">TikTok</DropdownMenuItem>
            <DropdownMenuItem className="gap-2">Pinterest</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </motion.div>
  )
}