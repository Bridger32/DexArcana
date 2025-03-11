const Home = () => {
  return (
    <div className="home animate-fade-in">
      <h1>Welcome to Codex</h1>
      <video controls muted style={{ maxWidth: '600px' }}>
        <source src="placeholder.mp4" type="video/mp4" />
        Your browser does not support video.
      </video>
      <ul>
        <li>Create worlds with Codex tools</li>
        <li>Play with interactive Player Screen</li>
        <li>Manage games via DM Screen</li>
        <li>Plan epic Campaigns</li>
        <li>Discuss in Forums</li>
        <li>Generate with AI tools</li>
      </ul>
    </div>
  );
};