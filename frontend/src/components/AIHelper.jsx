import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
      if (!token) return;

      const res = await fetch(
        `http://localhost:5000/api/ai/history/${subject}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const history = await res.json();
      setMessages(history || []);
    } catch (err) {
      console.error("Failed to load history:", err);
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

      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMsg.content, subject }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const aiMsg = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, aiMsg]);
      
      if (data.offline) {
        setOffline(true);
      } else {
        setOffline(false);
      }
    } catch (err) {
      setError("⚠️ AI is offline. Try again later or check internet.");
      const aiMsg = { role: "assistant", content: "You're offline. Your message has been saved. Try again when connected." };
      setMessages((prev) => [...prev, aiMsg]);
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
    <div className="bg-white rounded-xl p-6 shadow h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">🤖 AI Study Assistant</h2>
        {offline && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">📴 Offline</span>}
      </div>

      {/* Subject Selector */}
      <div className="flex gap-2 mb-4">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border rounded px-3 py-2 text-sm font-medium bg-gray-100"
        >
          <option value="general">General</option>
          <option value="dbms">DBMS</option>
          <option value="os">OS</option>
          <option value="cn">Computer Networks</option>
          <option value="dsa">DSA</option>
          <option value="web">Web Dev</option>
        </select>
        <button
          onClick={exportPDF}
          className="text-sm bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700"
        >
          📥 Export PDF
        </button>
      </div>

      {/* Chat Box - ChatGPT Style */}
      <div
        ref={chatBoxRef}
        className="h-[300px] overflow-y-auto border rounded p-3 bg-gray-50 mb-4 space-y-3"
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
                className={`max-w-[70%] break-words whitespace-pre-wrap px-4 py-3 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "mr-auto bg-indigo-500 text-white"
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
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask something... (Shift+Enter for new line)"
            className="flex-1 border rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? "..." : "Send"}
          </button>
          <button
            onClick={startVoiceInput}
            disabled={isListening || loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
            title="Voice input"
          >
            {isListening ? "🎤 Listening..." : "🎤"}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
}
