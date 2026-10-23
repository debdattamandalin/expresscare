import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useStore, type Priority } from '../../store/useStore';
import { getNextTriageQuestion } from '../../lib/ai';
import { espHardware } from '../../lib/espHardware';

interface Message {
  id: string;
  sender: 'AI' | 'PATIENT';
  text: string;
}

export function PatientTriage() {
  const navigate = useNavigate();
  const addPatient = useStore(state => state.addPatient);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'AI', text: "Hello. What symptom or discomfort brought you in today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'model', parts: [{text: string}]}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    setError('');

    const newMsg: Message = { id: Date.now().toString(), sender: 'PATIENT', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const hr = sessionStorage.getItem('patient_heart_rate') || '75';
      const spo2 = sessionStorage.getItem('patient_spo2') || '98';
      const temp = sessionStorage.getItem('patient_temperature') || '98.6';
      const vitalsSummary = `Heart Rate: ${hr} BPM, SpO2: ${spo2}%, IR Temperature: ${temp}°F`;

      const isFinalTurn = questionCount >= 5;
      const response = await getNextTriageQuestion(chatHistory, newMsg.text, vitalsSummary, isFinalTurn);
      
      if (response.isFinal && response.data) {
        const data = response.data;
        const savedName = sessionStorage.getItem('patient_name') || 'Unknown';
        const savedAge = sessionStorage.getItem('patient_age');
        const savedGender = sessionStorage.getItem('patient_gender');
        const formattedAge = savedAge && savedGender ? `${savedAge} (${savedGender})` : undefined;

        const newPatient = {
          id: `T-${Math.floor(Math.random() * 900) + 100}`,
          name: savedName,
          age: formattedAge,
          priority: data.priority as Priority,
          priorityScore: typeof data.priorityScore === 'number' ? data.priorityScore : 5,
          complaint: messages.find(m => m.sender === 'PATIENT')?.text || newMsg.text,
          arrivalTime: new Date().toISOString(),
          status: 'WAITING' as const,
          aiConfidence: data.aiConfidence || 'Moderate',
          missingInfo: data.missingInfo || [],
          keyAnswers: [
            `Vitals: HR ${hr} BPM | SpO2 ${spo2}% | Temp ${temp}°F`,
            ...(data.keyAnswers || [])
          ],
          contradictions: data.contradictions || [],
          aiNotes: data.aiNotes || 'Completed triage.'
        };
        
        await addPatient(newPatient);
        espHardware.triggerReset();
        navigate(`/patient/result?id=${newPatient.id}`);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'AI',
          text: response.text || "Could you provide a few more details?"
        }]);
        setQuestionCount(prev => prev + 1);
        
        setChatHistory(prev => [
          ...prev,
          { role: 'user', parts: [{ text: newMsg.text }] },
          { role: 'model', parts: [{ text: response.text || "Could you provide a few more details?" }] }
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect to triage service.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full h-[calc(100vh-3.5rem)] px-6 py-4">
      {/* Mini header */}
      <div className="flex items-center justify-between py-2 border-b border-neutral-200/80 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="font-medium text-neutral-700">Pre-consultation Intake</span>
        </div>
        <div className="font-mono text-neutral-400">
          Question {Math.min(questionCount, 5)} / 5
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.sender === 'PATIENT' ? 'items-end' : 'items-start'}`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1 px-1">
              {msg.sender === 'PATIENT' ? 'You' : 'Express Care Intake'}
            </span>
            <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
              msg.sender === 'AI' 
                ? 'bg-white border border-neutral-200/90 text-neutral-800' 
                : 'bg-neutral-900 text-white'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1 px-1">
              Express Care Intake
            </span>
            <div className="bg-white border border-neutral-200/90 rounded-lg px-4 py-2.5 text-xs text-neutral-400 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse"></span>
              Assessing responses...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-3">
        {error && (
          <div className="text-xs text-red-600 mb-2 font-medium">
            {error}
          </div>
        )}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2 bg-white border border-neutral-300 rounded-lg p-1.5 focus-within:border-neutral-900 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Type your reply..."
            className="flex-1 px-3 py-1.5 text-sm bg-transparent focus:outline-none text-neutral-900 placeholder:text-neutral-400"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-neutral-900 hover:bg-neutral-800 text-white p-2 rounded-md transition-colors disabled:opacity-20"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
