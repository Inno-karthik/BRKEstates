"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ChatPropertyContext = { id: string; title: string; slug: string } | null;

type Ctx = { property: ChatPropertyContext; setProperty: (p: ChatPropertyContext) => void };
const ChatContext = createContext<Ctx | null>(null);

export function ChatContextProvider({ children }: { children: ReactNode }) {
  const [property, setProperty] = useState<ChatPropertyContext>(null);
  return <ChatContext.Provider value={{ property, setProperty }}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatContextProvider");
  return ctx;
}

/** Drop this on a property detail page to tell the chat widget which property the
 *  visitor is currently looking at, so it can open with a context-aware greeting. */
export function SetChatPropertyContext({ id, title, slug }: { id: string; title: string; slug: string }) {
  const { setProperty } = useChatContext();
  useEffect(() => {
    setProperty({ id, title, slug });
    return () => setProperty(null);
  }, [id, title, slug, setProperty]);
  return null;
}
