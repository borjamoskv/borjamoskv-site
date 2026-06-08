import {Composition} from 'remotion';
import {CortazarSummary} from './CortazarSummary';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="CortazarSummary"
				component={CortazarSummary}
				durationInFrames={600}
				fps={30}
				width={1080}
				height={1920}
			/>
		</>
	);
};
