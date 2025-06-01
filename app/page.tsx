import { DownloadForm } from "@/components/download-form"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      <section className="w-full bg-background">
        <div className="container mx-auto flex flex-col items-center justify-center space-y-8 py-24 md:py-32">
          <div className="w-full max-w-[980px] flex flex-col items-center space-y-4 text-center">
            <h1 className="animate-fade-up text-2xl sm:text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
              Baixe conteúdo de qualquer plataforma em segundos
            </h1>
            <p className="animate-fade-up max-w-[750px] text-base sm:text-lg text-muted-foreground sm:text-xl">
              Vídeos, áudios, fotos de perfil e muito mais - tudo em um só lugar
            </p>
          </div>
          <div className="w-full max-w-[980px]">
            <DownloadForm />
          </div>
        </div>
      </section>
      <Features />
      <HowItWorks />
    </div>
  )
}