"use client"

import * as React from "react"
import { SendIcon, SparklesIcon, UserIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"


interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const mockResponses: Record<string, string> = {
  estoque:
    "Para verificar o estoque, acesse o menu 'Estoque' na sidebar. Lá você encontra todos os insumos com quantidades atualizadas e pode identificar itens com estoque baixo.",
  produto:
    "Você pode consultar todos os insumos no menu 'Insumos'. Lá é possível filtrar, editar e adicionar novos itens ao catálogo.",
  cliente:
    "Acesse o menu 'Clientes' para visualizar e gerenciar a base de clientes da farmácia.",
  fornecedor:
    "Os fornecedores podem ser consultados no menu 'Fornecedores'. Lá você encontra os principais parceiros de cada insumo.",
  ajuda: "Posso ajudar com: estoque, insumos, clientes e fornecedores. O que você precisa?",
}

function getMockResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const key of Object.keys(mockResponses)) {
    if (lower.includes(key)) return mockResponses[key]
  }
  return "Entendido. Para mais detalhes, pode especificar se a dúvida é sobre estoque, insumos, clientes ou fornecedores?"
}

export function AiAssistantDialog() {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Sou seu assistente da farmácia. Posso ajudar com informações sobre estoque, insumos, clientes e fornecedores. Como posso ajudar?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function handleSend() {
    if (!input.trim()) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const response = getMockResponse(userMsg.content)
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsTyping(false)
    }, 800)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <SparklesIcon className="size-4 text-primary" />
          <span>Falar com Assistente</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] h-[600px] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-primary" />
            Assistente Farmácia
          </DialogTitle>
          <DialogDescription>
            Tire dúvidas sobre estoque, insumos, clientes e mais.
          </DialogDescription>
        </DialogHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <SparklesIcon className="size-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <UserIcon className="size-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <SparklesIcon className="size-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce [animation-delay:0.2s]">●</span>
                  <span className="animate-bounce [animation-delay:0.4s]">●</span>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua pergunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
            >
              <SendIcon className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
