import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MoreHorizontal, CheckCheck, Sparkles, RefreshCw } from 'lucide-react';

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'bot',
    text: "Xin chào! 👋\nTôi là trợ lý ảo AI của DUDI.\nTôi có thể hỗ trợ gì cho bạn hôm nay?",
    time: '10:30'
  }
];

const BOT_RESPONSES = [
  "DUDI cung cấp các giải pháp tối ưu hóa vận hành Mobile App, AI Chatbot và hạ tầng Cloud thông minh. Bạn muốn tìm hiểu thêm về dịch vụ nào?",
  "Hệ thống DUDI giúp tự động hóa quy trình, tăng tốc độ xử lý dữ liệu và cải thiện trải nghiệm người dùng lên đến 300%.",
  "Bạn có thể nhấn vào các thẻ dịch vụ trên trang hoặc liên hệ hotline 0909 163 821 để được đội ngũ DUDI tư vấn chi tiết nhé! ✨",
  "Tuyệt vời! Nếu bạn có bất kỳ câu hỏi nào về thiết kế, công nghệ hay tích hợp hệ thống, tôi luôn sẵn sàng hỗ trợ 🚀."
];

const SUGGESTED_PROMPTS = [
  "💡 DUDI cung cấp dịch vụ gì?",
  "🚀 Tư vấn thiết kế App & Web",
  "🤖 Tích hợp AI Chatbot",
  "⚡ Báo giá & Quy trình",
  "📞 Liên hệ hotline DUDI"
];

// Helper parser to render Markdown bold (**bold**), italic (*italic*), and inline code (`code`)
const renderFormattedLine = (line) => {
  if (!line) return '\u00A0';

  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const segments = line.split(regex);

  return segments.map((seg, idx) => {
    if (seg.startsWith('**') && seg.endsWith('**') && seg.length >= 4) {
      return (
        <strong key={idx} className="bubble-bold">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    if (seg.startsWith('`') && seg.endsWith('`') && seg.length >= 2) {
      return (
        <code key={idx} className="bubble-code">
          {seg.slice(1, -1)}
        </code>
      );
    }
    if (seg.startsWith('*') && seg.endsWith('*') && seg.length >= 2) {
      return (
        <em key={idx} className="bubble-italic">
          {seg.slice(1, -1)}
        </em>
      );
    }
    return seg;
  });
};

export const ChatWidget = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const modalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, messages, isTyping]);

  // Click outside to close chat modal
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Don't close if user clicked the toggle mascot button itself (handled by toggle)
        const mascotBtn = event.target.closest('.btn-robot-mascot');
        if (!mascotBtn) {
          onClose();
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const sendToAIApi = async (userText, currentMessages) => {
    setIsTyping(true);
    const apiUrl = import.meta.env.VITE_AI_API_URL || '/api-ai/chat';

    try {
      // Standardized format for AI backend (Next.js / Vercel AI SDK / LangChain / Gemini)
      const formattedHistory = currentMessages.slice(-8).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify({
          message: userText,
          prompt: userText,
          query: userText,
          question: userText,
          messages: formattedHistory,
          history: formattedHistory,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
      }

      // Check content-type to parse JSON or Plain text
      const contentType = response.headers.get('content-type') || '';
      let replyText = '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        replyText = 
          data.reply || 
          data.message || 
          data.text || 
          data.response || 
          data.answer || 
          data.content || 
          (typeof data === 'string' ? data : JSON.stringify(data));
      } else {
        // Plain text or streaming chunk response
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
        throw new Error('Server AI trả về nội dung rỗng');
      }
    } catch (err) {
      console.error('❌ Lỗi kết nối AI Backend:', err);
      
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `⚠️ [Lỗi kết nối AI]: ${err.message || 'Không thể kết nối đến máy chủ AI'}.\n(Hãy kiểm tra tab F12 Console hoặc đảm bảo Backend ở localhost:3000 đang bật)`,
        time: getCurrentTime(),
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
    setMessages(INITIAL_MESSAGES);
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
            <h3 className="chat-header-title">Trợ lý AI DUDI</h3>
            <div className="chat-header-status">
              <span>Luôn sẵn sàng hỗ trợ bạn</span>
              <span className="status-dot-green"></span>
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          <button 
            type="button" 
            className="chat-action-btn" 
            title="Làm mới trò chuyện"
            onClick={handleResetChat}
          >
            <RefreshCw size={15} />
          </button>
          <button 
            type="button" 
            className="chat-action-btn" 
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
                <div className={`chat-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
                  {msg.text.split('\n').map((line, lIdx) => (
                    <p key={lIdx} className="bubble-text-line">
                      {renderFormattedLine(line)}
                    </p>
                  ))}
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
              className="chat-suggestion-chip"
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
            placeholder="Nhập tin nhắn của bạn..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button 
            type="submit" 
            className="chat-send-btn" 
            disabled={!inputValue.trim()}
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
