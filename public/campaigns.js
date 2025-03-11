const Campaigns = ({ user }) => {
  const [campaigns, setCampaigns] = React.useState([]);
  const [selectedCampaign, setSelectedCampaign] = React.useState(null);
  const [notes, setNotes] = React.useState('');
  const [sessionDate, setSessionDate] = React.useState('');

  React.useEffect(() => {
    Backend.load(user.id, 'campaigns', []).then(data => {
      setCampaigns(Array.isArray(data) ? data : []);
    });
  }, [user.id]);

  React.useEffect(() => {
    Backend.save(user.id, 'campaigns', campaigns);
  }, [campaigns, user.id]);

  const createCampaign = () => {
    const newCampaign = { id: Date.now(), name: `Campaign ${campaigns.length + 1}`, sessions: [], notes: '' };
    setCampaigns([...campaigns, newCampaign]);
  };

  const addSession = () => {
    if (selectedCampaign && sessionDate) {
      setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? { ...c, sessions: [...c.sessions, { id: Date.now(), date: sessionDate, log: '' }] } : c));
      setSessionDate('');
    }
  };

  const updateNotes = () => {
    setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? { ...c, notes } : c));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && sessionDate) addSession();
  };

  return (
    <div className="campaigns">
      <h2>Campaigns</h2>
      <button onClick={createCampaign}>New Campaign</button>
      <div className="campaign-list">
        {campaigns.map(c => (
          <div key={c.id} onClick={() => { setSelectedCampaign(c); setNotes(c.notes); }} className="campaign-item animate-hover">{c.name}</div>
        ))}
      </div>
      {selectedCampaign && (
        <div className="campaign-details">
          <h3>{selectedCampaign.name}</h3>
          <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} onKeyPress={handleKeyPress} />
          <button onClick={addSession}>Add Session</button>
          <ul>{selectedCampaign.sessions.map(s => <li key={s.id}>{s.date}</li>)}</ul>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={updateNotes} placeholder="Campaign notes..." />
        </div>
      )}
    </div>
  );
};
