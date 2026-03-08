import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

const BOOT_LINES = [
  { text: 'TEXAS WATCH v3.1.0', delay: 200 },
  { text: 'Initializing secure connection...', delay: 400 },
  { text: 'Loading dispatch feeds... [AUS] [DAL] [HOU] [SAT]', delay: 700 },
  { text: 'Connecting to NOAA weather API...', delay: 900 },
  { text: 'Establishing TxDOT camera links...', delay: 1100 },
  { text: 'Calibrating threat assessment engine...', delay: 1400 },
  { text: 'System ready. All feeds nominal.', delay: 1700 },
];

interface BootSequenceProps {
  onComplete: () => void;
}

const BootSequence = ({ onComplete }: BootSequenceProps) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [phase, setPhase] = useState<'boot' | 'logo' | 'done'>('boot');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Show boot lines sequentially
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(i + 1);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
      }, line.delay);
    });

    // Switch to logo phase
    setTimeout(() => setPhase('logo'), 2200);
    
    // Complete
    setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 3400);
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center tactical-grid">
      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-32 scan-line" />
      </div>

      {phase === 'boot' && (
        <div className="max-w-lg w-full px-8">
          {/* Terminal output */}
          <div className="font-display text-[11px] leading-relaxed space-y-1">
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <div
                key={i}
                className="flex items-start gap-2 boot-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className={`shrink-0 ${
                  i === visibleLines - 1 ? 'text-primary' : 'text-muted-foreground'
                }`}>{'>'}</span>
                <span className={
                  i === BOOT_LINES.length - 1 ? 'text-success' :
                  i === visibleLines - 1 ? 'text-foreground' : 'text-muted-foreground'
                }>
                  {line.text}
                </span>
                {i === visibleLines - 1 && i !== BOOT_LINES.length - 1 && (
                  <span className="animate-pulse text-primary ml-1">█</span>
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="h-[2px] bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] font-display text-muted-foreground tracking-widest">SYSTEM BOOT</span>
              <span className="text-[9px] font-display text-primary tabular-nums">{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {phase === 'logo' && (
        <div className="flex flex-col items-center boot-scale-in">
          <div className="p-4 rounded-2xl bg-primary/10 glow-primary mb-6">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-[0.3em] text-primary text-glow-primary mb-2">
            TEXAS WATCH
          </h1>
          <p className="font-display text-[10px] text-muted-foreground tracking-[0.3em]">
            PUBLIC SAFETY INTELLIGENCE PLATFORM
          </p>
          <div className="flex items-center gap-2 mt-4">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-display text-success tracking-widest">ALL SYSTEMS ONLINE</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BootSequence;
