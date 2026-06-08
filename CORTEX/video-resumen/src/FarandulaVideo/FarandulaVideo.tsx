import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, random } from 'remotion';

export const FarandulaVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Genesis-L5-OMEGA: Mitosis of 100 agents
  const agents = new Array(100).fill(0).map((_, i) => i);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0A0A', color: 'white', fontFamily: 'monospace' }}>
      {/* Background grid */}
      <AbsoluteFill style={{ opacity: 0.1, backgroundImage: 'linear-gradient(#2B3BE5 1px, transparent 1px), linear-gradient(90deg, #2B3BE5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Central Node (The Target Paper) */}
      <div style={{
        position: 'absolute',
        top: height / 2 - 150,
        left: width / 2 - 200,
        width: 400,
        height: 300,
        border: '4px solid #ff3333',
        backgroundColor: 'rgba(255, 51, 51, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: frame < 750 ? 1 : Math.max(0, 1 - (frame - 750) / 30),
        transform: `scale(${interpolate(frame, [600, 750], [1, 0.8], {extrapolateRight: 'clamp'})})`
      }}>
        <h2 style={{color: '#ff3333', fontSize: 40, margin: 0}}>PAPER_TARGET.PDF</h2>
        <p style={{color: '#ff3333', fontSize: 20}}>Claim: 100% Success Rate</p>
        <p style={{color: '#ff3333', fontSize: 16}}>Evidence: Probabilistic</p>
        {frame > 450 && <h1 style={{color: '#ff3333', fontSize: 80, position: 'absolute', transform: 'rotate(-15deg)', textShadow: '0 0 20px #ff3333'}}>ANNIHILATED</h1>}
      </div>

      {/* Agents Swarm */}
      {agents.map((i) => {
        const delay = i * 2;
        const entryScale = spring({ frame: frame - delay, fps, config: { damping: 12 } });
        
        // Random start positions around the edges (The void)
        const startX = random(i) * width;
        const startY = random(i + 100) > 0.5 ? -100 : height + 100;
        
        // Target is the center paper (Agent-Paper-RedTeam-OMEGA)
        const targetX = width / 2 + (random(i + 200) * 380 - 190);
        const targetY = height / 2 + (random(i + 300) * 280 - 140);

        // Move to target between frame 300 and 450
        const moveProgress = spring({ frame: frame - 300 - random(i)*60, fps, config: { damping: 15 } });
        
        const currentX = interpolate(moveProgress, [0, 1], [startX, targetX]);
        const currentY = interpolate(moveProgress, [0, 1], [startY, targetY]);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              backgroundColor: '#2B3BE5',
              left: currentX,
              top: currentY,
              transform: `scale(${entryScale})`,
              boxShadow: '0 0 15px #2B3BE5'
            }}
          />
        );
      })}

      {/* Typography HUD */}
      <AbsoluteFill style={{ padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 60, color: '#2B3BE5', margin: 0, textTransform: 'uppercase' }}>Genesis-L5-Ω // Mitosis</h1>
          <p style={{ fontSize: 30, color: '#fff', margin: 0 }}>Active Swarm Nodes: {Math.min(100, Math.floor(frame / 2))}</p>
        </div>

        {frame > 300 && (
          <div style={{ alignSelf: 'flex-end', textAlign: 'right' }}>
            <h1 style={{ fontSize: 60, color: '#ff3333', margin: 0, textTransform: 'uppercase' }}>Agent-Paper-RedTeam</h1>
            <p style={{ fontSize: 30, color: '#fff', margin: 0 }}>Protocol: Hostile Peer Review</p>
          </div>
        )}

        {frame > 750 && (
          <div style={{ position: 'absolute', top: height/2 - 100, left: 0, width: '100%', textAlign: 'center' }}>
            <h1 style={{ fontSize: 140, color: '#2B3BE5', margin: 0, letterSpacing: 20, textShadow: '0 0 30px #2B3BE5' }}>C5-REAL ENFORCED</h1>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
