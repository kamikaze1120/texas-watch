import { Bot, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDispatchData } from '@/hooks/useDispatchData';
import { useWeatherAlerts } from '@/hooks/useLiveData';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const IntelPanel = () => {
  const { data: dispatch } = useDispatchData();
  const { data: weather } = useWeatherAlerts();

  const generateSitRep = (): string => {
    const total = dispatch?.total || 0;
    const cities = dispatch?.cities || { austin: 0, dallas: 0, houston: 0, sanAntonio: 0 };
    const critical = dispatch?.calls?.filter(c => c.severity === 'critical') || [];
    const wxCount = weather?.length || 0;

    let report = `**SITUATION REPORT — ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST**\n\n`;
    report += `**${total}** active dispatch calls across Texas.\n\n`;
    report += `**By City:** Austin ${cities.austin} | Dallas ${cities.dallas} | Houston ${cities.houston} | San Antonio ${cities.sanAntonio}\n\n`;

    if (critical.length > 0) {
      report += `**🔴 Critical (${critical.length}):**\n`;
      critical.slice(0, 5).forEach(c => {
        report += `- ${c.callType} — ${c.location} (${c.city})\n`;
      });
      report += '\n';
    }

    if (wxCount > 0) {
      report += `**⚠ Weather Alerts (${wxCount}):**\n`;
      weather?.slice(0, 3).forEach(w => {
        report += `- ${w.event} — ${w.areas}\n`;
      });
    }

    if (total === 0) {
      report += `_No dispatch data currently available. Feeds refresh every 60s._`;
    }

    return report;
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '_Initializing live intelligence feed..._\n\nClick **Sit Rep** below for a real-time situation report based on live dispatch data.' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };

    let response: string;
    const q = input.toLowerCase();
    if (q.includes('sit') || q.includes('report') || q.includes('summary') || q.includes('status')) {
      response = generateSitRep();
    } else if (q.includes('critical') || q.includes('urgent')) {
      const critical = dispatch?.calls?.filter(c => c.severity === 'critical') || [];
      response = critical.length > 0
        ? `**${critical.length} Critical Calls:**\n\n` + critical.map(c => `- **${c.callType}** — ${c.location} (${c.city})`).join('\n')
        : 'No critical calls at this time.';
    } else if (q.includes('weather') || q.includes('wx')) {
      response = weather && weather.length > 0
        ? `**${weather.length} Active Weather Alerts:**\n\n` + weather.map(w => `- **${w.event}** — ${w.areas}`).join('\n')
        : 'No active weather alerts.';
    } else {
      response = generateSitRep();
    }

    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: response }]);
    setInput('');
  };

  const handleQuickQuery = (q: string) => {
    setInput(q);
    setTimeout(() => {
      const userMsg: Message = { role: 'user', content: q };
      let response: string;
      if (q.includes('Sit')) response = generateSitRep();
      else if (q.includes('Critical')) {
        const critical = dispatch?.calls?.filter(c => c.severity === 'critical') || [];
        response = critical.length > 0
          ? `**${critical.length} Critical:**\n\n` + critical.map(c => `- ${c.callType} — ${c.location}`).join('\n')
          : 'No critical calls.';
      } else if (q.includes('Weather')) {
        response = weather && weather.length > 0
          ? weather.map(w => `**${w.event}** — ${w.areas}`).join('\n\n')
          : 'No weather alerts.';
      } else {
        response = generateSitRep();
      }
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: response }]);
      setInput('');
    }, 100);
  };

  return (
    <div className="flex flex-col h-full bg-card/50">
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-primary/10">
            <Bot className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-[10px] font-bold tracking-[0.15em] text-foreground">
              INTEL ANALYST
            </h2>
            <p className="text-[7px] text-muted-foreground font-display tracking-wider">LIVE DATA</p>
          </div>
          <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded">
            <Sparkles className="h-2 w-2 text-primary" />
            <span className="text-[7px] font-display text-primary tracking-wider">AI</span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`${msg.role === 'user' ? 'ml-6' : ''}`}>
              {msg.role === 'assistant' && (
                <span className="text-[7px] font-display text-primary/60 mb-0.5 block tracking-[0.15em]">ANALYST</span>
              )}
              <div className={`text-[10px] leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary/8 border border-primary/15 rounded-md p-2 text-foreground'
                  : 'text-secondary-foreground bg-secondary/20 rounded-md p-2'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border/50">
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Query intelligence..."
            className="flex-1 bg-secondary/30 border border-border/50 rounded px-2.5 py-1.5 text-[10px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 font-body"
          />
          <button
            onClick={handleSend}
            className="p-1.5 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {['Sit Rep', 'Critical calls', 'Weather alerts'].map(q => (
            <button
              key={q}
              onClick={() => handleQuickQuery(q)}
              className="text-[7px] font-display px-1.5 py-0.5 rounded border border-border/40 text-muted-foreground/60 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all tracking-wider"
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
