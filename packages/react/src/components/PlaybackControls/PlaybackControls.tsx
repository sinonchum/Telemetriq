import React from 'react';
import { usePlaybackState } from '../../hooks/usePlaybackState';
import { usePlaybackControls } from '../../hooks/usePlaybackControls';
import './PlaybackControls.css';

export type PlaybackControlsProps = {
  showRateControl?: boolean;
  rates?: number[];
  showLoopToggle?: boolean;
  showTimeDisplay?: boolean;
};

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const msPart = Math.floor(ms % 1000);
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(msPart).padStart(3, '0')}`;
}

export function PlaybackControls({
  showRateControl = true,
  rates = [0.25, 0.5, 1, 2, 4, 8],
  showLoopToggle = true,
  showTimeDisplay = true,
}: PlaybackControlsProps) {
  const { playing, currentTime, playbackRate } = usePlaybackState();
  const { play, pause, seek, setRate } = usePlaybackControls();

  return (
    <div className="tq-playback-controls">
      <button className="tq-playback-btn" onClick={() => (playing ? pause() : play())} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? '⏸' : '▶'}
      </button>
      {showTimeDisplay && <span className="tq-time-display">{formatTime(currentTime)}</span>}
      <input className="tq-progress-bar" type="range" min={0} max={10000} value={currentTime} onChange={(e) => seek(Number(e.target.value))} />
      {showRateControl && (
        <select className="tq-rate-select" value={playbackRate} onChange={(e) => setRate(Number(e.target.value))}>
          {rates.map((r) => (<option key={r} value={r}>{r}x</option>))}
        </select>
      )}
    </div>
  );
}
