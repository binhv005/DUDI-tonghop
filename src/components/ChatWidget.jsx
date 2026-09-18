import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MoreHorizontal, CheckCheck, Sparkles, RefreshCw } from 'lucide-react';

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'bot',
    text: "Xin chào! 👋\nTôi là trợ lý ảo AI của DUDI.\nTôi có thể hỗ trợ gì cho bạn hôm nay?",
    time: '10:30'
  },
  {
    id: 2,
    sender: 'user',
    text: 'Bạn có thể giải thích ngắn gọn cách AI hoạt động và giải pháp của DUDI không?',
    time: '10:31'
  },
  {
    id: 3,
    sender: 'bot',
    text: "Dạ được chứ! 🤖\nAI (Trí tuệ nhân tạo) giúp hệ thống tự động học hỏi từ dữ liệu, nhận diện mẫu và ra quyết định thông minh — hỗ trợ tối ưu vận hành ứng dụng và nâng cao hiệu suất doanh nghiệp.",
    time: '10:31'
  },
  {
    id: 4,
    sender: 'user',
    text: 'Thông tin rất hữu ích! Cảm ơn bạn 😊',
    time: '10:32'
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

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: getCurrentTime()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking and reply
    setTimeout(() => {
      const randomResponse = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: randomResponse,
        time: getCurrentTime()
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleSelectPrompt = (promptText) => {
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: promptText,
      time: getCurrentTime()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let reply = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
      if (promptText.includes('dịch vụ') || promptText.includes('DUDI cung cấp')) {
        reply = "DUDI cung cấp hệ sinh thái toàn diện: Thiết kế App/Web chuyên sâu, Vận hành tối ưu hiệu năng và Ứng dụng AI thông minh. Bạn có thể lướt danh sách dịch vụ ngay trên trang web!";
      } else if (promptText.includes('hotline') || promptText.includes('Liên hệ')) {
        reply = "Bạn có thể gọi trực tiếp đến Hotline: 0909 163 821 hoặc nhấn nút Zalo ở góc màn hình để được hỗ trợ 24/7 nhé! 📞";
      } else if (promptText.includes('Báo giá') || promptText.includes('Quy trình')) {
        reply = "DUDI cung cấp nhiều gói giải pháp linh hoạt phù hợp với quy mô từ Startup đến Doanh nghiệp lớn. Hãy liên hệ với chúng tôi để nhận bảng báo giá chi tiết!";
      } else if (promptText.includes('AI')) {
        reply = "Giải pháp AI của DUDI bao gồm trợ lý ảo thông minh, tự động hóa CSKH 24/7 và hệ thống phân tích dữ liệu nâng cao trải nghiệm người dùng.";
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: reply,
        time: getCurrentTime()
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 850);
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
                      {line}
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
