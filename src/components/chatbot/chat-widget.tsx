"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X, User, Search, MapPin, Phone, RotateCcw, IndianRupee, ListChecks, Sparkles, LandPlot, ArrowDownToLine } from "lucide-react";
import { BlogSidebarPropertyCard } from "@/components/blog-sidebar-property-card";
import { useChatContext } from "@/components/chatbot/chat-context";
import {
  searchPropertiesForBot,
  getBotContext,
  getBotPropertyAnswer,
  submitBotLead,
  type BotSearchFilters,
  type BotPropertyCategory,
} from "@/components/chatbot/actions";
import { WhatsappIcon } from "@/components/social-icons";
import { getCompareIds } from "@/lib/compare";
import { cn } from "@/lib/utils";
import type { Property, PropertyType, Location } from "@/lib/types";

type Stage =
  | "idle"
  | "search_type"
  | "search_budget"
  | "search_results"
  | "locations"
  | "lead_name"
  | "lead_phone"
  | "lead_email";

type IconType = ComponentType<{ size?: number; className?: string }>;
type QuickReply = { label: string; value: string; icon?: IconType };

type ChatMessage =
  | { id: string; from: "bot"; text: string; quickReplies?: QuickReply[] }
  | { id: string; from: "bot"; properties: Property[] }
  | { id: string; from: "user"; text: string };

const BUDGET_OPTIONS: { label: string; min?: number; max?: number }[] = [
  { label: "Under ₹50L", max: 5_000_000 },
  { label: "₹50L – ₹1Cr", min: 5_000_000, max: 10_000_000 },
  { label: "₹1Cr – ₹2Cr", min: 10_000_000, max: 20_000_000 },
  { label: "Above ₹2Cr", min: 20_000_000 },
  { label: "Any budget", min: undefined, max: undefined },
];

function uid() {
  return Math.random().toString(36).slice(2);
}

function findMatchedType(lower: string, types: PropertyType[]) {
  return types.find((t) => lower.includes(t.name.toLowerCase()) || lower.includes(t.slug.replace(/-/g, " ")));
}

function findMatchedLocation(lower: string, locations: Location[]) {
  return locations.find((l) => lower.includes(l.name.toLowerCase()));
}

/** Pulls a budget range out of free text — "under 50L", "above 1.2 crore" — shared by
 *  the general search parser and by the guided search_budget step, so typing an answer
 *  instead of tapping a quick-reply chip still works. */
function parseBudgetFromText(lower: string): { min?: number; max?: number } {
  const croreMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore)/);
  const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:l|lakh|lakhs)/);
  const amount = croreMatch ? parseFloat(croreMatch[1]) * 1e7 : lakhMatch ? parseFloat(lakhMatch[1]) * 1e5 : undefined;
  const result: { min?: number; max?: number } = {};
  if (amount != null) {
    if (/\b(under|below|less than|within|max|upto|up to)\b/.test(lower)) result.max = amount;
    else if (/\b(above|over|more than|min|at least)\b/.test(lower)) result.min = amount;
  }
  return result;
}

/** "3bhk" / "3-bhk" / "3 bhk" all mean the same thing, but property titles consistently
 *  spell it as "3 BHK" (confirmed against real listing titles), so free-text search only
 *  matches if we normalize to that exact spacing before searching. */
function parseBhkFromText(lower: string): number | undefined {
  const match = lower.match(/(\d+)\s*-?\s*bhk/);
  return match ? parseInt(match[1], 10) : undefined;
}

/** Pulls a type/location/budget/BHK filter out of a free-text question, so "3bhk villas in
 *  gachibowli under 1 crore" actually queries the database with those filters instead of
 *  just string-matching the sentence against property titles. */
function parseSearchIntent(text: string, types: PropertyType[], locations: Location[]) {
  const lower = text.toLowerCase();
  const result: { typeSlug?: string; typeName?: string; min?: number; max?: number; locationSlug?: string; locationName?: string; bhk?: number } = {};

  const matchedType = findMatchedType(lower, types);
  if (matchedType) {
    result.typeSlug = matchedType.slug;
    result.typeName = matchedType.name;
  }

  const matchedLocation = findMatchedLocation(lower, locations);
  if (matchedLocation) {
    result.locationSlug = matchedLocation.slug;
    result.locationName = matchedLocation.name;
  }

  result.bhk = parseBhkFromText(lower);
  Object.assign(result, parseBudgetFromText(lower));
  return result;
}

