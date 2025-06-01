"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2, 
  Download, 
  FileVideo, 
  FileAudio, 
  Zap, 
  Check, 
  Info,
  ChevronDown,
  ArrowRight,
  Play
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { 
  fetchVideoInfo, 
  fetchDownloadOptions, 
  startDownload,
  checkTaskStatus,
  getDownloadUrl,
  validateUrl,
  type DownloadOption, 
  type VideoPreview,
  mockOptions, 
  mockPreview 
} from "@/lib/download-service"

// Interface para o status da tarefa
interface TaskStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  download_url?: string
  error?: string
}

export default function DownloadPage() {
  const searchParams = useSearchParams()
  const url = searchParams.get("url")
  const [loading, setLoading] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("video")
  const [error, setError] = useState<string | null>(null)
  const [videoInfo, setVideoInfo] = useState<VideoPreview>(mockPreview)
  const [downloadOptions, setDownloadOptions] = useState<DownloadOption[]>(mockOptions)
  const [downloadStarted, setDownloadStarted] = useState(false)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const filteredOptions = downloadOptions.filter(option => option.type === activeTab)

  // Carregar informações do vídeo quando a URL mudar
  useEffect(() => {
    async function loadVideoData() {
      if (!url) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Validar URL antes de fazer requisições
        const validation = validateUrl(url);
        if (!validation.isValid) {
          throw new Error(validation.message || 'URL inválida');
        }
        
        // Buscar informações do vídeo e opções de download da API
        const videoData = await fetchVideoInfo(url);
        const options = await fetchDownloadOptions(url);
        
        setVideoInfo(videoData);
        setDownloadOptions(options);
        
        // Selecionar automaticamente a opção recomendada
        const recommendedOption = options.find(opt => opt.recommended);
        if (recommendedOption) {
          setSelectedQuality(recommendedOption.quality);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do vídeo:', error);
        setError("Não foi possível carregar informações do vídeo. Verifique a URL e tente novamente.");
        
        toast({
          title: "Erro ao carregar dados",
          description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadVideoData();
  }, [url, toast]);

  // Verificar periodicamente o status da tarefa quando um download é iniciado
  useEffect(() => {
    // Função para verificar o status da tarefa
    async function checkStatus() {
      if (!taskId) return;
      
      try {
        const status = await checkTaskStatus(taskId);
        setTaskStatus(status);
        
        // Se o download foi concluído ou falhou, parar de verificar
        if (status.status === 'completed' || status.status === 'failed') {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          
          // Notificar o usuário
          if (status.status === 'completed') {
            toast({
              title: "Download concluído!",
              description: "Seu arquivo está pronto para download.",
            });
          } else if (status.status === 'failed') {
            toast({
              title: "Falha no download",
              description: status.error || "Ocorreu um erro durante o download.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status da tarefa:', error);
        
        // Parar de verificar em caso de erro
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
        toast({
          title: "Erro ao verificar status",
          description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
          variant: "destructive",
        });
      }
    }
    
    // Iniciar verificação periódica quando um download é iniciado
    if (taskId && !pollingInterval) {
      // Verificar imediatamente
      checkStatus();
      
      // Configurar verificação a cada 5 segundos
      const interval = setInterval(checkStatus, 5000);
      setPollingInterval(interval);
      
      // Limpar intervalo ao desmontar o componente
      return () => {
        clearInterval(interval);
      };
    }
  }, [taskId, toast, pollingInterval]);

  // Limpar intervalo ao desmontar o componente
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleDownload = async () => {
    if (!selectedQuality) {
      toast({
        title: "Selecione uma qualidade",
        description: "Por favor, selecione uma qualidade antes de baixar.",
        variant: "destructive",
      });
      return;
    }

    if (!url) {
      toast({
        title: "URL inválida",
        description: "A URL do vídeo é inválida ou não foi fornecida.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Iniciando download para URL: ${url}, Qualidade: ${selectedQuality}`);
      
      // Iniciar download usando o serviço
      const result = await startDownload(url, selectedQuality);
      
      console.log("Resultado do download:", result);
      
      // Armazenar o ID da tarefa para verificação periódica
      if (result.taskId) {
        setTaskId(result.taskId);
        setDownloadStarted(true);
        
        toast({
          title: "Download iniciado!",
          description: "Estamos processando seu download. Você será notificado quando estiver pronto.",
        });
      } else {
        throw new Error("Não foi possível iniciar o download. ID da tarefa não retornado.");
      }
    } catch (error) {
      console.error('Erro ao processar download:', error);
      
      // Extrair mensagem de erro mais específica
      let errorMessage = "Ocorreu um erro ao processar seu download. Tente novamente mais tarde.";
      let errorTitle = "Erro ao processar download";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Tratamento específico para erros conhecidos
        if (errorMessage.includes("validation error") || errorMessage.includes("Dados de requisição inválidos")) {
          errorTitle = "Erro de validação";
          errorMessage = "Os dados fornecidos são inválidos. Por favor, verifique a URL e tente novamente.";
        } else if (errorMessage.includes("UNSUPPORTED_URL") || errorMessage.includes("URL não suportada")) {
          errorTitle = "URL não suportada";
          errorMessage = "Esta URL não é suportada. Por favor, use uma URL de uma das plataformas suportadas.";
        } else if (errorMessage.includes("TIMEOUT") || errorMessage.includes("tempo limite")) {
          errorTitle = "Tempo limite excedido";
          errorMessage = "O servidor demorou muito para responder. Por favor, tente novamente mais tarde.";
        } else if (errorMessage.includes("CONNECTION_ERROR") || errorMessage.includes("conectar com o serviço")) {
          errorTitle = "Erro de conexão";
          errorMessage = "Não foi possível conectar com o servidor. Verifique sua conexão e tente novamente.";
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async () => {
    if (!taskStatus?.download_url && !taskId) return;
    
    try {
      setLoading(true);
      
      // Obter a URL de download real
      const downloadUrl = await getDownloadUrl(taskId!);
      console.log("Abrindo URL para download:", downloadUrl);
      
      // Abrir a URL em uma nova aba para iniciar o download no navegador do usuário
      window.open(downloadUrl, '_blank');
      
      toast({
        title: "Download iniciado!",
        description: "O download deve começar automaticamente. Se não começar, verifique se pop-ups estão permitidos.",
      });
    } catch (error) {
      console.error('Erro ao obter URL de download:', error);
      
      // Extrair mensagem de erro mais específica
      let errorMessage = "Ocorreu um erro ao tentar baixar o arquivo.";
      let errorTitle = "Erro ao baixar arquivo";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Tratamento específico para erros conhecidos
        if (errorMessage.includes("não está concluída")) {
          errorTitle = "Download não concluído";
          errorMessage = "O arquivo ainda não está pronto para download. Por favor, aguarde o processamento ser concluído.";
        } else if (errorMessage.includes("não está disponível")) {
          errorTitle = "Arquivo indisponível";
          errorMessage = "O arquivo de download não está disponível. O processamento pode ter falhado.";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderizar um botão baseado no status da tarefa
  const renderActionButton = () => {
    if (!downloadStarted) {
      return (
        <Button 
          onClick={handleDownload} 
          size="lg" 
          disabled={loading || !selectedQuality}
          className="mt-4 w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processando
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Baixar Agora
            </>
          )}
        </Button>
      );
    }
    
    // Download iniciado, mostrar status
    switch (taskStatus?.status) {
      case 'pending':
        return (
          <Button disabled size="lg" className="mt-4 w-full">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Na fila de processamento...
          </Button>
        );
      
      case 'processing':
        return (
          <Button disabled size="lg" className="mt-4 w-full">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processando... {taskStatus.progress ? `${taskStatus.progress}%` : ''}
          </Button>
        );
      
      case 'completed':
        return (
          <Button 
            onClick={handleDownloadFile} 
            size="lg" 
            className="mt-4 w-full"
            variant="default"
          >
            <Download className="mr-2 h-5 w-5" />
            Baixar Arquivo
          </Button>
        );
      
      case 'failed':
        return (
          <Button 
            onClick={handleDownload} 
            size="lg" 
            className="mt-4 w-full"
            variant="destructive"
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            Tentar Novamente
          </Button>
        );
      
      default:
        return (
          <Button 
            onClick={handleDownload} 
            size="lg" 
            disabled={loading || !selectedQuality}
            className="mt-4 w-full"
          >
            <Download className="mr-2 h-5 w-5" />
            Baixar Agora
          </Button>
        );
    }
  };

  if (!url) {
    return (
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-semibold">URL não encontrada</h1>
          <p className="mt-2 text-muted-foreground">
            Por favor, volte à página inicial e insira uma URL válida.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4 p-6 rounded-lg bg-card">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-lg font-medium">Carregando...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              <p className="font-medium">{error}</p>
            </div>
            <p className="mt-2 text-sm">Verifique o seguinte:</p>
            <ul className="mt-1 text-sm list-disc pl-5">
              <li>A URL do vídeo é válida e acessível</li>
              <li>A plataforma do vídeo é suportada</li>
              <li>Sua conexão com a internet está funcionando</li>
              <li>O serviço de download está online</li>
            </ul>
            <p className="mt-2 text-sm">Tente novamente ou volte à página inicial para inserir uma nova URL.</p>
          </div>
        )}
        
        {/* Status da tarefa */}
        {taskStatus && taskStatus.status !== 'completed' && (
          <div className={cn(
            "mb-6 p-4 rounded-lg border text-card-foreground",
            {
              "border-blue-500/50 bg-blue-500/10": taskStatus.status === 'pending',
              "border-orange-500/50 bg-orange-500/10": taskStatus.status === 'processing',
              "border-destructive/50 bg-destructive/10": taskStatus.status === 'failed'
            }
          )}>
            <div className="flex items-center gap-2">
              {taskStatus.status === 'pending' && <Loader2 className="h-5 w-5 animate-spin" />}
              {taskStatus.status === 'processing' && <Loader2 className="h-5 w-5 animate-spin" />}
              {taskStatus.status === 'failed' && <Info className="h-5 w-5 text-destructive" />}
              
              <p className="font-medium">
                {taskStatus.status === 'pending' && "Download na fila de processamento..."}
                {taskStatus.status === 'processing' && "Processando download..."}
                {taskStatus.status === 'failed' && "Falha no download"}
              </p>
            </div>
            
            {taskStatus.status === 'processing' && taskStatus.progress && (
              <div className="mt-3">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${taskStatus.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1 text-right">{taskStatus.progress}%</p>
              </div>
            )}
            
            {taskStatus.status === 'failed' && taskStatus.error && (
              <p className="mt-2 text-sm text-destructive">{taskStatus.error}</p>
            )}
          </div>
        )}
        
        <Card className="border-none shadow-lg overflow-hidden rounded-xl">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Opções de Download</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Selecione o formato e a qualidade desejada para download</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6 p-4 sm:p-6">
            <div className="md:col-span-2">
              <div className="rounded-xl overflow-hidden bg-muted/30 border shadow-sm">
                <div className="relative aspect-video">
                  <Image 
                    src={videoInfo.thumbnailUrl}
                    alt={videoInfo.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 350px"
                    loading="eager"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="rounded-full bg-white/20 backdrop-blur-sm p-3">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {videoInfo.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2">{videoInfo.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{videoInfo.author}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{videoInfo.viewCount} visualizações</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                    <span>URL: {url.substring(0, 30)}...</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <FileVideo className="h-4 w-4" />
                    <span>Vídeo</span>
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="flex items-center gap-2">
                    <FileAudio className="h-4 w-4" />
                    <span>Áudio</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="video" className="space-y-3">
                  {filteredOptions.map((option) => (
                    <motion.div
                      key={`${option.quality}-${option.format}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "border rounded-lg p-4 cursor-pointer relative overflow-hidden",
                        selectedQuality === option.quality
                          ? "border-primary bg-primary/5 dark:bg-primary/10"
                          : "hover:border-primary/50 dark:hover:border-primary/70"
                      )}
                      onClick={() => setSelectedQuality(option.quality)}
                      tabIndex={0}
                      role="radio"
                      aria-checked={selectedQuality === option.quality}
                      aria-label={`Selecionar qualidade ${option.quality} ${option.format}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedQuality(option.quality);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center",
                            selectedQuality === option.quality
                              ? "border-primary"
                              : "border-muted-foreground/30"
                          )}>
                            {selectedQuality === option.quality && (
                              <div className="w-3 h-3 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{option.quality}</p>
                            <p className="text-xs text-muted-foreground">{option.format} • {option.size}</p>
                          </div>
                        </div>
                        {option.recommended && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-300 dark:border-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Recomendado
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </TabsContent>
                
                <TabsContent value="audio" className="space-y-3">
                  {filteredOptions.map((option) => (
                    <motion.div
                      key={`${option.quality}-${option.format}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "border rounded-lg p-4 cursor-pointer relative overflow-hidden",
                        selectedQuality === option.quality
                          ? "border-primary bg-primary/5 dark:bg-primary/10"
                          : "hover:border-primary/50 dark:hover:border-primary/70"
                      )}
                      onClick={() => setSelectedQuality(option.quality)}
                      tabIndex={0}
                      role="radio"
                      aria-checked={selectedQuality === option.quality}
                      aria-label={`Selecionar qualidade ${option.quality} ${option.format}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedQuality(option.quality);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center",
                            selectedQuality === option.quality
                              ? "border-primary"
                              : "border-muted-foreground/30"
                          )}>
                            {selectedQuality === option.quality && (
                              <div className="w-3 h-3 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{option.quality}</p>
                            <p className="text-xs text-muted-foreground">{option.format} • {option.size}</p>
                          </div>
                        </div>
                        {option.recommended && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-300 dark:border-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Recomendado
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </TabsContent>
              </Tabs>
              
              {renderActionButton()}
              
              {/* Informações adicionais */}
              <div className="mt-6 rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Informações Importantes</span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground space-y-1">
                  <p>• Todos os downloads são processados em nossos servidores</p>
                  <p>• Os arquivos são armazenados temporariamente por 24 horas</p>
                  <p>• Use nosso serviço apenas para conteúdo que você tem direito de baixar</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}