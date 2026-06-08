import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';
import React from 'react';
import { VinylRecord } from './VinylRecord';

const COVER_URL = 'https://f4.bcbits.com/img/a2524059091_10.jpg';

export const FarandulaVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const bgScale = interpolate(frame, [0, 600], [1.2, 1.4], {
		extrapolateRight: 'clamp',
	});

	const coverScale = spring({
		frame,
		fps,
		config: { damping: 14, mass: 0.8 },
	});

	const coverRotation = interpolate(frame, [0, 600], [-2, 2]);

	return (
		<AbsoluteFill style={{ backgroundColor: '#050505', overflow: 'hidden' }}>
			{/* Blurred Parallax Background */}
			<AbsoluteFill>
				<Img
					src={COVER_URL}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						filter: 'blur(60px) brightness(0.3) saturate(1.5)',
						transform: `scale(${bgScale})`,
					}}
				/>
			</AbsoluteFill>

			{/* Grain Overlay */}
			<AbsoluteFill
				style={{
					backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png")',
					opacity: 0.08,
					mixBlendMode: 'overlay',
					zIndex: 10,
					pointerEvents: 'none',
				}}
			/>

			{/* 3D Scene Container */}
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
				<div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'translateX(-200px)' }}>
					{/* Vinyl sliding out */}
					<VinylRecord coverUrl={COVER_URL} scale={coverScale} startFrame={45} />
					
					{/* Main Cover */}
					<Img
						src={COVER_URL}
						style={{
							width: 600,
							height: 600,
							boxShadow: '20px 20px 60px rgba(0,0,0,0.9), -10px -10px 30px rgba(255,255,255,0.05)',
							transform: `scale(${coverScale}) rotate(${coverRotation}deg)`,
							borderRadius: 8,
							zIndex: 2,
						}}
					/>
				</div>
			</AbsoluteFill>

			{/* Typography */}
			<Sequence from={30}>
				<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 120, zIndex: 5 }}>
					<h2
						style={{
							color: '#ff2a00',
							fontSize: 40,
							fontFamily: 'Inter, Helvetica, sans-serif',
							fontWeight: 800,
							letterSpacing: 10,
							margin: 0,
							marginBottom: 10,
							opacity: spring({ frame: frame - 30, fps, config: { damping: 20 } }),
							transform: `translateY(${interpolate(frame - 30, [0, 30], [20, 0], { extrapolateRight: 'clamp' })}px)`,
							textTransform: 'uppercase',
						}}
					>
						Borja Moskv
					</h2>
					<h1
						style={{
							color: '#ffffff',
							fontSize: 160,
							fontFamily: 'Inter, Helvetica, sans-serif',
							fontWeight: 900,
							letterSpacing: -5,
							margin: 0,
							textTransform: 'uppercase',
							lineHeight: 0.85,
							opacity: spring({ frame: frame - 45, fps, config: { damping: 20 } }),
							transform: `translateY(${interpolate(frame - 45, [0, 30], [50, 0], { extrapolateRight: 'clamp' })}px)`,
							textShadow: '0 20px 40px rgba(0,0,0,0.8)',
						}}
					>
						FARÁNDULA
					</h1>
					<div
						style={{
							width: interpolate(spring({ frame: frame - 60, fps }), [0, 1], [0, 200]),
							height: 8,
							backgroundColor: '#ff2a00',
							marginTop: 40,
							boxShadow: '0 0 20px #ff2a00',
						}}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* CTA */}
			<Sequence from={90}>
				<AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60, zIndex: 5 }}>
					<div
						style={{
							background: 'linear-gradient(90deg, #ff2a00, #ff6a00)',
							color: '#fff',
							padding: '15px 50px',
							fontSize: 24,
							letterSpacing: 4,
							fontWeight: 800,
							fontFamily: 'Inter, Helvetica, sans-serif',
							borderRadius: 50,
							textTransform: 'uppercase',
							opacity: spring({ frame: frame - 90, fps }),
							transform: `scale(${spring({ frame: frame - 90, fps, config: { damping: 12, mass: 0.8 } })}) translateY(${Math.sin(frame / 10) * 5}px)`,
							boxShadow: '0 10px 40px rgba(255, 42, 0, 0.5)',
						}}
					>
						Full Album out on Bandcamp
					</div>
				</AbsoluteFill>
			</Sequence>
		</AbsoluteFill>
	);
};
