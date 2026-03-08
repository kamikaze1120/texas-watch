import { Bot, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const sampleResponses: Record<string, string> = {
  default: `**Current Situation Summary — Texas**\n\nAs of this moment, there are **12 active incidents** across the state with **3 classified as critical**.\n\n**Key Developments:**\n- 🔴 Armed robbery in progress in Houston (Westheimer Rd)\n- 🔴 Wrong-way driver on US-75 near McKinney\n- 🔴 Tornado warning issued for Tarrant County\n- 🟡 Multi-vehicle collision on I-35 in Austin\n- 🟡 Chemical spill at Beaumont refinery\n\n**Active Alerts:**\n- AMBER Alert for missing child (Maria G., age 7)\n- BLUE Alert for suspect wanted in officer assault\n\nRecommend heightened patrol posture in North Texas due to severe weather.`,
};

const IntelPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: sampleResponses.default },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    const response: Message = {
      role: 'assistant',
      content: `Analyzing query: "${input}"\n\nThis is a demo environment. In production, this AI analyst would query the live intelligence database and provide real-time analysis based on aggregated incident data, historical patterns, and threat assessments.`,
    };
    setMessages(prev => [...prev, userMsg, response]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-primary/15">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xs font-semibold tracking-widest text-primary">
              AI INTEL ANALYST
            </h2>
            <p className="text-[9px] text-muted-foreground font-display">REAL-TIME INTELLIGENCE</p>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded-full">
            <Sparkles className="h-2.5 w-2.5 text-primary" />
            <span className="text-[9px] font-display text-primary">AI</span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`${msg.role === 'user' ? 'ml-4' : ''}`}>
              {msg.role === 'assistant' && (
                <span className="text-[9px] font-display text-primary/70 mb-1 block tracking-widest">ANALYST</span>
              )}
              <div className={`text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary/10 border border-primary/20 rounded-lg p-2.5 text-foreground'
                  : 'text-secondary-foreground bg-secondary/30 rounded-lg p-2.5'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Query intelligence..."
            className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-body"
          />
          <button
            onClick={handleSend}
            className="p-2 bg-primary/15 text-primary rounded-lg hover:bg-primary/25 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {['Situation report', 'Houston threats', 'Near schools', 'Traffic summary'].map(q => (
            <button
              key={q}
              onClick={() => { setInput(q); }}
              className="text-[9px] font-display px-2 py-1 rounded-full border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntelPanel;
