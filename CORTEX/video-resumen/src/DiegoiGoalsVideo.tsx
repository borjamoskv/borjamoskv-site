import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Audio } from 'remotion';
import bgmOmega from './bgm_omega.mp3';

export const DiegoiGoalsVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Dynamic volume envelope across the 4-minute duration (7200 frames)
  const volume = (() => {
    if (frame < 1000) return 0.15; // Slide 1: Low ambient beat
    if (frame >= 1000 && frame < 2500) return 0.05; // Slide 2: Quiet dialogue
    if (frame >= 2500 && frame < 4000) return 0.8; // Slide 3: Telemetry Metas (Loud)
    if (frame >= 4000 && frame < 5500) return 0.2; // Slide 4: Sexual Recession Dialogue (Quiet)
    if (frame >= 5500 && frame < 6800) return 0.8; // Slide 5: Telemetry Relaciones (Loud)
    return interpolate(frame, [6800, 7100], [0.8, 0.0], { extrapolateRight: 'clamp' }); // Slide 6: Outro fade out
  })();

  // Timing Triggers (Fades)
  const op1 = interpolate(frame, [0, 920, 1000], [1, 1, 0], { extrapolateRight: 'clamp' });
  const scale1 = interpolate(frame, [0, 920], [1.0, 1.05], { extrapolateRight: 'clamp' });

  const op2 = interpolate(frame, [1000, 1080, 2420, 2500], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const scale2 = interpolate(frame, [1000, 2420], [1, 1.05], { extrapolateRight: 'clamp' });

  const op3 = interpolate(frame, [2500, 2580, 3920, 4000], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const scale3 = interpolate(frame, [2500, 3920], [1, 1.02], { extrapolateRight: 'clamp' });

  const op4 = interpolate(frame, [4000, 4080, 5420, 5500], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const scale4 = interpolate(frame, [4000, 5420], [1, 1.05], { extrapolateRight: 'clamp' });

  const op5 = interpolate(frame, [5500, 5580, 6720, 6800], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const scale5 = interpolate(frame, [5500, 6720], [1, 1.02], { extrapolateRight: 'clamp' });

  const op6 = interpolate(frame, [6800, 6880], [0, 1], { extrapolateRight: 'clamp' });

  // Glitch values
  const glitchOffset = frame % 15 === 0 ? (Math.random() * 26 - 13) : 0;
  const glitchColor = frame % 10 === 0 ? '#ff3333' : '#2B3BE5';

  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0A0A', color: '#F3F4F6', fontFamily: 'monospace', overflow: 'hidden' }}>
      
      {/* Background HUD Grid */}
      <AbsoluteFill style={{ opacity: 0.08, backgroundImage: 'linear-gradient(#2B3BE5 1px, transparent 1px), linear-gradient(90deg, #2B3BE5 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      {/* Frame border */}
      <AbsoluteFill style={{ border: '15px solid rgba(43, 59, 229, 0.2)', pointerEvents: 'none' }} />

      {/* Scene 1: Intro (Expo 92) */}
      <AbsoluteFill style={{ opacity: op1, transform: `scale(${scale1})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10%' }}>
        <div style={{ color: '#2B3BE5', fontSize: '32px', marginBottom: '30px' }}><code>[ AUTOPSIA NARRATIVA · I ]</code></div>
        <h1 style={{ fontSize: '75px', textTransform: 'uppercase', textAlign: 'center', lineHeight: '1.1', fontWeight: '900', color: '#FFF' }}>
          El Cuarto B <br/>y la Mímesis
        </h1>
        <p style={{ fontSize: '36px', textAlign: 'center', marginTop: '60px', color: '#9CA3AF', lineHeight: '1.4' }}>
          Diegoi abre el cuaderno de la Expo 92 y sopla la ceniza del Ducados buscando su meta de 2008.
        </p>
        <div style={{ marginTop: '50px', fontSize: '32px', color: '#ff9f1c' }}>
          <em>— Surf en Hawái (2008)</em>
        </div>
      </AbsoluteFill>

      {/* Scene 2: El Chato & Metas */}
      <AbsoluteFill style={{ opacity: op2, transform: `scale(${scale2})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10%' }}>
        <div style={{ border: '2px solid #ff3333', padding: '10px 20px', color: '#ff3333', fontSize: '30px', marginBottom: '40px' }}>EL CHATO ENTRA</div>
        <div style={{ backgroundColor: 'rgba(255, 51, 51, 0.05)', borderLeft: '8px solid #ff3333', padding: '30px', width: '100%' }}>
          <p style={{ fontSize: '42px', color: '#FFF', margin: 0, lineHeight: '1.3' }}>
            "¿Novela existencialista? Diegoi, cabrón, si solo escribes scripts para tirarle el router al vecino."
          </p>
        </div>
        <p style={{ fontSize: '36px', textAlign: 'center', marginTop: '60px', color: '#9CA3AF', lineHeight: '1.4' }}>
          La lista de 100 cosas es una pila de basura entrópica copiada para simular felicidad ante otros.
        </p>
      </AbsoluteFill>

      {/* Scene 3: Linter de Metas */}
      <AbsoluteFill style={{ opacity: op3, transform: `scale(${scale3})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5%' }}>
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

      {/* Scene 4: La Recesión Sexual */}
      <AbsoluteFill style={{ opacity: op4, transform: `scale(${scale4})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10%' }}>
        <div style={{ color: '#2B3BE5', fontSize: '32px', marginBottom: '30px' }}><code>[ AUTOPSIA NARRATIVA · II ]</code></div>
        <h1 style={{ fontSize: '70px', textTransform: 'uppercase', textAlign: 'center', lineHeight: '1.1', fontWeight: '900', color: '#FFF' }}>
          La Recesión <br/>Sexual
        </h1>
        <div style={{ backgroundColor: 'rgba(43, 59, 229, 0.05)', borderLeft: '8px solid #2B3BE5', padding: '25px', width: '100%', marginTop: '40px' }}>
          <p style={{ fontSize: '36px', color: '#FFF', margin: 0, lineHeight: '1.4' }}>
            "He tenido sexo con varias personas, pero me siento sola. Echo de menos que signifique algo."
          </p>
        </div>
        <p style={{ fontSize: '34px', textAlign: 'center', marginTop: '40px', color: '#9CA3AF', lineHeight: '1.4' }}>
          Consumimos cuerpos como pidiendo sushi. Eliminamos la fricción física para evitar el dolor.
        </p>
      </AbsoluteFill>

      {/* Scene 5: Linter de Relaciones */}
      <AbsoluteFill style={{ opacity: op5, transform: `scale(${scale5})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5%' }}>
        <h2 style={{ fontSize: '42px', color: '#2B3BE5', textTransform: 'uppercase', margin: '0 0 40px 0', transform: `translateX(${-glitchOffset}px)` }}>
          Exergía de Vínculo
        </h2>
        
        <div style={{ width: '100%', backgroundColor: 'rgba(10, 10, 12, 0.8)', border: '2px solid rgba(43,59,229,0.3)', borderRadius: '10px', padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2B3BE5', paddingBottom: '15px', fontSize: '22px', color: '#9CA3AF' }}>
            <span>CONEXIÓN</span>
            <span>PRESENCIA</span>
            <span>EXERGÍA</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', fontSize: '26px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span>Contacto Tinder</span>
            <span>1.5 hrs</span>
            <span style={{ color: '#ff3333' }}>1.92%</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', fontSize: '26px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span>Follamistad</span>
            <span>2.0 hrs</span>
            <span style={{ color: '#ff3333' }}>14.29%</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', fontSize: '30px', fontWeight: 'bold', color: '#00ff66' }}>
            <span>Vínculo Cuarto B</span>
            <span>15.0 hrs</span>
            <span>94.40%</span>
          </div>
        </div>
      </AbsoluteFill>

      {/* Scene 6: Outro & Escrow */}
      <AbsoluteFill style={{ opacity: op6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10%' }}>
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

      {/* Dynamic looping Audio track */}
      <Audio src={bgmOmega} volume={volume} loop />

    </AbsoluteFill>
  );
};
