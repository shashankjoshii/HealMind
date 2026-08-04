"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Info, Phone, Send, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { crisisResponseFor, detectCrisisCategory } from "@/lib/safety";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const OPENERS = [
  "I can't sleep — my brain won't stop",
  "I'm dreading work tomorrow",
  "I feel like a fraud",
  "I don't have the energy for anything",
];

/**
 * Canned coach replies. A production build swaps this for a streamed model call
 * — but the crisis check in `send()` must stay client-side AND be re-run
 * server-side, so it can't be bypassed by a modified client.
 */
const REPLIES: { match: RegExp; content: string; suggestions?: string[] }[] = [
  {
    match: /sleep|3am|awake|insomnia|night|tired/i,
    content:
      "Nights are the worst part for a lot of people. There's nothing to distract you, and the same three thoughts get louder.\n\nOne thing that genuinely helps: get out of bed. Lying there rehearsing it teaches your brain that bed is where you ruminate. Ten minutes somewhere else, dim light, no phone, then go back.\n\nWant to try a breathing pacer with me?",
    suggestions: ["Yes, let's breathe", "What else helps?"],
  },
  {
    match: /work|job|boss|burn|exhaust|overwhelm|deadline/i,
    content:
      "That sounds like a lot to be carrying, and the fact that it follows you home is usually the sign that the load itself is the problem — not your ability to handle it.\n\nCan I ask a blunt question? If one thing came off your plate this week, what would you actually pick?",
    suggestions: ["I can't drop anything", "I don't know where to start"],
  },
  {
    match: /fraud|imposter|not good enough|deserve|failure|useless/i,
    content:
      "That feeling is incredibly common in people who are, by any external measure, doing fine — which is part of what makes it so convincing and so unfair.\n\nHere's what I'd ask: what evidence would actually change your mind? If the honest answer is \"nothing would\", that tells you it's a belief you're holding rather than a conclusion you reached.\n\nWhat would you need to see?",
  },
  {
    match: /energy|motivat|can'?t be bothered|pointless|flat|empty|numb/i,
    content:
      "When everything feels flat, waiting to feel motivated is the trap — the motivation tends to arrive after the action, not before it.\n\nSo let's go absurdly small. Not \"sort my life out\". Something like putting three things in the bin, or standing outside for two minutes.\n\nWhat's the smallest version of something you've been putting off?",
    suggestions: ["That still feels like too much", "Okay, I'll try"],
  },
  {
    match: /anxious|anxiety|panic|worry|scared|nervous|spiral/i,
    content:
      "Thank you for saying it plainly. Anxiety gets louder when it's vague, so naming it is genuinely useful rather than just a nice idea.\n\nTwo questions, if you're up for it: where do you feel it in your body right now, and what specifically are you predicting will happen?\n\nVague dread can't be tested. A specific prediction can.",
    suggestions: ["Let's do a grounding exercise", "I don't know what I'm afraid of"],
  },
];

function coachReply(userText: string): ChatMessage {
  const hit = REPLIES.find((r) => r.match.test(userText));
  return {
    id: crypto.randomUUID(),
    role: "coach",
    createdAt: new Date().toISOString(),
    content:
      hit?.content ??
      "Thank you for telling me that. I'm listening.\n\nCan you say a bit more about what that felt like in the moment? Sometimes naming the specific feeling makes it less shapeless.",
    suggestions: hit?.suggestions,
  };
}

