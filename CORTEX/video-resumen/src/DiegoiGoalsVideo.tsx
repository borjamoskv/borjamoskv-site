import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Audio } from 'remotion';
import bgmOmega from './bgm_omega.mp3';

export const DiegoiGoalsVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Dynamic volume envelope based on slides
  const volume = (() => {
    if (frame < 150) return 0.15; // Intro: low background beat
    if (frame >= 150 && frame < 330) return 0.05; // Dialogue: very quiet
    if (frame >= 330 && frame < 540) return 0.8; // Telemetry: loud chiptune peak
    if (frame >= 540 && frame < 720) return 1.0; // Purge: full volume climax
    // Outro fade out
    return interpolate(frame, [720, 850], [1.0, 0.0], { extrapolateRight: 'clamp' });
  })();

  // Timing triggers (frames)
  // 0 - 150: Intro / Expo 92 notebook
  // 150 - 330: El Chato enters / dialogue
  // 330 - 540: Telemetry table comparison
  // 540 - 720: Purgue of 98 goals
  // 720 - 900: Outro

  const op1 = interpolate(frame, [0, 30, 120, 150], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const scale1 = interpolate(frame, [0, 120], [0.95, 1.05], { extrapolateRight: 'clamp' });

  const op2 = interpolate(frame, [150, 170, 300, 330], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const scale2 = interpolate(frame, [150, 300], [1, 1.05], { extrapolateRight: 'clamp' });

  const op3 = interpolate(frame, [330, 350, 510, 540], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  
  const op4 = interpolate(frame, [540, 560, 690, 720], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  
  const op5 = interpolate(frame, [720, 750], [0, 1], { extrapolateRight: 'clamp' });

  // Glitch calculations
  const glitchOffset = frame % 12 === 0 ? (Math.random() * 30 - 15) : 0;
  const glitchColor = frame % 8 === 0 ? '#ff3333' : '#2B3BE5';

  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0A0A', color: '#F3F4F6', fontFamily: 'monospace', overflow: 'hidden' }}>
      
      {/* Background HUD Grid */}
      <AbsoluteFill style={{ opacity: 0.08, backgroundImage: 'linear-gradient(#2B3BE5 1px, transparent 1px), linear-gradient(90deg, #2B3BE5 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      {/* Frame border */}
      <AbsoluteFill style={{ border: '15px solid rgba(43, 59, 229, 0.2)', pointerEvents: 'none' }} />

      {/* Scene 1: Intro */}
      <AbsoluteFill style={{ opacity: op1, transform: `scale(${scale1})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10%' }}>
        <div style={{ color: '#2B3BE5', fontSize: '32px', marginBottom: '30px' }}><code>[ AUTOPSIA NARRATIVA ]</code></div>
        <h1 style={{ fontSize: '75px', textTransform: 'uppercase', textAlign: 'center', lineHeight: '1.1', fontWeight: '900', color: '#FFF' }}>
          El Cuarto B <br/>y la Mímesis
        </h1>
        <p style={{ fontSize: '36px', textAlign: 'center', marginTop: '60px', color: '#9CA3AF', lineHeight: '1.4' }}>
          Diegoi abre el cuaderno de la Expo 92 y sopla la ceniza del Ducados.
        </p>
        <div style={{ marginTop: '50px', fontSize: '32px', color: '#ff9f1c' }}>
          <em>— Surf en Hawái (2008)</em>
        </div>
      </AbsoluteFill>

      {/* Scene 2: El Chato dialogue */}
      <AbsoluteFill style={{ opacity: op2, transform: `scale(${scale2})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10%' }}>
        <div style={{ border: '2px solid #ff3333', padding: '10px 20px', color: '#ff3333', fontSize: '30px', marginBottom: '40px' }}>EL CHATO ENTRA</div>
        <div style={{ backgroundColor: 'rgba(255, 51, 51, 0.05)', borderLeft: '8px solid #ff3333', padding: '30px', width: '100%' }}>
          <p style={{ fontSize: '42px', color: '#FFF', margin: 0, lineHeight: '1.3' }}>
            "¿Novela existencialista? Diegoi, cabrón, si solo escribes scripts para tirarle el router al vecino."
          </p>
        </div>
        <p style={{ fontSize: '36px', textAlign: 'center', marginTop: '60px', color: '#9CA3AF' }}>
          La lista es una pila de basura entrópica copiada de perfiles de Instagram.
        </p>
      </AbsoluteFill>

      {/* Scene 3: Telemetry table */}
      <AbsoluteFill style={{ opacity: op3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5%' }}>
        <h2 style={{ fontSize: '45px', color: '#2B3BE5', textTransform: 'uppercase', margin: '0 0 40px 0', transform: `translateX(${glitchOffset}px)` }}>
          Exergía de Objetivos
        </h2>
        
        <div style={{ width: '100%', backgroundColor: 'rgba(10, 10, 12, 0.8)', border: '2px solid rgba(43,59,229,0.3)', borderRadius: '10px', padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2B3BE5', paddingBottom: '15px', fontSize: '24px', color: '#9CA3AF' }}>
            <span>META</span>
            <span>EXERGÍA</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', fontSize: '28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span>Surf en Hawái</span>
            <span style={{ color: '#ff3333' }}>0.94%</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', fontSize: '28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span>Cámara Leica M6</span>
            <span style={{ color: '#ff3333' }}>2.96%</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', fontSize: '28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span>Novela Existencial</span>
            <span style={{ color: '#ff3333' }}>6.15%</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', fontSize: '32px', fontWeight: 'bold', color: '#00ff66' }}>
            <span>Aprender Ensamblador</span>
            <span>93.45%</span>
          </div>
        </div>
      </AbsoluteFill>

      {/* Scene 4: Purgue */}
      <AbsoluteFill style={{ opacity: op4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10%' }}>
        <h1 style={{ fontSize: '80px', color: '#ff3333', textTransform: 'uppercase', fontWeight: '900', transform: `translateX(${-glitchOffset}px)` }}>
          PURGA DE METAS
        </h1>
        <div style={{ fontSize: '150px', color: '#ff3333', margin: '30px 0', textDecoration: 'line-through' }}>
          98
        </div>
        <p style={{ fontSize: '40px', textAlign: 'center', color: '#FFF' }}>
          Tachadas de la lista. <br/>Solo sobrevive la verdad.
        </p>
      </AbsoluteFill>

      {/* Scene 5: Outro */}
      <AbsoluteFill style={{ opacity: op5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10%' }}>
        <div style={{ fontSize: '48px', color: '#2B3BE5', marginBottom: '20px' }}><code>[ C5-REAL ]</code></div>
        <h1 style={{ fontSize: '85px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '8px', color: '#FFF', textShadow: `0 0 20px ${glitchColor}` }}>
          Soberanía
        </h1>
        <div style={{ width: '80%', height: '4px', backgroundColor: '#2B3BE5', margin: '40px 0' }} />
        
        <div style={{ border: '2px dashed #00ff66', padding: '25px', borderRadius: '5px', backgroundColor: 'rgba(0, 255, 102, 0.03)', margin: '20px 0', width: '100%' }}>
          <p style={{ fontSize: '32px', textAlign: 'center', color: '#00ff66', margin: 0, lineHeight: '1.4' }}>
            <strong>Mecanismo Escrow:</strong> El agente no posee las API keys (evita exfiltración). Las credenciales pertenecen al Escrow del entorno local.
          </p>
        </div>

        <p style={{ fontSize: '28px', color: '#ff9f1c', marginTop: '30px' }}>
          Homeostasis recuperada.
        </p>
      </AbsoluteFill>

      {/* Dynamic Audio track with dynamic volume envelope */}
      <Audio src={bgmOmega} volume={volume} loop />

    </AbsoluteFill>
  );
};