const BASE_GREETING_QUICK_REPLIES: QuickReply[] = [
  { label: "Search Properties", value: "search", icon: Search },
  { label: "Browse Locations", value: "locations", icon: MapPin },
  { label: "Talk to our Team", value: "contact", icon: Phone },
];

export function ChatWidget() {
  const { property: contextProperty } = useChatContext();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [types, setTypes] = useState<PropertyType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  const draft = useRef<{ typeSlug?: string; typeName?: string; min?: number; max?: number; name?: string; phone?: string }>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  // Tracks which property (if any) the greeting was last written for, so navigating to a
  // different property — or away from one — while the widget stays mounted triggers a
  // fresh, correctly-scoped greeting instead of just leaving the old conversation sitting
  // there as if nothing changed.
  const greetedRef = useRef<{ done: boolean; propertyId: string | null }>({ done: false, propertyId: null });

  useEffect(() => {
    getBotContext().then(({ types, locations, whatsapp }) => {
      setTypes(types);
      setLocations(locations);
      setWhatsapp(whatsapp);
    });
  }, []);

  // On mobile, the button only needs to clear the bottom nav (~64px) by default — it
  // only has to sit higher when the sticky property CTA bar or the compare bar is also
  // on screen above the nav (mirrors the same event CompareBar listens for).
  const [hasCompareItems, setHasCompareItems] = useState(false);
  useEffect(() => {
    const update = () => setHasCompareItems(getCompareIds().length > 0);
    update();
    window.addEventListener("bhk-compare-change", update);
    return () => window.removeEventListener("bhk-compare-change", update);
  }, []);
  const needsMobileClearance = !!contextProperty || hasCompareItems;

  function greetingQuickReplies(): QuickReply[] {
    return BASE_GREETING_QUICK_REPLIES;
  }

  function propertyInfoQuickReplies(): QuickReply[] {
    return [
      { label: "Price & Area", value: "info:price", icon: IndianRupee },
      { label: "Specifications", value: "info:specs", icon: ListChecks },
      { label: "Amenities", value: "info:amenities", icon: Sparkles },
      { label: "Nearby Places", value: "info:nearby", icon: LandPlot },
      { label: "Enquire / Get a callback", value: `contact_for:${contextProperty?.title ?? ""}`, icon: Phone },
      { label: "Search other properties", value: "search", icon: Search },
    ];
  }

  useEffect(() => {
    if (!open) return;
    const currentId = contextProperty?.id ?? null;
    if (greetedRef.current.done && greetedRef.current.propertyId === currentId) return;
    const firstTime = !greetedRef.current.done;
    greetedRef.current = { done: true, propertyId: currentId };

    if (contextProperty) {
      pushBot(
        `I see you're checking out ${contextProperty.title}. Ask me anything about it — price, specs, amenities, nearby places — or I can connect you with our team.`,
        propertyInfoQuickReplies()
      );
    } else if (firstTime) {
      pushBot("Hi, I'm the BKR Assistant. I can help you search properties, explore locations, or get our team to call you. What would you like to do?", greetingQuickReplies());
    } else {
      pushBot("Looks like you've moved to a different page — happy to help you search properties, explore locations, or connect you with our team.", greetingQuickReplies());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contextProperty?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function pushBot(text: string, quickReplies?: QuickReply[]) {
    setMessages((prev) => [...prev, { id: uid(), from: "bot", text, quickReplies }]);
  }

  function pushBotProperties(properties: Property[]) {
    setMessages((prev) => [...prev, { id: uid(), from: "bot", properties }]);
  }

  function pushUser(text: string) {
    setMessages((prev) => [...prev, { id: uid(), from: "user", text }]);
  }

  async function withTyping(fn: () => void | Promise<void>) {
    setTyping(true);
    await new Promise((r) => setTimeout(r, 450 + Math.random() * 350));
    await fn();
    setTyping(false);
  }

  function openWhatsapp(context?: string) {
    if (!whatsapp) return;
    const text = context ? `Hi, I'm interested in ${context}` : "Hi, I'd like to know more about your properties.";
    window.open(`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank", "noreferrer");
  }

  function resetToGreeting() {
    draft.current = {};
    setStage("idle");
    pushBot("Sure — let's start over. What would you like to do?", greetingQuickReplies());
  }

  async function runSearch() {
    setStage("search_results");
    await withTyping(async () => {
      const filters: BotSearchFilters = { typeSlug: draft.current.typeSlug, minPrice: draft.current.min, maxPrice: draft.current.max };
      const results = await searchPropertiesForBot(filters);
      const followUps: QuickReply[] = [
        { label: "Get a callback", value: "contact", icon: Phone },
        { label: "New search", value: "search", icon: RotateCcw },
      ];
      if (results.length === 0) {
        pushBot("I couldn't find anything matching that exactly, but our team can help you find something similar. Want me to get our team to call you?", followUps);
        return;
      }
      pushBot(`Found ${results.length} propert${results.length === 1 ? "y" : "ies"} for you:`);
      pushBotProperties(results);
      pushBot("Want our team to call you with more options, or would you like to refine your search?", followUps);
    });
  }

  async function showPropertyInfo(category: BotPropertyCategory) {
    if (!contextProperty) return;
    await withTyping(async () => {
      const answer = await getBotPropertyAnswer(contextProperty.slug, category);
      const quickReplies: QuickReply[] = answer.anchor
        ? [{ label: answer.anchor.label, value: `scroll:${answer.anchor.id}`, icon: ArrowDownToLine }, ...propertyInfoQuickReplies()]
        : propertyInfoQuickReplies();
      pushBot(answer.text, quickReplies);
    });
  }

  async function handleQuickReply(value: string, label: string) {
    pushUser(label);
    setInput("");

    if (value.startsWith("info:")) {
      await showPropertyInfo(value.replace("info:", "") as BotPropertyCategory);
      return;
    }

    if (value === "whatsapp") {
      openWhatsapp(contextProperty?.title);
      return;
    }

    if (value.startsWith("scroll:")) {
      const id = value.replace("scroll:", "");
      setOpen(false);
      // Let the panel's close animation finish before scrolling, so the jump isn't masked.
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
      return;
    }

    if (value === "search") {
      draft.current = {};
      setStage("search_type");
      await withTyping(() => {
        const replies: QuickReply[] = [
          ...types.map((t) => ({ label: t.name, value: `type:${t.slug}:${t.name}` })),
          { label: "Any Type", value: "type::Any" },
        ];
        pushBot("What type of property are you looking for?", replies);
      });
      return;
    }

    if (value === "locations") {
      setStage("locations");
      await withTyping(() => {
        if (locations.length === 0) {
          pushBot("We don't have specific location pages set up just yet — but I can still search all our listings for you!", [
            { label: "Search Properties", value: "search", icon: Search },
          ]);
          return;
        }
        pushBot(
          "Here are the areas we cover:",
          locations.map((l) => ({ label: l.name, value: `loc:${l.slug}:${l.name}`, icon: MapPin }))
        );
      });
      return;
    }

    if (value.startsWith("loc:")) {
      const [, slug, name] = value.split(":");
      await withTyping(() => {
        pushBot(`Opening ${name}'s listings for you in a new view — or I can search across everything if you'd rather stay here.`, [
          { label: `View ${name}`, value: `navigate:/locations/${slug}`, icon: MapPin },
          { label: "Search here instead", value: "search", icon: Search },
        ]);
      });
      return;
    }

    if (value.startsWith("navigate:")) {
      window.open(value.replace("navigate:", ""), "_blank");
      return;
    }

    if (value.startsWith("type:")) {
      const [, slug, name] = value.split(":");
      draft.current.typeSlug = slug || undefined;
      draft.current.typeName = name;
      setStage("search_budget");
      await withTyping(() => {
        pushBot(
          "Got it. What's your budget range?",
          BUDGET_OPTIONS.map((b) => ({ label: b.label, value: `budget:${b.min ?? ""}:${b.max ?? ""}` }))
        );
      });
      return;
    }

    if (value.startsWith("budget:")) {
      const [, min, max] = value.split(":");
      draft.current.min = min ? Number(min) : undefined;
      draft.current.max = max ? Number(max) : undefined;
      await runSearch();
      return;
    }

    if (value.startsWith("contact_for:")) {
      draft.current.typeName = value.replace("contact_for:", "");
      setStage("lead_name");
      await withTyping(() => pushBot("Happy to connect you with our team about this one! What's your name?"));
      return;
    }

    if (value === "contact") {
      setStage("lead_name");
      await withTyping(() => pushBot("Happy to connect you with our team! What's your name?"));
      return;
    }
  }

  async function handleFreeText() {
    const text = input.trim();
    if (!text) return;
    pushUser(text);
    setInput("");

    const lower = text.toLowerCase();

    // Global shortcuts, checked first regardless of stage
    if (/\b(hi|hello|hey|menu|start over|restart)\b/.test(lower) && stage !== "lead_name" && stage !== "lead_phone" && stage !== "lead_email") {
      resetToGreeting();
      return;
    }
    if (/\b(call|contact|agent|talk to|callback|speak to)\b/.test(lower) && stage !== "lead_name" && stage !== "lead_phone" && stage !== "lead_email") {
      await handleQuickReply("contact", "Talk to your team");
      return;
    }
    if (/\b(thanks|thank you|thx|bye|goodbye|see you)\b/.test(lower) && stage !== "lead_name" && stage !== "lead_phone" && stage !== "lead_email") {
      await withTyping(() =>
        pushBot("You're welcome! I'm here whenever you need me — happy house hunting!", greetingQuickReplies())
      );
      return;
    }

    // Typed answers during the guided search flow still work, not just the quick-reply chips.
    if (stage === "search_type") {
      const matchedType = findMatchedType(lower, types);
      if (matchedType) {
        await handleQuickReply(`type:${matchedType.slug}:${matchedType.name}`, matchedType.name);
        return;
      }
      if (/\bany\b/.test(lower)) {
        await handleQuickReply("type::Any", "Any Type");
        return;
      }
    }

    if (stage === "search_budget") {
      const budget = parseBudgetFromText(lower);
      if (budget.min != null || budget.max != null) {
        draft.current.min = budget.min;
        draft.current.max = budget.max;
        await runSearch();
        return;
      }
      if (/\bany\b/.test(lower)) {
        draft.current.min = undefined;
        draft.current.max = undefined;
        await runSearch();
        return;
      }
    }

    if (stage === "lead_name") {
      draft.current.name = text;
      setStage("lead_phone");
      await withTyping(() => pushBot(`Nice to meet you, ${text}! What's the best phone number to reach you on?`));
      return;
    }

    if (stage === "lead_phone") {
      draft.current.phone = text;
      setStage("lead_email");
      await withTyping(() => pushBot("Great — and an email address (optional, you can skip this by typing \"skip\")?"));
      return;
    }

    if (stage === "lead_email") {
      const email = /skip/i.test(text) ? undefined : text;
      await withTyping(async () => {
        const result = await submitBotLead({
          name: draft.current.name ?? "",
          phone: draft.current.phone ?? "",
          email,
          message: draft.current.typeName
            ? `Interested in: ${draft.current.typeName}${draft.current.min || draft.current.max ? ` (budget: ${draft.current.min ? `₹${draft.current.min / 100000}L` : "0"}–${draft.current.max ? `₹${draft.current.max / 100000}L` : "no max"})` : ""}`
            : undefined,
        });
        if (!result.ok) {
          pushBot(result.error ?? "Something went wrong — please try again, or call us directly.");
          return;
        }
        setStage("idle");
        pushBot(`Thanks, ${draft.current.name}! Our team will reach out to you shortly. Anything else I can help with?`, greetingQuickReplies());
        draft.current = {};
      });
      return;
    }

    // When the visitor is on a property page, try answering from that property's real
    // data before falling back to a generic search — this is the bot's main job.
    if (contextProperty) {
      if (/\b(price|cost|budget|cr|lakh|lakhs)\b/.test(lower)) return showPropertyInfo("price");
      if (/\b(amenit|facilit|gym|pool|club)\b/.test(lower)) return showPropertyInfo("amenities");
      if (/\b(spec|bhk|bedroom|sqft|sq ft|carpet|built.?up|area|floor)\b/.test(lower)) return showPropertyInfo("specs");
      if (/\b(nearby|near|distance|school|hospital|metro|location)\b/.test(lower)) return showPropertyInfo("nearby");
      if (/\b(about|describe|overview|tell me|detail)\b/.test(lower)) return showPropertyInfo("overview");
    }

    // Otherwise, try to understand it as a search: pull out a property type, location or
    // budget if mentioned, query the database with those, and only fall back to a plain
    // title/location text search if nothing structured was recognized.
    const intent = parseSearchIntent(text, types, locations);
    await withTyping(async () => {
      // Titles consistently spell it "3 BHK" (space before BHK), so a detected count is
      // searched as that normalized phrase rather than whatever spacing the visitor typed —
      // combined with any type/budget filters rather than instead of them.
      const bhkQuery = intent.bhk != null ? `${intent.bhk} BHK` : undefined;
      const hasStructuredIntent = intent.typeSlug || intent.min != null || intent.max != null || bhkQuery != null;
      const results = await searchPropertiesForBot(
        hasStructuredIntent
          ? { typeSlug: intent.typeSlug, minPrice: intent.min, maxPrice: intent.max, q: bhkQuery }
          : { q: text }
      );

      if (results.length === 0) {
        pushBot(
          "I couldn't find anything matching that exactly — but I can help you search properties, explore locations, or connect you with our team.",
          greetingQuickReplies()
        );
        return;
      }

      const typeDescriptor = [bhkQuery, intent.typeName].filter(Boolean).join(" ") || null;
      const descriptors = [typeDescriptor, intent.locationName].filter(Boolean).join(" in ");
      pushBot(descriptors ? `Here's what I found for ${descriptors}:` : `Here's what I found for "${text}":`);
      pushBotProperties(results);

      if (intent.locationSlug) {
        pushBot(`I'm showing properties site-wide that match — for everything specifically in ${intent.locationName}, check out its location page.`, [
          { label: `View ${intent.locationName}`, value: `navigate:/locations/${intent.locationSlug}`, icon: MapPin },
        ]);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        className={cn(
          "fixed right-4 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary,#7f1d1d)] text-white shadow-xl transition hover:scale-105 md:bottom-6",
          needsMobileClearance ? "bottom-28" : "bottom-20"
        )}
      >
        {open ? <X size={24} /> : <Bot size={26} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[55] flex flex-col overflow-hidden bg-white shadow-2xl md:inset-auto md:bottom-24 md:right-4 md:h-[70vh] md:max-h-[560px] md:w-[92vw] md:max-w-sm md:rounded-2xl md:border md:border-black/5"
          >
            <div className="flex shrink-0 items-center gap-2.5 border-b border-black/5 bg-[var(--color-secondary,#3b0b10)] px-4 py-3.5 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <Bot size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">BKR Assistant</p>
                <p className="flex items-center gap-1 text-[11px] text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online
                </p>
              </div>
              {whatsapp && (
                <button
                  onClick={() => openWhatsapp(contextProperty?.title)}
                  title="Continue on WhatsApp"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white"
                >
                  <WhatsappIcon size={15} className="text-white" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} onQuickReply={handleQuickReply} />
              ))}
              {typing && (
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-neutral-400 shadow-sm w-fit">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" />
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFreeText();
              }}
              className="flex shrink-0 items-center gap-2 border-t border-black/5 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                className="w-full rounded-full border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary,#7f1d1d)]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary,#7f1d1d)] text-white disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageBubble({
  message,
  onQuickReply,
}: {
  message: ChatMessage;
  onQuickReply: (value: string, label: string) => void;
}) {
  if (message.from === "user") {
    return (
      <div className="flex justify-end">
        <div className="flex max-w-[80%] items-start gap-2">
          <p className="rounded-2xl rounded-br-sm bg-[var(--color-primary,#7f1d1d)] px-3.5 py-2.5 text-sm text-white">{message.text}</p>
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-500">
            <User size={12} />
          </span>
        </div>
      </div>
    );
  }

  if ("properties" in message) {
    return (
      <div className="space-y-2">
        {message.properties.map((p) => (
          <BlogSidebarPropertyCard key={p.id} property={p} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary,#7f1d1d)]/10 text-[var(--color-primary,#7f1d1d)]">
        <Bot size={12} />
      </span>
      <div className="max-w-[85%] space-y-2">
        <p className="rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-sm text-neutral-700 shadow-sm">{message.text}</p>
        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.quickReplies.map((q) => (
              <button
                key={q.value}
                onClick={() => onQuickReply(q.value, q.label)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border border-[var(--color-primary,#7f1d1d)]/30 bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-primary,#7f1d1d)] transition hover:bg-[var(--color-primary,#7f1d1d)]/5"
                )}
              >
                {q.icon && <q.icon size={13} />}
                {q.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
