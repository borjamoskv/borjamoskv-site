import { Img, interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import React from 'react';

export const VinylRecord: React.FC<{ coverUrl: string; scale: number; startFrame: number }> = ({ coverUrl, scale, startFrame }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	
	const rotation = (frame / fps) * 90; // 90 degrees per second

	const slideOut = spring({
		frame: frame - startFrame,
		fps,
		config: { damping: 14, mass: 1.2 },
	});

	const translateX = interpolate(slideOut, [0, 1], [0, 350]);

	return (
		<div
			style={{
				width: 580,
				height: 580,
				borderRadius: '50%',
				backgroundColor: '#050505',
				boxShadow: '0 0 20px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,1)',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				position: 'absolute',
				transform: `translateX(${translateX}px) scale(${scale}) rotate(${rotation}deg)`,
				zIndex: -1,
			}}
		>
			<div style={{ width: '95%', height: '95%', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', position: 'absolute' }} />
			<div style={{ width: '85%', height: '85%', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.03)', position: 'absolute' }} />
			<div style={{ width: '75%', height: '75%', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', position: 'absolute' }} />
			<div style={{ width: '65%', height: '65%', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.02)', position: 'absolute' }} />

			<Img
				src={coverUrl}
				style={{
					width: 190,
					height: 190,
					borderRadius: '50%',
					objectFit: 'cover',
				}}
			/>
			<div style={{ width: 14, height: 14, backgroundColor: '#000', borderRadius: '50%', position: 'absolute' }} />
		</div>
	);
};
