const Forums = ({ user }) => {
  const [threads, setThreads] = React.useState([]);
  const [newThread, setNewThread] = React.useState('');
  const [section, setSection] = React.useState('General');
  const [matureFilter, setMatureFilter] = React.useState(false);

  React.useEffect(() => {
    Backend.load(user.id, 'threads', []).then(data => setThreads(data));
  }, [user.id]);

  React.useEffect(() => {
    Backend.save(user.id, 'threads', threads);
  }, [threads, user.id]);

  const createThread = () => {
    if (newThread.trim()) {
      const filteredTitle = newThread.replace(/fuck/gi, 'fudge');
      setThreads([...threads, { id: Date.now(), title: filteredTitle, posts: [], section, flagged: filteredTitle !== newThread }]);
      setNewThread('');
    }
  };

  const reportThread = (id) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, flagged: true } : t));
  };

  return (
    <div className="forums">
      <h2>Forums</h2>
      <label>Mature Filter: <input type="checkbox" checked={matureFilter} onChange={e => setMatureFilter(e.target.checked)} /></label>
      <select value={section} onChange={e => setSection(e.target.value)}>
        <option>General</option>
        <option>Rules</option>
        <option>Stories</option>
      </select>
      <input value={newThread} onChange={e => setNewThread(e.target.value)} placeholder="New thread..." />
      <button onClick={createThread}>Post</button>
      <div className="thread-list">
        {threads.filter(t => t.section === section).map(t => (
          <div key={t.id} className="thread-item animate-hover">
            {matureFilter && t.flagged ? '[Filtered]' : t.title}
            <button onClick={() => reportThread(t.id)}>Report</button>
          </div>
        ))}
      </div>
    </div>
  );
};