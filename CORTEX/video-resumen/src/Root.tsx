import {Composition} from 'remotion';
import {CortazarSummary} from './CortazarSummary';
import {FarandulaVideo} from './FarandulaVideo/FarandulaVideo';
import {DiegoiGoalsVideo} from './DiegoiGoalsVideo';

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
			<Composition
				id="FarandulaVideo"
				component={FarandulaVideo}
				durationInFrames={900}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="DiegoiGoalsVideo"
				component={DiegoiGoalsVideo}
				durationInFrames={900}
				fps={30}
				width={1080}
				height={1920}
			/>
		</>
	);
};
