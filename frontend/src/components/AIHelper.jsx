import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Bot, FileText, Trash2, Mic, WifiOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AIHelper() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("general");
  const [isListening, setIsListening] = useState(false);
  const [offline, setOffline] = useState(false);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const getStorageKey = (subjectName) => `aiChatMessages:${subjectName}`;

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
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl p-4 md:p-6 shadow h-full flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bot size={24} />
          AI Study Assistant
        </h2>
        {offline && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1">
            <WifiOff size={14} />
            Offline
          </span>
        )}
      </div>

      {/* Subject Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full sm:w-auto border rounded-lg px-3 py-2 text-sm font-medium bg-gray-100"
        >
          <option value="general">General</option>
          <option value="dbms">DBMS</option>
          <option value="os">OS</option>
          <option value="cn">Computer Networks</option>
          <option value="dsa">DSA</option>
          <option value="web">Web Dev</option>
        </select>
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={exportPDF}
            className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <FileText size={16} />
            Export PDF
          </button>
          <button
            onClick={handleClearChat}
            disabled={loading || messages.length === 0}
            className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Clear Chat
          </button>
        </div>
      </div>

      {/* Chat Box - ChatGPT Style */}
      <div
        ref={chatBoxRef}
        className="w-full flex-1 min-h-[300px] sm:min-h-[380px] overflow-y-auto border rounded-xl p-3 sm:p-4 bg-gray-50 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Start a conversation about {subject}...</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`break-words whitespace-pre-wrap px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm max-w-[85%] sm:max-w-md ${
                  msg.role === "user"
                    ? "mr-auto bg-blue-500 text-white"
                    : "ml-auto bg-green-100 text-gray-900"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-green-100 text-gray-900 px-4 py-3 rounded-lg max-w-[70%]">
              <p className="text-sm italic">AI is thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask something... (Shift+Enter for new line)"
            className="w-full flex-1 border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-3 sm:flex gap-2 w-full sm:w-auto">
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? "..." : "Send"}
            </button>
            <button
              onClick={startVoiceInput}
              disabled={isListening || loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center justify-center"
              title="Voice input"
            >
              {isListening ? "..." : <Mic size={18} />}
            </button>
            <button
              onClick={handleClearChat}
              disabled={loading || messages.length === 0}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium"
              title="Clear current subject chat"
            >
              Clear
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
}
