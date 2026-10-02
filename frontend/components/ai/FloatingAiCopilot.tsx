'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Zap,
  Battery,
  Sun,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Cpu,
  StopCircle,
  Activity,
  Minimize2,
  Copy,
  Check,
  Lock,
  LogIn,
  AlertTriangle,
  Layers,
  CheckCircle2,
  User,
  Power,
} from 'lucide-react';
import {
  streamAgentChat,
  fetchAiHealth,
  AIHealthResponse,
  ChatHistoryItem,
  approveHitlAction,
} from '@/lib/ai';
import { useTelemetryStore } from '@/features/telemetry/store/telemetry.store';
import { useAuth } from '@/hooks/use-auth';

export interface PendingAction {
  id: string;
  action: string;
  target: string;
  description: string;
  requiresSupervisor?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  modelUsed?: string;
  telemetrySnippet?: Record<string, any>;
  toolsUsed?: string[];
  activeTool?: string;
  pendingAction?: PendingAction;
  actionExecuted?: boolean;
  isStreaming?: boolean;
}

const PUBLIC_PROMPTS = [
  { label: 'What is GridFlowX?', query: 'What is GridFlowX and what problems does it solve for smart microgrids?' },
  { label: 'System Architecture', query: 'Explain the GridFlowX cyber-physical architecture and renewable DER integration.' },
  { label: '3-Tier Load Shedding', query: 'How does the 3-Tier load prioritization and shedding strategy work?' },
  { label: 'Agentic AI Systems', query: 'Explain the 6 specialized AI agents operating in the microgrid.' },
  { label: 'Solar & Battery Tech', query: 'How does GridFlowX coordinate MPPT solar with LiFePO4 battery storage?' },
];

const OPERATOR_PROMPTS = [
  { label: 'Microgrid Status', query: 'What is the current microgrid status and operating mode?' },
  { label: 'Energy Flow', query: 'Explain the current energy flow between solar, battery, and loads.' },
  { label: 'Battery Health', query: 'What is the current battery SoC, temperature, and health margin?' },
  { label: 'Why Grid Power?', query: 'Why is the utility grid currently supplying or not supplying power?' },
  { label: 'Active Alerts', query: 'Are there any active anomalies, faults, or thermal warnings?' },
  { label: 'Shed Tier 3 Load', query: 'I want to shed Tier 3 non-essential loads to minimize electricity cost.' },
];

const SUPERVISOR_PROMPTS = [
  { label: '24h System Health', query: 'Summarize microgrid performance and health over the last 24 hours.' },
  { label: 'Explain Anomalies', query: 'Explain recent Isolation Forest anomaly detections and circuit violations.' },
  { label: 'AI Agent Decisions', query: 'Review recent autonomous dispatch decisions made by the Energy Management Agent.' },
  { label: 'Solar Yield Forecast', query: 'What is the 24-hour projected solar PV generation yield?' },
  { label: 'BESS Degradation', query: 'Evaluate LiFePO4 electrochemical degradation and internal ESR resistance.' },
];

const AUDITOR_PROMPTS = [
  { label: 'Telemetry Summary', query: 'Generate an audit summary of current telemetry and failsafe interlocks.' },
  { label: 'Audit Log Trail', query: 'Show recent episodic memory decisions, overrides, and operator actions.' },
  { label: 'IEEE 1547 Compliance', query: 'Verify utility grid voltage and frequency compliance with IEEE 1547-2018.' },
  { label: 'Fault Diagnostics', query: 'Summarize all recent circuit diagnostics and safety envelope events.' },
];

const ADMIN_PROMPTS = [
  { label: 'System Diagnostics', query: 'Provide a full system diagnostic overview of hardware, edge controller, and AI services.' },
  { label: 'AI Agent Fleet', query: 'What is the active operational state of all specialized AI agents and orchestrators?' },
  { label: 'Relay Matrix State', query: 'Display current 8-channel relay mapping and active contactor configurations.' },
  { label: 'Safety Envelope', query: 'Verify Core 0 hardware failsafe envelope integrity and trip thresholds.' },
];

/**
 * Lightweight, safe Markdown renderer for technical AI explanations
 */
