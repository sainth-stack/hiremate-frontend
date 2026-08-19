import AnswerMediaPlayer from './AnswerMediaPlayer';

/** Backward-compatible wrapper */
export default function AnswerAudioPlayer(props) {
  return (
    <AnswerMediaPlayer
      {...props}
      kind="audio"
      hasMedia={props.hasAudio}
    />
  );
}

export { AnswerMediaPlayer };
