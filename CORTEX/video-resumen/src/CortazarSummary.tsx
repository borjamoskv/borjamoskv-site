import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const CortazarSummary: React.FC = () => {
  const frame = useCurrentFrame();

  // Part 1: Combustible
  const op1 = interpolate(frame, [0, 30, 150, 180], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const y1 = interpolate(frame, [0, 30], [50, 0], { extrapolateRight: 'clamp' });

  // Part 2: Proximidad
  const op2 = interpolate(frame, [180, 210, 330, 360], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  
  // Part 3: Autonomía / Cruzadas
  const op3 = interpolate(frame, [360, 390, 510, 540], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

  // Outro
  const op4 = interpolate(frame, [540, 570], [0, 1], { extrapolateRight: 'clamp' });

  // Glitch effect math
  const glitch = frame % 15 === 0 ? Math.random() * 20 - 10 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0A0A', color: 'white', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Background grid */}
      <AbsoluteFill style={{ opacity: 0.1, backgroundImage: 'linear-gradient(#2B3BE5 1px, transparent 1px), linear-gradient(90deg, #2B3BE5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Slide 1 */}
      <AbsoluteFill style={{ opacity: op1, transform: `translateY(${y1}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10%' }}>
        <h1 style={{ fontSize: '80px', color: '#2B3BE5', textTransform: 'uppercase', textAlign: 'center', transform: `translateX(${glitch}px)` }}>I. El Combustible</h1>
        <p style={{ fontSize: '40px', textAlign: 'center', marginTop: '40px' }}>Calidad real.<br/>Arquitectura biológica<br/>y mental.<br/>Cero humo.</p>
      </AbsoluteFill>

      {/* Slide 2 */}
      <AbsoluteFill style={{ opacity: op2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10%' }}>
        <h1 style={{ fontSize: '80px', color: '#2B3BE5', textTransform: 'uppercase', textAlign: 'center', transform: `translateX(${-glitch}px)` }}>II. La Proximidad</h1>
        <p style={{ fontSize: '40px', textAlign: 'center', marginTop: '40px' }}>Conversaciones independientes.<br/>Interdependencia diaria.<br/>El cronopio teje la red.</p>
      </AbsoluteFill>

      {/* Slide 3 */}
      <AbsoluteFill style={{ opacity: op3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10%' }}>
        <h1 style={{ fontSize: '80px', color: '#2B3BE5', textTransform: 'uppercase', textAlign: 'center', transform: `translateY(${glitch}px)` }}>III. La Encrucijada</h1>
        <p style={{ fontSize: '40px', textAlign: 'center', marginTop: '40px' }}>Entrevistas en vivo.<br/>Sin jerarquías.<br/>Discernimiento colectivo.</p>
      </AbsoluteFill>

      {/* Slide 4 / Outro */}
      <AbsoluteFill style={{ opacity: op4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10%' }}>
        <h1 style={{ fontSize: '100px', color: '#fff', textTransform: 'uppercase', textAlign: 'center' }}>SOBERANÍA</h1>
        <div style={{ width: '100%', height: '4px', backgroundColor: '#2B3BE5', margin: '40px 0' }} />
        <p style={{ fontSize: '50px', textAlign: 'center', color: '#2B3BE5' }}>C5-REAL</p>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
