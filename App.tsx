import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Plus, 
  Menu, 
  X, 
  User, 
  LogOut, 
  MessageSquare, 
  History, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2
} from 'lucide-react';
import { cn } from './lib/utils';
import { Message, Chat, User as UserType } from './types';
import emailjs from '@emailjs/browser';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- Constants ---
const APP_NAME = "Aladdin AI v3.0";
const BRAND_ICON = "🧞";

// --- Components ---

const AuthOverlay = ({ onLogin }: { onLogin: (email: string) => void }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Simulate/Run EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_d7q8v4o',
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_9nrhdsl',
        {
          email: email,
          otp: generatedOtp,
          app_name: APP_NAME
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '5IDeLAjB6gy610xIB'
      );

      setSentOtp(generatedOtp);
      console.log("OTP Sent (Demo Mode):", generatedOtp); // For development convenience
    } catch (err) {
      console.error(err);
      setError('Failed to send code. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === sentOtp) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onLogin(email);
    } else {
      setError('Invalid code. Please try again.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md bg-[#171717] border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{BRAND_ICON}</div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">{APP_NAME}</h1>
          <p className="text-gray-400">Enterprise-grade Intelligence</p>
        </div>

        {!sentOtp ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-[#262626] border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button 
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              Send Verification Code
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Enter 6-digit Code</label>
              <input 
                type="text" 
                maxLength={6}
                required
                className="w-full bg-[#262626] border border-white/5 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">Code sent to {email}</p>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button 
              className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-3 rounded-lg transition-all"
            >
              Verify & Login
            </button>
            <button 
              type="button"
              onClick={() => setSentOtp(null)}
              className="w-full text-gray-400 hover:text-white text-sm"
            >
              Return to Email
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={atomDark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={cn("bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono", className)} {...props}>
              {children}
            </code>
          );
        },
        p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="pl-1">{children}</li>,
        blockquote: ({ children }) => <blockquote className="border-l-4 border-zinc-700 pl-4 italic my-4">{children}</blockquote>,
        table: ({ children }) => <div className="overflow-x-auto mb-4 border border-zinc-800 rounded-lg"><table className="min-w-full divide-y divide-zinc-800">{children}</table></div>,
        th: ({ children }) => <th className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-left font-semibold">{children}</th>,
        td: ({ children }) => <td className="px-4 py-2 border-b border-zinc-800">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Initialization ---
  useEffect(() => {
    const savedChats = localStorage.getItem('aladdin_chats');
    const savedUser = localStorage.getItem('aladdin_user');
    
    if (savedChats) setChats(JSON.parse(savedChats));
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    localStorage.setItem('aladdin_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (user) localStorage.setItem('aladdin_user', JSON.stringify(user));
    else localStorage.removeItem('aladdin_user');
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChatId, isStreaming]);

  // --- Logic ---
  const activeChat = chats.find(c => c.id === activeChatId);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now()
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setIsMobileSidebarOpen(false);
  };

  const deleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setChats(chats.filter(c => c.id !== id));
    if (activeChatId === id) setActiveChatId(null);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;

    let chatId = activeChatId;
    if (!chatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
        messages: [],
        createdAt: Date.now()
      };
      setChats([newChat, ...chats]);
      chatId = newChat.id;
      setActiveChatId(chatId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    const currentInput = input;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Update messages locally
    setChats(prev => prev.map(c => 
      c.id === chatId ? { ...c, messages: [...c.messages, userMessage] } : c
    ));

    // Handle Image Generation Command
    if (currentInput.toLowerCase().startsWith('generate a realistic image of')) {
      const topic = currentInput.toLowerCase().replace('generate a realistic image of', '').trim();
      generateImage(topic, chatId);
      return;
    }

    // Call AI API
    await streamAIResponse(currentInput, chatId);
  };

  const generateImage = async (topic: string, chatId: string) => {
    setIsStreaming(true);
    const assistantMessageId = (Date.now() + 1).toString();
    
    // Initial loading message
    setChats(prev => prev.map(c => 
      c.id === chatId ? { 
        ...c, 
        messages: [...c.messages, {
          id: assistantMessageId,
          role: 'assistant',
          content: '🧞 Generating your masterpiece...',
          timestamp: Date.now()
        }] 
      } : c
    ));

    const enhancedPrompt = `${topic}, photorealistic, 4k, highly detailed, masterfully lit, digital art, sharp focus, vibrant colors`;
    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;

    // Simulate short delay for "Magic"
    setTimeout(() => {
      const finalContent = `Here is your realistic image of **${topic}**:\n\n![${topic}](${imageUrl})`;
      setChats(prev => prev.map(c => 
        c.id === chatId ? { 
          ...c, 
          messages: c.messages.map(m => m.id === assistantMessageId ? { ...m, content: finalContent } : m)
        } : c
      ));
      setIsStreaming(false);
    }, 2000);
  };

  const streamAIResponse = async (userPrompt: string, chatId: string) => {
    setIsStreaming(true);
    const assistantMessageId = (Date.now() + 1).toString();
    
    setChats(prev => prev.map(c => 
      c.id === chatId ? { 
        ...c, 
        messages: [...c.messages, {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: Date.now()
        }] 
      } : c
    ));

    try {
      const history = chats.find(c => c.id === chatId)?.messages || [];
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userPrompt }],
          stream: true
        })
      });

      if (!response.ok) throw new Error('API Error');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices[0]?.delta?.content || '';
                fullContent += content;
                
                setChats(prev => prev.map(c => 
                  c.id === chatId ? { 
                    ...c, 
                    messages: c.messages.map(m => m.id === assistantMessageId ? { ...m, content: fullContent } : m)
                  } : c
                ));
              } catch (e) {
                // Ignore parse errors for partial chunks
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setChats(prev => prev.map(c => 
        c.id === chatId ? { 
          ...c, 
          messages: c.messages.map(m => m.id === assistantMessageId ? { ...m, content: "🧞 I'm sorry, I encountered a magic glitch. Please check your connection or API key." } : m)
        } : c
      ));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('aladdin_user');
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    setInput(textarea.value);
  };

  if (!user) {
    return <AuthOverlay onLogin={(email) => setUser({ email, isLoggedIn: true })} />;
  }

  return (
    <div className="flex h-screen bg-[#0D0D0D] overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className={cn(
          "bg-[#000] border-r border-white/5 flex flex-col transition-all duration-300 relative",
          !isSidebarOpen && "invisible pointer-events-none"
        )}
      >
        <div className="p-4 flex flex-col h-full">
          <button 
            onClick={createNewChat}
            className="flex items-center gap-3 px-3 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-all text-sm font-medium mb-6"
          >
            <Plus size={16} />
            New Chat
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 mb-4">
            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold px-3 mb-2 flex items-center gap-2">
              <History size={12} />
              Recent History
            </h3>
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all group",
                  activeChatId === chat.id ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                )}
              >
                <div className="flex items-center gap-3 truncate">
                  <MessageSquare size={16} className={cn(activeChatId === chat.id ? "text-brand" : "text-zinc-500")} />
                  <span className="truncate">{chat.title}</span>
                </div>
                <button 
                  onClick={(e) => deleteChat(e, chat.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </button>
            ))}
            {chats.length === 0 && (
              <p className="text-zinc-600 text-xs text-center mt-10 italic">No magic memories yet...</p>
            )}
          </div>

          <div className="mt-auto border-t border-white/5 pt-4">
            <div className="flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-lg transition-all mb-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-bold ring-1 ring-brand/30">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <p className="text-xs font-medium text-white truncate">{user.email}</p>
                <p className="text-[10px] text-zinc-500">Premium Explorer</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#0A0A0A] z-50 p-4 lg:hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{BRAND_ICON}</span>
                  <span className="font-bold text-lg">{APP_NAME}</span>
                </div>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 text-zinc-400">
                  <X />
                </button>
              </div>
              
              <button 
                onClick={createNewChat}
                className="flex items-center gap-3 px-3 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-all text-sm font-medium mb-6"
              >
                <Plus size={16} />
                New Chat
              </button>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {chats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => { setActiveChatId(chat.id); setIsMobileSidebarOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left mb-1 transition-all",
                      activeChatId === chat.id ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5"
                    )}
                  >
                    <MessageSquare size={16} />
                    <span className="truncate">{chat.title}</span>
                  </button>
                ))}
              </div>

              <div className="mt-auto border-t border-white/5 pt-4">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white rounded-lg transition-all text-sm"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 z-10 bg-[#0D0D0D]/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hidden lg:block"
            >
              {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
            <button 
              onClick={() => setIsMobileSidebarOpen(true)} 
              className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="lg:hidden text-lg">{BRAND_ICON}</span>
              <h2 className="text-sm font-semibold text-zinc-200 truncate max-w-[200px]">
                {activeChat ? activeChat.title : APP_NAME}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <div className="px-2 py-1 bg-brand/10 border border-brand/20 rounded-md">
                <p className="text-[10px] font-bold text-brand tracking-wider">Llama-3.3 70B</p>
             </div>
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-8xl mb-8 filter drop-shadow-[0_0_20px_rgba(124,58,237,0.3)]"
              >
                {BRAND_ICON}
              </motion.div>
              <h1 className="text-4xl font-display font-bold text-white mb-4">How can I assist you today?</h1>
              <p className="text-zinc-400 text-lg mb-12">I'm Aladdin, your realistic AI companion. Ask me facts, code, or even to generate a masterpiece.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {[
                  { icon: <MessageSquare className="text-blue-400" />, text: "Explain quantum entanglement in simple terms" },
                  { icon: <Plus className="text-green-400" />, text: "Write a React hook for local storage persistence" },
                  { icon: <ImageIcon className="text-orange-400" />, text: "Generate a realistic image of a cyberpunk city sunset" },
                  { icon: <History className="text-purple-400" />, text: "Summarize the history of the Fibonacci sequence" }
                ].map((suggestion, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setInput(suggestion.text); handleSendMessage(); }}
                    className="p-4 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 rounded-xl text-left text-sm transition-all flex items-start gap-3 group"
                  >
                    <span className="p-2 bg-zinc-800 rounded-lg group-hover:scale-110 transition-transform">
                      {suggestion.icon}
                    </span>
                    <span className="text-zinc-300 pt-1">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-10 px-4 space-y-10">
              {activeChat.messages.map((message) => (
                <div key={message.id} className="group relative">
                  <div className={cn(
                    "flex gap-5",
                    message.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm ring-1",
                      message.role === 'user' 
                        ? "bg-zinc-800 text-zinc-400 ring-white/10" 
                        : "bg-brand/20 text-brand ring-brand/30"
                    )}>
                      {message.role === 'user' ? <User size={18} /> : <span>{BRAND_ICON}</span>}
                    </div>
                    <div className={cn(
                      "flex flex-col gap-1 max-w-[85%]",
                      message.role === 'user' ? "items-end" : "items-start"
                    )}>
                       <div className={cn(
                          "px-4 py-3 rounded-2xl text-[15px] leading-relaxed",
                          message.role === 'user' 
                            ? "bg-[#2A2A2A] text-white border border-white/5" 
                            : "prose prose-invert prose-brand max-w-none text-zinc-200"
                        )}>
                          {message.role === 'assistant' ? (
                            <MarkdownRenderer content={message.content} />
                          ) : (
                            message.content
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-600 mt-1 px-2">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 bg-[#0D0D0D] p-4 lg:p-8 pt-0">
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute inset-0 bg-brand/5 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <form 
              onSubmit={handleSendMessage}
              className="relative bg-[#1A1A1A] border border-white/10 rounded-2xl px-4 py-3 flex flex-col shadow-xl focus-within:border-brand/40 transition-colors"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleInputResize}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask Aladdin anything..."
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white text-[15px] resize-none overflow-y-auto min-h-[24px] max-h-[200px] leading-relaxed py-1"
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                   <button 
                    type="button"
                    onClick={() => {
                        if (!input.includes('Generate a realistic image of')) {
                            setInput('Generate a realistic image of ' + input);
                        }
                    }}
                    className="p-1.5 hover:bg-white/5 rounded text-zinc-400 hover:text-orange-400 transition-colors"
                    title="Magic Image Mode"
                   >
                    <ImageIcon size={18} />
                   </button>
                   <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-tight">Shift + Enter for new line</p>
                </div>
                <button 
                  disabled={!input.trim() || isStreaming}
                  className={cn(
                    "p-2 bg-brand text-white rounded-xl transition-all flex items-center justify-center min-w-[40px]",
                    (!input.trim() || isStreaming) ? "opacity-30 cursor-not-allowed scale-95" : "hover:bg-brand-dark hover:scale-105 active:scale-95 shadow-[0_0_15px_-5px_rgba(124,58,237,0.5)]"
                  )}
                >
                  {isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </form>
            <p className="text-center text-[10px] text-zinc-600 mt-3">
              Aladdin AI v3.0 can make mistakes. Verify important factual data.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
