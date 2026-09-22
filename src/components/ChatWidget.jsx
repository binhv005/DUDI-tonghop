import React, { useState, useRef, useEffect } from 'react';
import { Send, X, CheckCheck, Sparkles, RefreshCw, MessageSquare, Phone, RotateCcw } from 'lucide-react';

const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'https://dudi-ai.onrender.com/api/chat';

const BOT_WELCOME_TEXT = "Xin chào! 👋\nTôi là DU - Trợ lý ảo AI của DUDI SOFTWARE.\nTôi có thể hỗ trợ gì cho bạn hôm nay?";

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'bot',
    text: BOT_WELCOME_TEXT,
    time: '10:30'
  }
];

const SUGGESTED_PROMPTS = [
  "💡 DUDI cung cấp các dịch vụ gì?",
  "💰 Báo giá chi tiết các gói giải pháp",
  "⚡ Quy trình triển khai dự án tại DUDI",
  "📞 Kết nối chuyên viên tư vấn trực tiếp"
];

function FormattedText({ text, isBot }) {
  if (!text) return null;
  const lines = text.split('\n');

  const parseInline = (str) => {
    const regex = /(\*\*.*?\*\*|\*[^*]+?\*)/g;
    const parts = str.split(regex);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return <em key={idx} className="italic opacity-90">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-1">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lIdx} className="h-1" />;
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ') || (trimmed.startsWith('* ') && !trimmed.startsWith('**'));
        const isNumbered = /^\d+\.\s/.test(trimmed);

        if (isBullet) {
          return (
            <div key={lIdx} className="flex items-start gap-1.5 pl-0.5">
              <span className="select-none font-bold text-xs opacity-75">•</span>
              <span className="flex-1">{parseInline(trimmed.replace(/^[-•*]\s+/, ''))}</span>
            </div>
          );
        }
        if (isNumbered) {
          const numMatch = trimmed.match(/^(\d+)\./);
          const num = numMatch ? numMatch[1] : '•';
          return (
            <div key={lIdx} className="flex items-start gap-1.5 pl-0.5">
              <span className="select-none font-bold text-xs opacity-80">{num}.</span>
              <span className="flex-1">{parseInline(trimmed.replace(/^\d+\.\s+/, ''))}</span>
            </div>
          );
        }
        return <div key={lIdx}>{parseInline(line)}</div>;
      })}
    </div>
  );
}

export const ChatWidget = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (window.innerWidth > 768) {
        setTimeout(() => inputRef.current?.focus(), 300);
      }
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      const isToggleBtn = event.target.closest('[data-chat-toggle="true"]');
      if (isToggleBtn) return;
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const sendToAIApi = async (userText, currentMessages) => {
    setIsTyping(true);
    const historyPayload = currentMessages
      .filter((m) => !m.isError)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Máy chủ phản hồi mã: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      let replyText = '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        replyText = data.reply || data.message || data.text || data.response || data.answer || JSON.stringify(data);
      } else {
        replyText = await response.text();
      }

      if (replyText && replyText.trim()) {
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: replyText.trim(),
          time: getCurrentTime(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Không nhận được nội dung từ AI');
      }
    } catch (err) {
      console.error('❌ Lỗi kết nối AI Backend:', err);
      const isTimeout = err.name === 'AbortError';
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: isTimeout 
          ? "⚠️ Kết nối tới máy chủ AI đang bị trễ do server đang khởi động. Bạn vui lòng thử lại sau giây lát nhé!"
          : "⚠️ Không thể kết nối tới máy chủ AI DUDI. Vui lòng kiểm tra lại kết nối hoặc liên hệ Hotline/Zalo để được hỗ trợ.",
        time: getCurrentTime(),
        isError: true,
        retryText: userText
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: getCurrentTime()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');

    sendToAIApi(userText, updatedMessages);
  };

  const handleSelectPrompt = (promptText) => {
    if (isTyping) return;
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: promptText,
      time: getCurrentTime()
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    sendToAIApi(promptText, updatedMessages);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: BOT_WELCOME_TEXT,
        time: getCurrentTime()
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-modal" ref={modalRef} role="dialog" aria-label="AI Chatbot Dialog">
      {/* Header */}
      <div className="ai-chat-header">
        <div className="chat-header-left">
          <div className="chat-bot-avatar-header">
            <img 
              src="/images/robot-mascot.webp" 
              alt="AI Bot" 
              className="chat-avatar-img"
            />
          </div>
          <div className="chat-header-meta">
            <h3 className="chat-header-title">DU - Trợ lý AI DUDI</h3>
            <div className="chat-header-status">
              <span>Trực tuyến 24/7 • DUDI AI Backend</span>
              <span className="status-dot-green"></span>
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          <button 
            type="button" 
            className="chat-action-btn cursor-pointer" 
            title="Làm mới trò chuyện"
            onClick={handleResetChat}
          >
            <RefreshCw size={15} />
          </button>
          <button 
            type="button" 
            className="chat-action-btn cursor-pointer" 
            title="Đóng chat" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="ai-chat-body">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div key={msg.id} className={`chat-message-row ${isBot ? 'is-bot' : 'is-user'}`}>
              {isBot && (
                <div className="chat-bot-avatar-bubble">
                  <img 
                    src="/images/robot-mascot.webp" 
                    alt="AI Bot" 
                    className="bubble-avatar-img"
                  />
                </div>
              )}

              <div className="chat-message-content">
                <div className={`chat-bubble ${isBot ? (msg.isError ? 'bot-bubble is-error' : 'bot-bubble') : 'user-bubble'}`}>
                  <FormattedText text={msg.text} isBot={isBot} />
                  {msg.isError && msg.retryText && (
                    <button
                      onClick={() => handleSelectPrompt(msg.retryText)}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-300 font-semibold underline cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Thử gửi lại</span>
                    </button>
                  )}
                </div>

                <div className="chat-meta-time">
                  <span>{msg.time}</span>
                  {!isBot && <CheckCheck size={14} className="seen-check" />}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="chat-message-row is-bot">
            <div className="chat-bot-avatar-bubble">
              <img 
                src="/images/robot-mascot.webp" 
                alt="AI Bot" 
                className="bubble-avatar-img"
              />
            </div>
            <div className="chat-message-content">
              <div className="chat-bubble bot-bubble typing-bubble">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>DU đang soạn câu trả lời...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="chat-suggestions-bar">
        <div className="suggestions-scroll-track">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isTyping}
              className="chat-suggestion-chip cursor-pointer disabled:opacity-50"
              onClick={() => handleSelectPrompt(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Input */}
      <form className="ai-chat-footer" onSubmit={handleSend}>
        <div className="chat-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="chat-input-field"
            disabled={isTyping}
            placeholder={isTyping ? "Trợ lý AI đang phản hồi..." : "Nhập tin nhắn của bạn..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button 
            type="submit" 
            className="chat-send-btn cursor-pointer disabled:opacity-50" 
            disabled={!inputValue.trim() || isTyping}
            aria-label="Gửi tin nhắn"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWidget;
