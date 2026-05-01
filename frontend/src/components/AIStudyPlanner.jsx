import { useState } from "react";
import jsPDF from "jspdf";
import { CalendarDays, Sparkles, FileDown, LoaderCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AIStudyPlanner() {
  const [days, setDays] = useState(7);
  const [subjects, setSubjects] = useState([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addSubject = () => {
    if (!subjectInput.trim()) return;
    if (subjects.includes(subjectInput.trim())) {
      setError("Subject already added");
      return;
    }
    setSubjects([...subjects, subjectInput.trim()]);
    setSubjectInput("");
    setError("");
  };

  const removeSubject = (subject) => {
    setSubjects(subjects.filter(s => s !== subject));
  };

  const generatePlan = async () => {
    if (!days || days < 1) {
      setError("Enter valid number of days");
      return;
    }
    
    if (subjects.length === 0) {
      setError("Add at least one subject");
      return;
    }

    setLoading(true);
    setError("");
    setPlan("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in first.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/ai/study-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ days: parseInt(days), subjects }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate plan");
      }

      if (data.plan) {
        setPlan(data.plan);
      } else {
        throw new Error("No plan received from server");
      }
    } catch (err) {
      console.error("Generate Plan Error:", err);
      setError(err.message || "Failed to generate study plan");
      setPlan("Failed to generate study plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPlan = () => {
    if (!plan) {
      setError("Generate a study plan first");
      return;
    }
    
    try {
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height;
      const lineHeight = 7;
      let yPosition = 20;
      
      // Title
      pdf.setFontSize(16);
      pdf.text("Study Plan", 10, yPosition);
      yPosition += 10;
      
      // Content
      pdf.setFontSize(10);
      const lines = pdf.splitTextToSize(plan, 180);
      
      lines.forEach((line) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, 10, yPosition);
        yPosition += lineHeight;
      });
      
      pdf.save(`study-plan-${days}days.pdf`);
      setError("");
    } catch (err) {
      console.error("PDF Error:", err);
      setError("Failed to download PDF");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full max-w-md h-[420px] flex flex-col">
      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
        <CalendarDays size={20} />
        AI Study Planner
      </h3>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Days until exam
        </label>
        <input
          type="number"
          min="1"
          max="30"
          placeholder="Enter number of days"
          className="border rounded-lg px-3 py-2 w-full"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
      </div>

      <div className="relative mb-3">
        <input
          value={subjectInput}
          onChange={(e) => setSubjectInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addSubject()}
          placeholder="Add subject..."
          className="border rounded-lg px-3 py-2 w-full pr-20 text-sm"
        />
        <button
          onClick={addSubject}
          className="absolute right-1 top-1 bottom-1 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg text-sm"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {subjects.map((subject) => (
          <span
            key={subject}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {subject}
            <button
              onClick={() => removeSubject(subject)}
              className="text-blue-600 hover:text-blue-900 font-bold"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <button
        onClick={generatePlan}
        disabled={loading || subjects.length === 0}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 mb-3 flex items-center justify-center gap-2"
      >
        {loading ? <LoaderCircle size={18} className="animate-spin" /> : <Sparkles size={18} />}
        {loading ? "Generating..." : "Generate Study Plan"}
      </button>

      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-3 text-sm min-h-[120px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Generating your study plan...</p>
          </div>
        ) : plan ? (
          <ReactMarkdown
            components={{
              p: (props) => <p className="mb-2 last:mb-0" {...props} />,
              strong: (props) => <strong className="font-bold" {...props} />,
              em: (props) => <em className="italic" {...props} />,
              ul: (props) => <ul className="list-disc list-inside mb-2 ml-2" {...props} />,
              ol: (props) => <ol className="list-decimal list-inside mb-2 ml-2" {...props} />,
              li: (props) => <li className="mb-1 text-gray-700" {...props} />,
              code: ({ inline, ...props }) => inline ? (
                <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-800 font-mono text-xs" {...props} />
              ) : (
                <code className="block bg-gray-200 p-2 rounded mb-2 font-mono text-xs overflow-x-auto" {...props} />
              ),
              h1: (props) => <h1 className="text-lg font-bold mb-2 text-gray-900" {...props} />,
              h2: (props) => <h2 className="text-base font-bold mb-2 text-gray-900" {...props} />,
              h3: (props) => <h3 className="text-sm font-bold mb-2 text-gray-900" {...props} />,
            }}
          >
            {plan || ""}
          </ReactMarkdown>
        ) : (
          <p className="text-gray-400 text-center">
            Add subjects and click "Generate Study Plan" to get started
          </p>
        )}
      </div>

      <button
        onClick={downloadPlan}
        disabled={!plan || loading}
        className="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 w-full font-semibold flex items-center justify-center gap-2"
      >
        <FileDown size={16} />
        Download PDF
      </button>
    </div>
  );
}
