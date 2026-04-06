import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Bot, FileText, Trash2, Mic, WifiOff, ChevronDown } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AIHelper() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("general");
  const [isListening, setIsListening] = useState(false);
  const [offline, setOffline] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const getStorageKey = (subjectName) => `aiChatMessages:${subjectName}`;

  const toggleMessageExpand = (messageIndex) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageIndex)) {
      newExpanded.delete(messageIndex);
    } else {
      newExpanded.add(messageIndex);
    }
    setExpandedMessages(newExpanded);
  };

  const isMessageLong = (content) => {
    return content.split("\n").length > 5 || content.length > 300;
  };

  const truncateMessage = (content) => {
    const lines = content.split("\n");
    if (lines.length > 5) {
      return lines.slice(0, 5).join("\n");
    }
    if (content.length > 300) {
      return content.substring(0, 300);
    }
    return content;
  };

  // Initialize Web Speech API
  const recognition = useRef(null);
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.lang = "en-US";
      recognition.current.continuous = false;

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.current.onstart = () => setIsListening(true);
      recognition.current.onend = () => setIsListening(false);
    }
  }, []);

  // Load chat history when subject changes
  useEffect(() => {
    loadChatHistory();
  }, [subject]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getToken = () => localStorage.getItem("token");

  const loadChatHistory = async () => {
    try {
      const token = getToken();
      if (!token) {
        const cached = localStorage.getItem(getStorageKey(subject));
        if (cached) setMessages(JSON.parse(cached));
        return;
      }

      const res = await fetch(
        `${API_URL}/api/ai/history/${subject}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const history = await res.json();
      const normalizedHistory = history || [];
      setMessages(normalizedHistory);
      localStorage.setItem(getStorageKey(subject), JSON.stringify(normalizedHistory));
    } catch (err) {
      console.error("Failed to load history:", err);
      const cached = localStorage.getItem(getStorageKey(subject));
      if (cached) setMessages(JSON.parse(cached));
    }
  };

  useEffect(() => {
    localStorage.setItem(getStorageKey(subject), JSON.stringify(messages));
  }, [messages, subject]);

  const handleClearChat = async () => {
    const token = getToken();
    setMessages([]);
    setError("");
    setOffline(false);
    localStorage.removeItem(getStorageKey(subject));

    if (!token) return;

    try {
      await fetch(`${API_URL}/api/ai/history/${subject}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Failed to clear server chat history:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) {
        setError("Please log in first.");
        return;
      }

      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMsg.content, subject }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to reach AI service.");
      }

      const aiMsg = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, aiMsg]);
      
      if (data.offline) {
        setOffline(true);
        if (data?.message) {
          setError(`Warning: ${data.message}`);
        }
      } else {
        setOffline(false);
        setError("");
      }
    } catch (err) {
      setError(err?.message || "AI is offline. Try again later or check internet.");
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startVoiceInput = () => {
    if (recognition.current) {
      recognition.current.start();
    }
  };

  const exportPDF = async () => {
    if (!chatBoxRef.current) return;

    try {
      const canvas = await html2canvas(chatBoxRef.current, { backgroundColor: "#fff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgHeight = (canvas.height * 210) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, 210, imgHeight);
      pdf.save(`ai-chat-${subject}-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      setError("Failed to export PDF");
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden border border-gray-200 min-h-[500px]">
        
        {/* ===== HEADER (Fixed) ===== */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0">
              <Bot size={18} className="text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-base md:text-lg font-600 text-gray-900 truncate">AI Study Assistant</h2>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-xs text-gray-600 bg-transparent border-0 focus:ring-0 cursor-pointer font-medium truncate"
              >
                <option value="general">General</option>
                <option value="dbms">DBMS</option>
                <option value="os">OS</option>
                <option value="cn">Computer Networks</option>
                <option value="dsa">DSA</option>
                <option value="web">Web Dev</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2.5 flex-shrink-0">
            {offline && (
              <span className="text-xs bg-yellow-50 text-yellow-700 px-2 md:px-3 py-1.5 rounded-full flex items-center gap-1 font-medium border border-yellow-200 whitespace-nowrap">
                <WifiOff size={12} />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}
            <button
              onClick={exportPDF}
              title="Export chat to PDF"
              className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors duration-200 flex-shrink-0"
            >
              <FileText size={16} />
            </button>
            <button
              onClick={handleClearChat}
              disabled={loading || messages.length === 0}
              title="Clear conversation"
              className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* ===== MESSAGES AREA (Scrollable) ===== */}
        <div
          ref={chatBoxRef}
          className="flex-1 overflow-y-auto px-4 md:px-6 py-3 md:py-4 space-y-3 bg-gradient-to-b from-gray-50 to-white"
          style={{ scrollBehavior: "smooth" }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
              <Bot size={40} className="mb-2 opacity-20" />
              <p className="text-sm md:text-base font-medium">Start a conversation about <span className="text-blue-500 font-semibold">{subject}</span></p>
              <p className="text-xs md:text-sm mt-1">Ask anything and I'll help!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isLong = msg.role === "assistant" && isMessageLong(msg.content);
              const isExpanded = expandedMessages.has(i);
              const displayContent = isLong && !isExpanded ? truncateMessage(msg.content) : msg.content;

              return (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                  style={{
                    animation: `fadeIn 0.3s ease-out`,
                    "@keyframes fadeIn": {
                      from: { opacity: 0, transform: "translateY(8px)" },
                      to: { opacity: 1, transform: "translateY(0)" }
                    }
                  }}
                >
                  <div className="flex flex-col gap-2" style={{ maxWidth: msg.role === "user" ? "70%" : "75%" }}>
                    <div
                      className={`break-words whitespace-pre-wrap text-xs md:text-sm leading-relaxed transition-all duration-200 overflow-hidden ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-2xl rounded-br-md shadow-md"
                          : "bg-gray-100 text-gray-900 px-3 md:px-4 py-2 md:py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-200"
                      }`}
                      style={{
                        maxHeight: isLong && !isExpanded ? "200px" : "none",
                        overflowY: isLong && !isExpanded ? "hidden" : "visible"
                      }}
                    >
                      {displayContent}
                      {isLong && !isExpanded && <span className="text-gray-500">...</span>}
                    </div>
                    
                    {isLong && (
                      <button
                        onClick={() => toggleMessageExpand(i)}
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors self-start ml-1"
                      >
                        <ChevronDown 
                          size={14} 
                          style={{
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s"
                          }}
                        />
                        {isExpanded ? "Show Less" : "Show More"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {loading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-gray-100 text-gray-900 px-3 md:px-4 py-2 md:py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-200">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "0ms"}}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "150ms"}}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "300ms"}}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ===== INPUT AREA (Sticky Bottom) ===== */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 md:px-6 py-3 sticky bottom-0">
          {error && (
            <div className="mb-2 md:mb-3 p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs md:text-sm font-medium">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                disabled={loading}
                className="flex-1 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 bg-white font-medium transition-all duration-200 disabled:opacity-60"
              />
              <button
                onClick={startVoiceInput}
                disabled={isListening || loading}
                title="Voice input"
                className="px-3 md:px-4 py-2 md:py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
              >
                {isListening ? (
                  <span className="text-xs font-bold">●</span>
                ) : (
                  <Mic size={16} />
                )}
              </button>
            </div>
            
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-full px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold text-xs md:text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                  <span>Sending</span>
                </span>
              ) : (
                "Send"
              )}
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">Shift + Enter for new line</p>
        </div>
      </div>
  );
}