export default function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "coach",
      createdAt: new Date().toISOString(),
      content:
        "Hey Alex. I'm here whenever you need to think out loud — no judgement, and nothing you say here leaves this conversation.\n\nWhat's sitting heaviest right now?",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      createdAt: new Date().toISOString(),
      content: trimmed,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Safety check runs before anything else, and short-circuits the normal
    // reply path entirely — the coach does not counsel through a crisis.
    // Routing by category matters: an abuse disclosure needs the domestic
    // abuse line, not a generic suicide hotline.
    const crisis = detectCrisisCategory(trimmed);
    if (crisis) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "coach",
          createdAt: new Date().toISOString(),
          content: crisisResponseFor(crisis),
          safety: "crisis",
        },
      ]);
      return;
    }

    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, coachReply(trimmed)]);
      setTyping(false);
    }, 1100);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-sm">
            Your coach
          </h1>
          <p className="mt-2 text-muted">
            Available any hour. Private, and never judgemental.
          </p>
        </div>
        <Link href="/crisis">
          <Button variant="secondary" size="sm">
            <Phone className="h-4 w-4" />
            Crisis help
          </Button>
        </Link>
      </header>

      {/* Scope disclosure — users should know what this is before they lean on it */}
      <div className="flex items-start gap-3 rounded-2xl border border-calm-200 bg-calm-50 p-4 dark:border-calm-900 dark:bg-calm-950/30">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-calm-600 dark:text-calm-400" />
        <p className="text-sm leading-relaxed text-muted">
          This is an AI, not a therapist. It won&rsquo;t diagnose you or replace
          professional care — and if things get serious, it will point you to
          people who can actually help.
        </p>
      </div>

      <Card className="flex h-[min(70vh,44rem)] flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {messages.map((m) => (
            <Bubble key={m.id} message={m} onSuggestion={send} />
          ))}

          {typing && (
            <div className="flex items-center gap-2 px-1">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-brand text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="flex gap-1 rounded-2xl bg-[var(--surface-muted)] px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-[var(--text-subtle)]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="no-scrollbar overflow-x-auto border-t border-[var(--border)] px-5 py-3">
            <div className="flex min-w-max gap-2">
              {OPENERS.map((o) => (
                <button
                  key={o}
                  onClick={() => send(o)}
                  className="rounded-full border border-[var(--border)] px-3.5 py-1.5 text-sm text-muted transition-colors hover:border-brand-300 hover:text-[var(--text)]"
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-3 border-t border-[var(--border)] p-4"
        >
          <label htmlFor="coach-input" className="sr-only">
            Message your coach
          </label>
          <textarea
            id="coach-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Say what's on your mind…"
            className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3.5 text-[0.9375rem] placeholder:text-[var(--text-subtle)] focus:border-brand-400 focus:bg-[var(--surface)] focus:outline-none focus:ring-4 focus:ring-brand-500/12"
          />
          <Button type="submit" disabled={!input.trim() || typing} aria-label="Send message" className="h-12 w-12 shrink-0 !px-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}

function Bubble({
  message,
  onSuggestion,
}: {
  message: ChatMessage;
  onSuggestion: (text: string) => void;
}) {
  const isUser = message.role === "user";
  const isCrisis = message.safety === "crisis";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex gap-2.5", isUser && "flex-row-reverse")}
    >
      {!isUser && (
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full text-white",
            isCrisis ? "bg-soft-500" : "gradient-brand",
          )}
          aria-hidden="true"
        >
          {isCrisis ? <Phone className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </span>
      )}

      <div className={cn("max-w-[85%] sm:max-w-[72%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-3xl px-4 py-3 text-[0.9375rem] leading-relaxed",
            isUser
              ? "gradient-brand rounded-br-lg text-white"
              : isCrisis
                ? "rounded-bl-lg border-2 border-soft-300 bg-soft-50 dark:border-soft-800 dark:bg-soft-950/40"
                : "rounded-bl-lg bg-[var(--surface-muted)]",
          )}
        >
          {isCrisis && (
            <Badge tone="soft" className="mb-2.5">
              Please read this
            </Badge>
          )}
          {renderMarkdownish(message.content)}
        </div>

        {isCrisis && (
          <Link href="/crisis" className="mt-2.5 inline-block">
            <Button variant="danger" size="sm">
              <Phone className="h-4 w-4" />
              See all helplines
            </Button>
          </Link>
        )}

        {message.suggestions && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {message.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-brand-300 hover:text-[var(--text)]"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** Minimal **bold** support so the crisis message can emphasise phone numbers. */
function renderMarkdownish(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-bold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