function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-2 text-xs leading-relaxed text-[var(--text-body)] break-words">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Code block
        if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
          const lines = trimmed.slice(3, -3).split('\n');
          const lang = lines[0]?.trim() || '';
          const code = lines.slice(lang ? 1 : 0).join('\n');
          return (
            <pre
              key={idx}
              className="p-2.5 my-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 font-mono text-[11px] text-emerald-400 overflow-x-auto"
            >
              <code>{code}</code>
            </pre>
          );
        }

        // Bullet list
        if (
          trimmed
            .split('\n')
            .every(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))
        ) {
          const items = trimmed.split('\n');
          return (
            <ul key={idx} className="list-disc pl-4 space-y-1 my-1">
              {items.map((item, itemIdx) => {
                const cleaned = item.replace(/^[•\-*]\s*/, '');
                return (
                  <li key={itemIdx}>
                    <InlineMarkdown text={cleaned} />
                  </li>
                );
              })}
            </ul>
          );
        }

        // Numbered list
        if (trimmed.split('\n').every(line => /^\d+\.\s+/.test(line.trim()))) {
          const items = trimmed.split('\n');
          return (
            <ol key={idx} className="list-decimal pl-4 space-y-1 my-1">
              {items.map((item, itemIdx) => {
                const cleaned = item.replace(/^\d+\.\s*/, '');
                return (
                  <li key={itemIdx}>
                    <InlineMarkdown text={cleaned} />
                  </li>
                );
              })}
            </ol>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="leading-relaxed">
            <InlineMarkdown text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
    if (boldMatch) {
      parts.push(
        <strong key={key++} className="font-semibold text-[var(--text-primary)]">
          {boldMatch[2]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 font-mono text-[11px] text-emerald-400 font-medium"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Slice to next special character
    const nextSpecial = remaining.search(/(\*\*|__|`)/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return <>{parts}</>;
}

export function FloatingAiCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [health, setHealth] = useState<AIHealthResponse | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Authenticated context
  const { user, isAuthenticated, role } = useAuth();
  const effectiveRole = isAuthenticated && role ? role.toLowerCase() : 'public';

  const initialWelcomeText = useMemo(() => {
    if (!isAuthenticated) {
      return 'Hello! I am your **GridFlowX Public AI Assistant**. I can help you explore our smart microgrid architecture, renewable DER integration, 3-tier load shedding strategy, and AI agent coordination. *(Sign in to unlock live 1Hz telemetry and operational controls).*';
    }
    return `Hello, **${user?.displayName || user?.email?.split('@')[0] || 'Operator'}**! I am your **GridFlowX AI Copilot** (Role: **${effectiveRole.toUpperCase()}**). All responses are grounded in live 1Hz microgrid sensor telemetry and validated by the hardware safety envelope. How can I assist you today?`;
  }, [isAuthenticated, user, effectiveRole]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'agent',
      text: initialWelcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'Qwen 2.5 (Local Ollama Engine)',
    },
  ]);

  // Update welcome message when auth state changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'msg-welcome') {
        return [
          {
            ...prev[0],
            text: initialWelcomeText,
          },
        ];
      }
      return prev;
    });
  }, [initialWelcomeText]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Live telemetry from global Zustand store
  const { currentFrame } = useTelemetryStore();
  const solarW = currentFrame?.solarPowerW ?? 342.5;
  const loadW = currentFrame?.totalLoadPowerW ?? 48.2;
  const soc = currentFrame?.batterySoc ?? 74.5;
  const gridW = currentFrame?.gridPowerW ?? 0.0;

  // Poll health periodically
  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        const res = await fetchAiHealth();
        if (mounted) setHealth(res);
      } catch {
        if (mounted) {
          setHealth({
            status: 'standby',
            ollama: 'unreachable',
            model: 'qwen2.5:3b',
            detectedModels: [],

            availableTools: [],
            service: 'GridFlowX AI',
            timestamp: new Date().toISOString(),
          });
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Keyboard shortcut Ctrl+K to toggle, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Scroll to bottom on message update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleClearConversation = () => {
    handleStopGeneration();
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'agent',
        text: isAuthenticated
          ? 'Conversation cleared. Live microgrid telemetry monitoring is active. What would you like to inspect?'
          : 'Conversation cleared. How can I help you explore the GridFlowX platform?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: health?.model || 'Qwen 2.5 (Local)',
      },
    ]);
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Human-in-the-Loop (HITL) Action Confirmation Handler
  const handleExecutePendingAction = async (msgId: string, action: PendingAction) => {
    try {
      const res = await approveHitlAction(action.id, true);
      setMessages(prev =>
        prev.map(m =>
          m.id === msgId
            ? {
                ...m,
                actionExecuted: true,
                text: `${m.text}\n\n✅ **Action Authorized & Executed**: \`${action.action}\` completed successfully and recorded to audit log.`,
              }
            : m
        )
      );
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === msgId
            ? {
                ...m,
                actionExecuted: true,
                text: `${m.text}\n\n❌ **Action Failed**: ${err?.message || 'Unauthorized or blocked by hardware safety envelope.'}`,
              }
            : m
        )
      );
    }
  };

  const handleCancelPendingAction = (msgId: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === msgId
          ? {
              ...m,
              actionExecuted: true,
              text: `${m.text}\n\n🚫 **Action Cancelled**: Operation was rejected by operator.`,
            }
          : m
      )
    );
  };

  const handleSendMessage = async (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query || isLoading) return;

    setInputQuery('');
    const userMessageId = `usr-${Date.now()}`;
    const agentMessageId = `agt-${Date.now()}`;

    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const agentMsg: ChatMessage = {
      id: agentMessageId,
      sender: 'agent',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: health?.model || 'Qwen 2.5 (Local)',
      isStreaming: true,
    };

    // Check if query is an operational control action that requires a HITL card
    const qLower = query.toLowerCase();
    const isControlAction =
      isAuthenticated &&
      (effectiveRole === 'operator' || effectiveRole === 'supervisor' || effectiveRole === 'admin') &&
      (qLower.includes('shed') || qLower.includes('turn off') || qLower.includes('switch off') || qLower.includes('disconnect') || qLower.includes('override'));

    if (isControlAction) {
      agentMsg.pendingAction = {
        id: `ACT-${Date.now()}`,
        action: 'RELAY_SHED_TIER3',
        target: 'Channel 2 (Tier 3 Flexible Load)',
        description: 'Disconnect 8-Channel Relay Channel 2 to shed auxiliary load and conserve BESS storage during peak tariff window.',
      };
    }

    setMessages(prev => [...prev, userMsg, agentMsg]);
    setIsLoading(true);

    const historyPayload: ChatHistoryItem[] = messages
      .filter(m => m.sender === 'user' || m.sender === 'agent')
      .slice(-6)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedText = '';

    try {
      await streamAgentChat(
        query,
        historyPayload,
        {
          onStart: modelName => {
            setMessages(prev =>
              prev.map(m => (m.id === agentMessageId ? { ...m, modelUsed: modelName } : m))
            );
          },
          onToken: token => {
            accumulatedText += token;
            setMessages(prev =>
              prev.map(m =>
                m.id === agentMessageId ? { ...m, text: accumulatedText } : m
              )
            );
          },
          onToolStart: toolName => {
            setMessages(prev =>
              prev.map(m =>
                m.id === agentMessageId ? { ...m, activeTool: toolName } : m
              )
            );
          },
          onToolEnd: () => {
            setMessages(prev =>
              prev.map(m =>
                m.id === agentMessageId ? { ...m, activeTool: undefined } : m
              )
            );
          },
          onDone: meta => {
            setMessages(prev =>
              prev.map(m =>
                m.id === agentMessageId
                  ? {
                      ...m,
                      text: accumulatedText || m.text,
                      isStreaming: false,
                      modelUsed: meta.modelUsed || m.modelUsed,
                      telemetrySnippet: isAuthenticated ? meta.telemetrySnippet : undefined,
                      toolsUsed: meta.toolsUsed,
                      activeTool: undefined,
                    }
                  : m
              )
            );
            setIsLoading(false);
            abortControllerRef.current = null;
          },
          onError: err => {
            console.error('[Copilot Error]', err);
            setMessages(prev =>
              prev.map(m =>
                m.id === agentMessageId
                  ? {
                      ...m,
                      text:
                        accumulatedText ||
                        'Unable to connect to local Ollama Qwen 2.5 engine. Please ensure Ollama is running (`ollama serve`).',
                      isStreaming: false,
                    }
                  : m
              )
            );
            setIsLoading(false);
            abortControllerRef.current = null;
          },
        },
        controller.signal
      );
    } catch {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const isOllamaOnline = health?.ollama === 'connected';

  // Determine active quick prompts by role
  const quickPrompts = useMemo(() => {
    if (!isAuthenticated) return PUBLIC_PROMPTS;
    switch (effectiveRole) {
      case 'admin':
        return ADMIN_PROMPTS;
      case 'supervisor':
        return SUPERVISOR_PROMPTS;
      case 'auditor':
        return AUDITOR_PROMPTS;
      case 'operator':
      default:
        return OPERATOR_PROMPTS;
    }
  }, [isAuthenticated, effectiveRole]);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 inline-flex items-center justify-center text-sm font-medium border rounded-full w-14 h-14 bg-black hover:bg-neutral-900 dark:bg-emerald-950 dark:hover:bg-emerald-900 m-0 cursor-pointer border-emerald-500/40 shadow-xl shadow-emerald-500/20 p-0 normal-case leading-5 text-white transition-all duration-300 hover:scale-105 active:scale-95 z-50 group focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title="Ask GridFlowX AI (Ctrl+K)"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform group-hover:rotate-90" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-emerald-400 group-hover:animate-spin" />
            <span
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                isOllamaOnline ? 'bg-emerald-400' : 'bg-amber-400'
              } animate-pulse`}
            />
          </div>
        )}
      </button>

      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="GridFlowX AI Copilot Chat"
          className="fixed bottom-[calc(4.5rem+1rem)] right-4 sm:right-6 bg-[var(--bg-card)]/95 backdrop-blur-xl p-0 rounded-2xl border border-[var(--border-primary)]/60 w-[calc(100vw-2rem)] sm:w-[460px] h-[640px] max-h-[calc(100vh-7rem)] flex flex-col shadow-2xl shadow-black/40 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-primary)]/40 bg-[var(--bg-surface)]/70 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-[var(--text-primary)] tracking-tight">
                    GridFlowX AI Copilot
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Cpu className="w-2.5 h-2.5" /> Qwen 2.5 • Local
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--text-muted)]">
                  {/* Role Badge */}
                  <span className="inline-flex items-center gap-1 font-mono font-semibold text-[9px] px-1.5 py-0.2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-[var(--text-primary)]">
                    <User className="w-2.5 h-2.5 text-emerald-400" />
                    {isAuthenticated ? effectiveRole.toUpperCase() : 'PUBLIC VISITOR'}
                  </span>

                  <span className="inline-flex items-center gap-1 font-medium">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isLoading
                          ? 'bg-amber-400 animate-ping'
                          : isOllamaOnline
                          ? 'bg-emerald-400'
                          : 'bg-amber-400'
                      }`}
                    />
                    {isLoading
                      ? 'Generating...'
                      : isOllamaOnline
                      ? 'Online'
                      : 'Ollama Standby'}
                  </span>

                  {health?.latencyMs && (
                    <span>• {health.latencyMs}ms</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearConversation}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                title="Minimize (Esc)"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-time Telemetry Ribbon (Authenticated) vs Sign-in Banner (Public) */}
          {isAuthenticated ? (
            <div className="px-3.5 py-1.5 bg-[var(--bg-base)]/80 border-b border-[var(--border-primary)]/30 flex items-center justify-between gap-2 text-[10px] font-mono overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-amber-400 font-semibold" title="Active Solar PV Power">
                  <Sun className="w-3 h-3" /> {solarW}W
                </span>
                <span className="flex items-center gap-1 text-cyan-400 font-semibold" title="Total Microgrid Load">
                  <Zap className="w-3 h-3" /> {loadW}W
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold" title="Battery State of Charge">
                  <Battery className="w-3 h-3" /> {soc}%
                </span>
                <span className="flex items-center gap-1 text-indigo-400 font-semibold" title="Utility Grid Exchange">
                  <Activity className="w-3 h-3" /> Grid: {gridW}W
                </span>
              </div>
              <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Core 0 Guarded
              </span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between gap-2 text-[10px] text-emerald-400">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> Public Exploration Mode
              </span>
              <Link
                href="/login"
                className="font-bold underline hover:text-emerald-300 flex items-center gap-0.5"
              >
                <span>Sign In to Unlock Live Telemetry</span>
                <LogIn className="w-2.5 h-2.5" />
              </Link>
            </div>
          )}

          {/* Conversation Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs scroll-smooth">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                } group`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] mb-1 px-1">
                  <span className="font-semibold">
                    {msg.sender === 'user' ? (user?.displayName || 'You') : 'GridFlowX AI'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed relative ${
                    msg.sender === 'user'
                      ? 'bg-black text-white dark:bg-emerald-600 dark:text-white rounded-tr-sm shadow-md'
                      : 'bg-[var(--bg-surface)] border border-[var(--border-primary)]/50 text-[var(--text-primary)] rounded-tl-sm shadow-sm'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <>
                      <MarkdownRenderer content={msg.text} />

                      {msg.isStreaming && (
                        <span className="inline-block w-2 h-3.5 ml-1 bg-emerald-400 animate-pulse align-middle" />
                      )}

                      {/* Active Tool Execution Pill */}
                      {msg.activeTool && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Invoking domain tool: {msg.activeTool}()</span>
                        </div>
                      )}

                      {/* Human-in-the-Loop (HITL) Action Confirmation Card */}
                      {msg.pendingAction && !msg.actionExecuted && !msg.isStreaming && (
                        <div className="mt-3.5 p-3 rounded-xl bg-[var(--bg-base)] border border-amber-500/40 space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-amber-400 font-bold">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Action Confirmation Required</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                            {msg.pendingAction.description}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleExecutePendingAction(msg.id, msg.pendingAction!)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shadow-sm"
                            >
                              <Check className="w-3 h-3" /> Confirm & Execute
                            </button>
                            <button
                              onClick={() => handleCancelPendingAction(msg.id)}
                              className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)]/80 text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-primary)]/40 font-semibold text-[11px] transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Telemetry Citations Badge */}
                      {msg.telemetrySnippet && !msg.isStreaming && (
                        <div className="mt-3 pt-2.5 border-t border-[var(--border-primary)]/20 flex flex-wrap gap-1.5 text-[10px] font-mono">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-amber-400">
                            <Sun className="w-2.5 h-2.5" /> Solar: {msg.telemetrySnippet.solarPowerW}W
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-cyan-400">
                            <Zap className="w-2.5 h-2.5" /> Load: {msg.telemetrySnippet.totalLoadPowerW}W
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-emerald-400">
                            <Battery className="w-2.5 h-2.5" /> SoC: {msg.telemetrySnippet.batterySoc}%
                          </span>
                        </div>
                      )}

                      {/* Tools Used & Action Verification Footnote */}
                      <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-[var(--text-muted)]">
                        {msg.toolsUsed && msg.toolsUsed.length > 0 && !msg.isStreaming ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Grounded: {msg.toolsUsed.join(', ')}</span>
                          </span>
                        ) : (
                          <span />
                        )}

                        {/* Copy Message Button */}
                        {!msg.isStreaming && msg.text && (
                          <button
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 text-[9px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {isLoading && !messages[messages.length - 1]?.text && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-[var(--text-muted)] text-xs max-w-max animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Qwen 2.5 evaluating physical state & telemetry...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Role-Aware Quick Action Suggestions */}
          <div className="px-3.5 py-2 border-t border-[var(--border-primary)]/20 bg-[var(--bg-base)]/50 flex gap-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt.query)}
                disabled={isLoading}
                className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-[var(--bg-surface)] hover:bg-emerald-500/10 border border-[var(--border-primary)]/40 hover:border-emerald-500/40 text-[var(--text-muted)] hover:text-emerald-400 transition-all whitespace-nowrap disabled:opacity-50"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-3 border-t border-[var(--border-primary)]/30 bg-[var(--bg-card)]">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                  placeholder={
                    isAuthenticated
                      ? `Ask GridFlowX AI Copilot (${effectiveRole})...`
                      : 'Ask GridFlowX AI about platform, solar, BESS, shedding...'
                  }
                  disabled={isLoading}
                  className="w-full resize-none py-2 px-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/50 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-all font-sans leading-relaxed disabled:opacity-50"
                />
              </div>

              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1 shadow-md transition-all shrink-0"
                  title="Stop generation"
                >
                  <StopCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputQuery.trim()}
                  className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-500/10 shrink-0"
                  title="Send message (Enter)"
                >
                  <span className="hidden sm:inline">Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
