import React, { useState, useEffect, useRef } from 'react';

const SUGGESTED_PROMPTS = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    text: "How to spot phishing emails?"
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    text: "Is this website safe to use?"
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    text: "How do I report a scam?"
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    text: "Tips to protect my personal data"
  }
];

const CybersecurityChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // On mobile (< 1024px), default to closed. On desktop, check localStorage
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) return false;
      const saved = localStorage.getItem('sidebarOpen');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedChatIndex, setSelectedChatIndex] = useState(-1);
  const chatHistoryRef = useRef(null);
  const textareaRef = useRef(null);
  const sidebarListRef = useRef(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      // Convert date strings back to Date objects
      const restored = parsed.map(chat => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        messages: chat.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      setChatHistory(restored);
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  // Detect scroll position for "scroll to bottom" button
  useEffect(() => {
    const chatContainer = chatHistoryRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, [messages]);

  // Keyboard navigation in sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isSidebarOpen || chatHistory.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedChatIndex(prev => 
          prev < chatHistory.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedChatIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' && selectedChatIndex >= 0) {
        e.preventDefault();
        loadChat(chatHistory[selectedChatIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, chatHistory, selectedChatIndex]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [inputValue]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const callGeminiAPI = async (prompt) => {
    console.warn("Gemini API call skipped while backend access is disabled.");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `I'm currently in offline mode, but here's a quick cybersecurity tip: Always verify sender identities before clicking links or sharing information. Stay vigilant! 

You asked: "${prompt}"

For comprehensive guidance, please try again when the service is online.`;
  };

  const sendMessage = async (promptText = null) => {
    const messageText = promptText || inputValue.trim();
    if (!messageText || isLoading) return;

    // Create new chat if this is the first message
    if (messages.length === 0 && !currentChatId) {
      const newChatId = Date.now();
      const newChat = {
        id: newChatId,
        title: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setChatHistory(prev => [newChat, ...prev]);
      setCurrentChatId(newChatId);
    }

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await callGeminiAPI(messageText);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Oops! Something went wrong. Please try again later.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleNewChat = () => {
    // Save current chat to history if it has messages
    if (messages.length > 0 && currentChatId) {
      const chatTitle = messages[0].text.substring(0, 50) + (messages[0].text.length > 50 ? '...' : '');
      setChatHistory(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, title: chatTitle, messages, updatedAt: new Date() }
          : chat
      ));
    }
    
    // Create new chat
    const newChatId = Date.now();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([]);
    setInputValue('');
  };

  const loadChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setIsLoadingChat(true);
      setCurrentChatId(chatId);
      
      // Simulate loading delay for smooth UX
      setTimeout(() => {
        setMessages(chat.messages);
        setIsLoadingChat(false);
        // Focus on textarea after loading
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 300);
    }
  };

  const deleteChat = (chatId) => {
    setChatHistory(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([]);
    }
    setDeleteConfirmId(null);
  };

  const handleDeleteClick = (chatId) => {
    setDeleteConfirmId(chatId);
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setDeleteConfirmId(null);
    }, 3000);
  };

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const regenerateMessage = async (messageId) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;

    const userMessage = messages[messageIndex - 1];
    if (userMessage.sender !== 'user') return;

    setIsLoading(true);

    try {
      const response = await callGeminiAPI(userMessage.text);
      
      setMessages(prev => {
        const updated = [...prev];
        updated[messageIndex] = {
          ...updated[messageIndex],
          text: response,
          timestamp: new Date()
        };
        return updated;
      });
    } catch (error) {
      console.error("Error regenerating message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportChat = () => {
    if (messages.length === 0) return;

    const chatTitle = chatHistory.find(c => c.id === currentChatId)?.title || 'Chat Export';
    const timestamp = new Date().toLocaleString();
    
    let content = `CyberSafe AI Chat Export\n`;
    content += `Title: ${chatTitle}\n`;
    content += `Exported: ${timestamp}\n`;
    content += `${'='.repeat(60)}\n\n`;

    messages.forEach((msg, index) => {
      const sender = msg.sender === 'user' ? 'You' : 'CyberSafe AI';
      const time = new Date(msg.timestamp).toLocaleTimeString();
      content += `[${time}] ${sender}:\n${msg.text}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybersafe-chat-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatMessage = (text) => {
    const boldText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const italicText = boldText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    const formattedText = italicText.replace(/\n/g, '<br>');
    return { __html: formattedText };
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Sidebar - Responsive with overlay on mobile */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
        isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-0'
      }`}>
        <div className={`flex h-16 items-center justify-between border-b border-slate-200 px-4 ${!isSidebarOpen && 'lg:hidden'}`}>
          <h2 className="text-sm font-semibold text-slate-900">Chat History</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-3 ${!isSidebarOpen && 'lg:hidden'}`}>
          <button
            onClick={handleNewChat}
            className="mb-3 flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            aria-label="Start new chat"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>

          <div className="space-y-1">
            {chatHistory.map((chat, index) => (
              <div
                key={chat.id}
                className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-cyan-50 text-cyan-900'
                    : selectedChatIndex === index
                    ? 'bg-slate-200 text-slate-900'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <button
                  onClick={() => loadChat(chat.id)}
                  className="flex-1 truncate text-left"
                  aria-label={`Load chat: ${chat.title}`}
                >
                  {chat.title}
                </button>
                
                {deleteConfirmId === chat.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="rounded bg-rose-500 px-2 py-1 text-xs text-white hover:bg-rose-600"
                      aria-label="Confirm delete"
                    >
                      Delete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(null);
                      }}
                      className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300"
                      aria-label="Cancel delete"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(chat.id);
                    }}
                    className="opacity-0 rounded p-1 hover:bg-slate-200 group-hover:opacity-100"
                    aria-label="Delete chat"
                  >
                    <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Main Chat Area */}
  <div className="flex flex-1 min-h-0 flex-col">
        {/* Header */}
  <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Open sidebar"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50">
                <svg className="h-5 w-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-900">CyberSafe AI Assistant</h1>
                <p className="text-xs text-slate-500">Always here to help with security</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportChat}
              disabled={messages.length === 0}
              className="hidden items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
              title="Export chat as text file"
              aria-label="Export chat as text file"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>

            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-500 bg-cyan-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
              aria-label="Start new chat"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </button>

            <button
              onClick={exportChat}
              disabled={messages.length === 0}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 sm:hidden"
              title="Export chat as text file"
              aria-label="Export chat as text file"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Chat Area */}
  <main className="flex flex-1 min-h-0 flex-col overflow-hidden">
          <div 
            ref={chatHistoryRef}
            className="flex-1 min-h-0 overflow-y-auto"
          >
            <div className="mx-auto max-w-4xl px-6 py-8 pb-32">
          {isLoadingChat ? (
            // Loading skeleton
            <div className="space-y-6 animate-pulse">
              <div className="flex justify-start gap-4">
                <div className="h-8 w-8 rounded-lg bg-slate-200"></div>
                <div className="flex max-w-[65%] flex-col gap-2">
                  <div className="h-20 w-96 rounded-2xl bg-slate-200"></div>
                  <div className="h-4 w-16 rounded bg-slate-100"></div>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <div className="flex max-w-[65%] flex-col gap-2">
                  <div className="h-12 w-64 rounded-2xl bg-cyan-200"></div>
                  <div className="h-4 w-16 rounded bg-slate-100"></div>
                </div>
                <div className="h-8 w-8 rounded-lg bg-slate-200"></div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full min-h-[60vh] flex-col items-center justify-center px-4">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              
              <h2 className="mb-2 text-center text-xl font-bold text-slate-900">
                How can I help you stay safe?
              </h2>
              <p className="mb-6 text-center text-sm text-slate-600">
                Ask me anything about cybersecurity, threats, or online safety
              </p>

              <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(prompt.text)}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-all duration-200 hover:border-cyan-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                    aria-label={`Ask: ${prompt.text}`}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-cyan-50 group-hover:text-cyan-600">
                      {prompt.icon}
                    </div>
                    <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">
                      {prompt.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex animate-fadeIn gap-4 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both'
                  }}
                >
                  {message.sender === 'bot' && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-100">
                      <svg className="h-5 w-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  )}

                  <div className="group flex max-w-[65%] flex-col">
                    <div
                      className={`rounded-2xl px-5 py-3 ${
                        message.sender === 'user'
                          ? 'bg-cyan-500 text-white'
                          : 'border border-slate-200 bg-white text-slate-900'
                      }`}
                    >
                      <div
                        dangerouslySetInnerHTML={formatMessage(message.text)}
                        className={`prose prose-sm max-w-none ${
                          message.sender === 'user' ? 'prose-invert' : ''
                        }`}
                      />
                    </div>
                    
                    <div className="mt-1 flex items-center gap-2 px-2">
                      <span className="text-xs text-slate-500">
                        {formatTime(message.timestamp)}
                      </span>
                      
                      {message.sender === 'bot' && (
                        <>
                        <button
                          onClick={() => handleCopyMessage(message.text)}
                          className="ml-2 opacity-0 transition-opacity group-hover:opacity-100"
                          title="Copy message"
                          aria-label="Copy message to clipboard"
                        >
                          <svg className="h-4 w-4 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => regenerateMessage(message.id)}
                          disabled={isLoading}
                          className="ml-2 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-30"
                          title="Regenerate response"
                          aria-label="Regenerate response"
                        >
                          <svg className="h-4 w-4 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        </>
                      )}
                    </div>
                  </div>

                  {message.sender === 'user' && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-200">
                      <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex animate-fadeIn gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-100">
                    <svg className="h-5 w-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
            </div>

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-32 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-slate-300 text-slate-600 shadow-lg transition-all duration-200 hover:bg-slate-50 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
              aria-label="Scroll to bottom"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
          </div>

          {/* Input Area - Floating like ChatGPT */}
          <div className="px-6 pb-20 pt-4">
            <div className="mx-auto max-w-4xl">
            <div className="flex items-end gap-3 rounded-3xl border border-slate-300 bg-white p-2 shadow-xl">
            <div className="flex flex-1 items-center gap-2 px-3">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about phishing scams, malware protection..."
                disabled={isLoading}
                rows={1}
                className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent py-3 text-base text-slate-900 placeholder-slate-500 focus:outline-none disabled:opacity-50"
                aria-label="Chat message input"
              />
            </div>

            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !inputValue.trim()}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500 text-white transition-all duration-200 hover:bg-cyan-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:opacity-60"
              aria-label="Send message"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CybersecurityChatbot;
