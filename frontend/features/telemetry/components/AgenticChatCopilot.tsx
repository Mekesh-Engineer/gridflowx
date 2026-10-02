'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Zap,
  Battery,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Sun,
  Layers,
  ArrowRight,
  StopCircle,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  streamAgentChat,
  planAgentGoal,
  fetchAiHealth,
  AIHealthResponse,
  AgentPlanResponse,
  ChatHistoryItem,
} from '@/lib/ai';
import { useTelemetryStore } from '../store/telemetry.store';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  modelUsed?: string;
  telemetrySnippet?: Record<string, any>;
  toolsUsed?: string[];
  activeTool?: string;
  isStreaming?: boolean;
}

const QUICK_PROMPTS = [
  'Why is the battery charging right now?',
  'What is the projected 24-hour solar generation yield?',
  'Shed Tier 3 non-essential loads for peak tariff saving',
  'Inspect microgrid for thermal stress or anomaly faults',
];

export function AgenticChatCopilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-0',
      sender: 'agent',
      text: 'Hello, Operator! I am your local GridFlowX Cyber-Physical Assistant, powered by Qwen 2.5 3B. All queries are grounded in active 1Hz telemetry and verified by the hardware failsafe envelope.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'qwen2.5:3b (Local Ollama Engine)',

      telemetrySnippet: {
        solarPowerW: 342.2,
        totalLoadPowerW: 48.2,
        batterySoc: 74.5,
      },
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<AgentPlanResponse | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [health, setHealth] = useState<AIHealthResponse | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { currentFrame } = useTelemetryStore();
  const solarW = currentFrame?.solarPowerW ?? 342.5;
  const loadW = currentFrame?.totalLoadPowerW ?? 48.2;
  const soc = currentFrame?.batterySoc ?? 74.5;

  useEffect(() => {
    fetchAiHealth().then(setHealth).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsgId = `usr-${Date.now()}`;
    const agentMsgId = `agt-${Date.now()}`;

    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const agentMsg: Message = {
      id: agentMsgId,
      sender: 'agent',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: health?.model || 'qwen2.5:3b (Local)',

      isStreaming: true,
    };

    setMessages(prev => [...prev, userMsg, agentMsg]);
    setInputQuery('');
    setIsLoading(true);

    const historyPayload: ChatHistoryItem[] = messages
      .slice(-6)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    const controller = new AbortController();
    abortControllerRef.current = controller;
    let accumulated = '';

    try {
      await streamAgentChat(
        q,
        historyPayload,
        {
          onStart: model => {
            setMessages(prev =>
              prev.map(m => (m.id === agentMsgId ? { ...m, modelUsed: model } : m))
            );
          },
          onToken: token => {
            accumulated += token;
            setMessages(prev =>
              prev.map(m => (m.id === agentMsgId ? { ...m, text: accumulated } : m))
            );
          },
          onToolStart: tool => {
            setMessages(prev =>
              prev.map(m => (m.id === agentMsgId ? { ...m, activeTool: tool } : m))
            );
          },
          onToolEnd: () => {
            setMessages(prev =>
              prev.map(m => (m.id === agentMsgId ? { ...m, activeTool: undefined } : m))
            );
          },
          onDone: meta => {
            setMessages(prev =>
              prev.map(m =>
                m.id === agentMsgId
                  ? {
                      ...m,
                      text: accumulated || m.text,
                      isStreaming: false,
                      modelUsed: meta.modelUsed || m.modelUsed,
                      telemetrySnippet: meta.telemetrySnippet,
                      toolsUsed: meta.toolsUsed,
                      activeTool: undefined,
                    }
                  : m
              )
            );
            setIsLoading(false);
            abortControllerRef.current = null;
          },
          onError: () => {
            setMessages(prev =>
              prev.map(m =>
                m.id === agentMsgId
                  ? {
                      ...m,
                      text:
                        accumulated ||
                        'Unable to process query via local Ollama engine. Please verify that Ollama is running (`ollama serve`).',
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

  const handlePlanGoal = async (goal: string) => {
    if (planLoading) return;
    setPlanLoading(true);
    try {
      const res = await planAgentGoal(goal);
      setActivePlan(res);
    } catch (err) {
      console.error('Plan decomposition error:', err);
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 overflow-hidden shadow-xl shadow-black/10 min-h-[620px] max-h-[750px]">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-primary)]/30 bg-[var(--bg-base)]/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">Agentic AI Copilot</h2>
                <span className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Cpu className="w-2.5 h-2.5" /> {health?.model || 'Qwen 2.5'} (Local Ollama)
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Grounded in 1Hz microgrid sensor telemetry & deterministic safety rules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/30 text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> Failsafe: ACTIVE
            </span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] mb-1 px-1">
                <span>{msg.sender === 'user' ? 'Operator' : 'Qwen 2.5'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-[var(--color-primary)] text-white rounded-tr-sm shadow-md'
                    : 'bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-[var(--text-primary)] rounded-tl-sm'
                }`}
              >
                {msg.text}

                {msg.isStreaming && (
                  <span className="inline-block w-2 h-3.5 ml-1 bg-emerald-400 animate-pulse align-middle" />
                )}

                {msg.activeTool && (
                  <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Invoking {msg.activeTool}()...
                  </div>
                )}

                {/* Telemetry Citations Badge */}
                {msg.telemetrySnippet && !msg.isStreaming && (
                  <div className="mt-3 pt-2.5 border-t border-[var(--border-primary)]/20 flex flex-wrap gap-2 text-[10px] font-mono">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-primary)]/30 text-amber-300">
                      <Sun className="w-2.5 h-2.5" /> Solar: {msg.telemetrySnippet.solarPowerW}W
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-primary)]/30 text-cyan-300">
                      <Zap className="w-2.5 h-2.5" /> Load: {msg.telemetrySnippet.totalLoadPowerW}W
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-primary)]/30 text-emerald-300">
                      <Battery className="w-2.5 h-2.5" /> SoC: {msg.telemetrySnippet.batterySoc}%
                    </span>
                  </div>
                )}

                {msg.toolsUsed && msg.toolsUsed.length > 0 && !msg.isStreaming && (
                  <div className="mt-1.5 flex items-center gap-1 text-[9px] font-mono text-[var(--text-muted)]">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Tools: {msg.toolsUsed.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && !messages[messages.length - 1]?.text && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-primary)]/30 text-[var(--text-muted)] text-xs max-w-max animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--color-primary)]" />
              <span>Qwen 2.5 generating grounded telemetry response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-[var(--border-primary)]/20 bg-[var(--bg-base)]/30 flex gap-2 overflow-x-auto scrollbar-none">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--color-primary)]/10 border border-[var(--border-primary)]/40 hover:border-[var(--color-primary)]/40 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-all whitespace-nowrap disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-[var(--border-primary)]/30 bg-[var(--bg-base)] flex gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder="Ask Qwen 2.5 about live telemetry, load shedding, solar forecast..."
            disabled={isLoading}
            className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all font-sans"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={handleStopGeneration}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[var(--color-primary)]/20"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Side Planning & Orchestration Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Goal Planning Tool */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-primary)]/30">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-[var(--text-primary)]">Autonomous Goal Planner</h3>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            Decompose high-level microgrid objectives into safe, executable DAG sub-tasks.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => handlePlanGoal('Shed Tier 3 loads for peak tariff shaving')}
              disabled={planLoading}
              className="w-full text-left p-2.5 rounded-xl bg-[var(--bg-base)] hover:bg-[var(--color-primary)]/10 border border-[var(--border-primary)]/30 text-xs transition-all flex items-center justify-between group"
            >
              <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-primary)]">
                Peak Tariff Shaving Plan
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => handlePlanGoal('Evaluate 24h solar forecast against expected demand')}
              disabled={planLoading}
              className="w-full text-left p-2.5 rounded-xl bg-[var(--bg-base)] hover:bg-[var(--color-primary)]/10 border border-[var(--border-primary)]/30 text-xs transition-all flex items-center justify-between group"
            >
              <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-primary)]">
                Solar vs Demand Balance
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {activePlan && (
            <div className="mt-4 pt-3 border-t border-[var(--border-primary)]/30 space-y-2.5">
              <span className="text-[10px] font-mono font-bold text-indigo-400">
                DECOMPOSED PLAN STEPS:
              </span>
              <div className="space-y-2">
                {activePlan.proposedPlan.map((step, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/20 text-[11px] space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-amber-300">
                        {i + 1}. {step.action}
                      </span>
                      <span className="text-[9px] font-mono text-[var(--text-muted)]">
                        {step.service}
                      </span>
                    </div>
                    <p className="text-[var(--text-muted)]">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Local Ollama Health Card */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">LOCAL INFERENCE</span>
            <span
              className={`w-2 h-2 rounded-full ${
                health?.ollama === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-bold text-[var(--text-primary)]">{health?.model || 'Qwen 2.5 3B'}</p>

            <p className="text-[11px] text-[var(--text-muted)]">
              Status: {health?.status === 'ready' ? 'Ready (Local Inference Active)' : 'Standby (Physics Fallback)'}
            </p>
            <p className="text-[11px] text-emerald-400 font-mono">
              Endpoint: {health?.diagnostics?.endpoint || 'http://127.0.0.1:11434'}
            </p>
            {health?.latencyMs && (
              <p className="text-[10px] font-mono text-[var(--text-muted)]">
                Latency: {health.latencyMs}ms
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
