'use client';

import React, { useState } from 'react';
import { sendToAgent } from "@/lib/api";

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "model"; content: string }[]>([
    {
      role: "model",
      content:
        "Hi! I can help you interpret the SEIRD simulation and compare different policy scenarios.",
    },
  ]);

  async function handleSend() {
    if (!input.trim()) return;
    const userMessage = { role: "user" as const, content: input.trim() };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");

    try {
      const res = await sendToAgent(
        newHistory.map((m) => ({ role: m.role, content: m.content }))
      );
      if (res && res.response) {
        setMessages((prev) => [...prev, { role: "model", content: res.response }]);
      }
    } catch (e) {
      console.error("Agent call failed", e);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Collapsed button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 shadow-xl shadow-sky-900/40 border border-sky-400/60"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/80 text-xs font-semibold border border-sky-300/70">
            AI
          </span>
          <span className="text-sm font-medium">AI Assistant</span>
        </button>
      )}

      {/* Expanded chat window */}
      {open && (
        <div className="w-80 h-96 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl shadow-slate-900/70 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
            <div>
              <p className="text-sm font-semibold text-slate-50">AI Assistant</p>
              <p className="text-[11px] text-slate-400">Ask about trends, policies, and outbreaks.</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-100 text-xs px-2 py-1 rounded-md hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={
                  m.role === "model"
                    ? "max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-800 text-slate-50 px-3 py-2"
                    : "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-sky-600 text-white px-3 py-2"
                }
              >
                {m.content}
              </div>
            ))}
            {/* typing indicator while waiting for agent */}
            {/* we could track a 'loading' flag for prettier dots; for now, use console errors if call fails */}
          </div>

          <div className="border-t border-slate-800 bg-slate-900/80 px-3 py-2 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the AI assistant about this simulation..."
              className="flex-1 rounded-md bg-slate-900 text-slate-100 text-xs px-3 py-2 border border-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-slate-500"
            />
            <button
              onClick={handleSend}
              className="text-xs px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
