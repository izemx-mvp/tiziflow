import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Minus, X, Send, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "@tanstack/react-router";
import { useT } from "@/i18n";
import { buildCatalog } from "./catalog";
import { motos } from "@/data/motos";
import { circuits } from "@/data/circuits";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { whatsappLink } from "@/config/site";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const STORE = "tiziflow.chat";
const MAX_LEN = 500;
const RATE_WINDOW_MS = 60000;
const RATE_MAX = 12;

export function Chatbot() {
  const { t, lang } = useT();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stamps = useRef<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 2000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE);
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    const dismissed = sessionStorage.getItem("tiziflow.chat.tip");
    if (!dismissed) {
      const id = setTimeout(() => setTooltip(true), 8000);
      return () => clearTimeout(id);
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const dismissTip = () => {
    setTooltip(false);
    sessionStorage.setItem("tiziflow.chat.tip", "1");
  };

  async function send(text: string) {
    const clean = text.trim().slice(0, MAX_LEN);
    if (!clean || streaming) return;

    const now = Date.now();
    stamps.current = stamps.current.filter((s) => now - s < RATE_WINDOW_MS);
    if (stamps.current.length >= RATE_MAX) {
      setError(t.chat.busy);
      return;
    }
    stamps.current.push(now);

    setError(null);
    setInput("");
    const next = [...messages, { role: "user" as const, content: clean }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, catalog: buildCatalog(lang), lang }),
      });

      if (!res.ok || !res.body) {
        setMessages(next);
        setError(res.status === 429 || res.status === 402 ? t.chat.busy : t.chat.error);
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta: string = json.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              acc += delta;
              setMessages([...next, { role: "assistant", content: acc }]);
            }
          } catch {
            /* partial chunk */
          }
        }
      }
    } catch {
      setMessages(next);
      setError(t.chat.error);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {mounted && !open && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2"
          >
            <AnimatePresence>
              {tooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="max-w-[240px] rounded-2xl bg-white px-4 py-3 text-sm shadow-lift"
                >
                  {t.chat.tooltip}
                  <button
                    onClick={dismissTip}
                    aria-label="Fermer"
                    className="ml-2 text-muted-foreground hover:text-petrol"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => {
                setOpen(true);
                dismissTip();
              }}
              aria-label={t.chat.title}
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-petrol text-white shadow-lift transition-transform hover:scale-105"
            >
              <MessageCircle className="h-7 w-7" />
              <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-aqua" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={t.chat.title}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed inset-0 z-50 flex flex-col bg-white sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[600px] sm:w-[400px] sm:rounded-2xl sm:shadow-lift"
          >
            <header className="glass-petrol flex items-center gap-3 rounded-t-none px-4 py-3 text-white sm:rounded-t-2xl">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-petrol">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{t.chat.title}</p>
                <p className="flex items-center gap-1.5 text-[11px] text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-aqua" />
                  {t.chat.subtitle}
                </p>
              </div>
              <button onClick={() => setMessages([])} aria-label={t.chat.newChat}>
                <RotateCcw className="h-4 w-4" />
              </button>
              <button onClick={() => setOpen(false)} aria-label="Réduire">
                <Minus className="h-4 w-4" />
              </button>
              <button onClick={() => setOpen(false)} aria-label="Fermer">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-white p-4">
              <Bubble role="assistant">{t.chat.welcome}</Bubble>
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2">
                  {t.chat.chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => send(c)}
                      className="rounded-full border border-petrol/15 px-3 py-1.5 text-xs font-medium text-petrol transition-colors hover:bg-sand"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i}>
                  <Bubble role={m.role}>
                    {m.content ? (
                      <ReactMarkdown>{stripMarkers(m.content)}</ReactMarkdown>
                    ) : (
                      <TypingDots />
                    )}
                  </Bubble>
                  {m.role === "assistant" && <RichCards content={m.content} />}
                </div>
              ))}
              {error && (
                <div className="rounded-xl bg-sand px-3 py-2 text-xs text-slate-ink">
                  {error}{" "}
                  <Link to="/contact" className="underline">
                    Contact
                  </Link>
                </div>
              )}
            </div>

            <div className="border-t border-petrol/10 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  maxLength={MAX_LEN}
                  disabled={streaming}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.chat.placeholder}
                  aria-label={t.chat.placeholder}
                  className="h-11 flex-1 rounded-full border border-petrol/15 bg-sand px-4 text-sm outline-none focus:border-teal"
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  aria-label="Envoyer"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta text-white disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <div className="mt-2 flex items-center justify-between gap-2">
                <a
                  href={whatsappLink(
                    lang === "fr"
                      ? "Bonjour, je discutais avec l'assistant TiziFlow et j'ai une question."
                      : "Hello, I was chatting with the TiziFlow assistant and have a question.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-teal hover:underline"
                >
                  WhatsApp
                </a>
                <p className="text-[10px] text-muted-foreground">{t.chat.disclaimer}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex", role === "user" ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm [&_p]:m-0 [&_p+p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-4",
          role === "user" ? "bg-petrol text-white" : "bg-sand text-slate-ink",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <span className="flex gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-petrol/50"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

function stripMarkers(text: string) {
  return text.replace(/\[\[(moto|circuit):[a-z0-9-]+\]\]/g, "").trim();
}

function RichCards({ content }: { content: string }) {
  const found = [...content.matchAll(/\[\[(moto|circuit):([a-z0-9-]+)\]\]/g)];
  if (!found.length) return null;
  const seen = new Set<string>();

  return (
    <div className="mt-2 space-y-2">
      {found.map(([, kind, slug]) => {
        const key = `${kind}:${slug}`;
        if (seen.has(key)) return null;
        seen.add(key);

        if (kind === "moto") {
          const m = motos.find((x) => x.slug === slug);
          if (!m) return null;
          return (
            <ChatCard
              key={key}
              image={m.images[0]}
              title={m.name}
              facts={`${m.specs.autonomyKm} km · ${m.pricePerDay} MAD/j`}
              to="/motos/$slug"
              slug={m.slug}
            />
          );
        }
        const c = circuits.find((x) => x.slug === slug);
        if (!c) return null;
        return (
          <ChatCard
            key={key}
            image={c.image}
            title={c.title.fr}
            facts={`${c.distanceKm} km · ${c.pricePerPerson} MAD`}
            to="/circuits/$slug"
            slug={c.slug}
          />
        );
      })}
    </div>
  );
}

function ChatCard({
  image,
  title,
  facts,
  to,
  slug,
}: {
  image: string;
  title: string;
  facts: string;
  to: "/motos/$slug" | "/circuits/$slug";
  slug: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-petrol/10 bg-white p-2 shadow-sm">
      <ImageSlot slot={image} alt={title} className="h-16 w-20 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-petrol">{title}</p>
        <p className="text-xs text-muted-foreground">{facts}</p>
        <div className="mt-1.5 flex gap-2">
          <Link
            to={to}
            params={{ slug }}
            className="rounded-full border border-petrol/15 px-2.5 py-1 text-[11px] font-semibold text-petrol"
          >
            Voir
          </Link>
          <Link
            to="/reservation"
            className="rounded-full bg-terracotta px-2.5 py-1 text-[11px] font-semibold text-white"
          >
            Réserver
          </Link>
        </div>
      </div>
    </div>
  );
}
