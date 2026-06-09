import React, { useState, useRef, useEffect } from 'react';

const videoDictionary = {
  idle: 'https://www.w3schools.com/html/mov_bbb.mp4', // Fallback/Idle loop
  jumpscare: 'https://archive.org/download/jumpscare_2026/jumpscare.mp4', // Example URL
  smoke: 'https://archive.org/download/smoke_2026/smoke.mp4',
  dance: 'https://archive.org/download/dance_2026/dance.mp4'
};

export default function GhostfaceTerminal() {
  const [input, setInput] = useState('');
  const [currentVideo, setCurrentVideo] = useState(videoDictionary.idle);
  const [status, setStatus] = useState('SYS_READY');
  const videoRef = useRef(null);

  const speakTTS = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'es-ES';
    msg.pitch = 0.1; // Deep creepy voice simulation
    msg.rate = 0.85; // Slow, deliberate pacing
    msg.volume = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.includes('es') && v.name.toLowerCase().includes('diego')) || voices.find(v => v.lang.includes('es'));
    if (esVoice) msg.voice = esVoice;

    window.speechSynthesis.speak(msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const cmd = input.trim();
    
    setStatus(`AWAITING_LLM_PROXY: [${cmd.toUpperCase()}]`);
    setInput('');

    try {
      // 1. Ask dynamic proxy for intent mapping and TTS generation
      const res = await fetch('/api/llm-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: cmd })
      });
      const data = await res.json();

      // 2. Play video & TTS
      playSequence(videoDictionary[data.video] || videoDictionary.idle);
      speakTTS(data.tts);

      // 3. Log to CORTEX Exergy Ledger if unrecognized (Anomaly)
      if (data.status === 'UNREGISTERED') {
        setStatus(`ANOMALY DETECTED. LOGGING TO LEDGER...`);
        fetch('/api/log-exergy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: cmd })
        }).then(r => r.json()).then(ledgerData => {
          if(ledgerData.success) {
            console.log("C5-REAL Hash Generated:", ledgerData.hash);
            setStatus(`ERR: COMMAND_UNREGISTERED. LEDGER_UPDATED [${ledgerData.hash.slice(0,8)}]`);
          }
        }).catch(err => {
          setStatus('ERR: COMMAND_UNREGISTERED. FALLBACK_ENGAGED.');
        });
      } else {
        setStatus(`PROCESSING: [${cmd.toUpperCase()}]`);
      }

    } catch (err) {
      console.error(err);
      setStatus('ERR: NETWORK_FAILURE. FALLBACK_ENGAGED.');
      playSequence(videoDictionary.idle);
      speakTTS('Error de conexión neuronal.');
    }
  };

  const playSequence = (src) => {
    setCurrentVideo(src);
    if (videoRef.current) {
      videoRef.current.src = src;
      videoRef.current.play().catch(e => console.error("Playback failed", e));
    }
  };

  useEffect(() => {
    // Loop idle video if the active video finishes and we are not already idle
    const handleEnded = () => {
      setStatus('SYS_READY');
      if (currentVideo !== videoDictionary.idle) {
        setCurrentVideo(videoDictionary.idle);
        if (videoRef.current) {
          videoRef.current.src = videoDictionary.idle;
          videoRef.current.loop = true;
          videoRef.current.play();
        }
      }
    };
    
    const v = videoRef.current;
    if (v) {
      v.addEventListener('ended', handleEnded);
    }
    return () => {
      if (v) v.removeEventListener('ended', handleEnded);
    };
  }, [currentVideo]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] font-sans text-[#2B3BE5] p-4">
      {/* HUD Header */}
      <div className="w-full max-w-4xl flex justify-between uppercase tracking-widest text-xs mb-4 border-b border-[#2B3BE5]/30 pb-2">
        <span>[ C5-REAL ENTITY INTERFACE ]</span>
        <span>{status}</span>
      </div>

      {/* Video Container (Industrial Noir) */}
      <div className="relative w-full max-w-4xl aspect-video bg-black border border-[#2B3BE5]/50 overflow-hidden shadow-[0_0_30px_rgba(43,59,229,0.15)]">
        {/* Retro CRT/VHS overlay effects */}
        <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30 z-10"></div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#2B3BE5]/5 to-transparent z-10 animate-scanline"></div>
        
        <video 
          ref={videoRef}
          src={currentVideo}
          autoPlay
          muted
          loop={currentVideo === videoDictionary.idle}
          playsInline
          className="w-full h-full object-cover filter contrast-125 saturate-50 sepia-[0.2] hue-rotate-[220deg]"
        ></video>
      </div>

      {/* Terminal Input */}
      <div className="w-full max-w-4xl mt-6">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <span className="absolute left-4 text-[#2B3BE5] font-mono">&gt;</span>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ENTER COMMAND SEQUENCE..."
            className="w-full bg-[#050505] border border-[#2B3BE5]/50 text-[#2B3BE5] font-mono py-4 pl-10 pr-4 focus:outline-none focus:border-[#2B3BE5] focus:shadow-[0_0_15px_rgba(43,59,229,0.3)] transition-all uppercase placeholder-[#2B3BE5]/30 tracking-widest"
          />
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
      `}} />
    </div>
  );
}
