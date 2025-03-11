const Streaming = ({ user }) => {
  const [streamActive, setStreamActive] = React.useState(false);
  const [error, setError] = React.useState('');
  const videoRef = React.useRef(null);

  const toggleStream = async () => {
    if (!streamActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamActive(true);
        setError('');
        console.log('Stream started - WebRTC placeholder');
      } catch (e) {
        setError('Failed to start stream - check permissions');
        console.error('Stream failed:', e);
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setStreamActive(false);
      console.log('Stream stopped');
    }
  };

  return (
    <div className="streaming">
      <h2>Streaming</h2>
      <button onClick={toggleStream}>{streamActive ? 'Stop Stream' : 'Start Stream'}</button>
      <div className="stream-placeholder">
        <video ref={videoRef} autoPlay muted={true} style={{ width: '100%', maxWidth: '600px' }} />
        <p>{streamActive ? 'Streaming Active (Local Preview)' : 'Stream Inactive'}</p>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};