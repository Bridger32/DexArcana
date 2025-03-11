const PlayerScreen = ({ user, grokGenerate }) => {
  const [stats, setStats] = React.useState({});
  const [tokens, setTokens] = React.useState([]);
  const [diceResult, setDiceResult] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [initiative, setInitiative] = React.useState([]);
  const [conditions, setConditions] = React.useState([]);
  const [loot, setLoot] = React.useState('');
  const [weather, setWeather] = React.useState('');
  const [sound, setSound] = React.useState('');
  const [timer, setTimer] = React.useState(0);
  const [npcMood, setNpcMood] = React.useState('');
  const [computerPlayers, setComputerPlayers] = React.useState([]);
  const canvasRef = React.useRef(null);
  const [canvasActive, setCanvasActive] = React.useState(false);

  React.useEffect(() => {
    Backend.load(user.id, 'playerStats', { hp: 20, ac: 15, speed: 30 }).then(data => setStats(data));
    Backend.load(user.id, 'tokens', []).then(data => setTokens(data));
  }, [user.id]);

  React.useEffect(() => {
    Backend.save(user.id, 'playerStats', stats);
    Backend.save(user.id, 'tokens', tokens);
    if (canvasRef.current && canvasActive) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.fillStyle = '#e0d0a0';
      ctx.fillRect(0, 0, 600, 400);
      for (let x = 0; x < 600; x += 30) for (let y = 0; y < 400; y += 30) ctx.strokeRect(x, y, 30, 30);
      tokens.forEach(t => {
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(t.x + 15, t.y + 15, 10, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [stats, tokens, canvasActive, user.id]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => t + 1);
      computerPlayers.forEach((cp, i) => {
        if (Math.random() < 0.1) {
          const newX = Math.min(Math.max(cp.x + (Math.random() - 0.5) * 60, 0), 570);
          const newY = Math.min(Math.max(cp.y + (Math.random() - 0.5) * 60, 0), 370);
          setComputerPlayers(prev => prev.map((p, idx) => idx === i ? { ...p, x: newX, y: newY } : p));
          setTokens(prev => prev.concat({ id: Date.now(), x: newX, y: newY }));
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [computerPlayers]);

  const rollDice = () => setDiceResult(Math.floor(Math.random() * 20) + 1);
  const addToInitiative = () => setInitiative([...initiative, { id: Date.now(), name: 'Combatant', roll: Math.floor(Math.random() * 20) + 1 }]);
  const addCondition = () => setConditions([...conditions, { id: Date.now(), name: 'Blinded' }]);
  const handleDrag = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 30) * 30;
    const y = Math.floor((e.clientY - rect.top) / 30) * 30;
    setTokens([...tokens, { id: Date.now(), x, y }]);
  };
  const generateLoot = () => setLoot(grokGenerate('Generate loot for level 5'));
  const generateWeather = () => setWeather(grokGenerate('Generate weather conditions'));
  const playSound = () => setSound('Playing: Tavern Noise (Placeholder)');
  const setMood = () => setNpcMood(grokGenerate('Generate NPC mood'));
  const addComputerPlayer = () => setComputerPlayers([...computerPlayers, { id: Date.now(), name: `NPC ${computerPlayers.length + 1}`, x: 0, y: 0 }]);
  const toggleCanvas = () => setCanvasActive(!canvasActive);

  return (
    <div className="player-screen">
      <h2>Player Screen</h2>
      <div className="widgets">
        <div className="widget">
          <h3>Stats</h3>
          <p>HP: <input type="number" value={stats.hp || ''} onChange={e => setStats({...stats, hp: e.target.value})} /></p>
          <p>AC: <input type="number" value={stats.ac || ''} onChange={e => setStats({...stats, ac: e.target.value})} /></p>
          <p>Speed: <input type="number" value={stats.speed || ''} onChange={e => setStats({...stats, speed: e.target.value})} /></p>
        </div>
        <div className="widget">
          <h3>Dice Roller</h3>
          <button onClick={rollDice}>Roll d20</button>
          <p>Result: {diceResult}</p>
        </div>
        <div className="widget">
          <h3>Initiative</h3>
          <button onClick={addToInitiative}>Add Combatant</button>
          <ul>{initiative.map(i => <li key={i.id}>{i.name}: {i.roll}</li>)}</ul>
        </div>
        <div className="widget">
          <h3>Conditions</h3>
          <button onClick={addCondition}>Add Condition</button>
          <ul>{conditions.map(c => <li key={c.id}>{c.name}</li>)}</ul>
        </div>
        <div className="widget">
          <h3>Loot</h3>
          <button onClick={generateLoot}>Generate Loot</button>
          <p>{loot}</p>
        </div>
        <div className="widget">
          <h3>Weather</h3>
          <button onClick={generateWeather}>Generate Weather</button>
          <p>{weather}</p>
        </div>
        <div className="widget">
          <h3>Soundboard</h3>
          <button onClick={playSound}>Play Tavern</button>
          <p>{sound}</p>
        </div>
        <div className="widget">
          <h3>Timer</h3>
          <p>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</p>
        </div>
        <div className="widget">
          <h3>NPC Mood</h3>
          <button onClick={setMood}>Set Mood</button>
          <p>{npcMood}</p>
        </div>
        <div className="widget">
          <h3>Computer Players</h3>
          <button onClick={addComputerPlayer}>Add NPC</button>
          <ul>{computerPlayers.map(cp => <li key={cp.id}>{cp.name} ({cp.x}, {cp.y})</li>)}</ul>
        </div>
        <div className="widget">
          <h3>Notepad</h3>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Session notes..." />
        </div>
      </div>
      <button onClick={toggleCanvas}>{canvasActive ? 'Hide Map' : 'Show Map'}</button>
      {canvasActive && <canvas ref={canvasRef} width="600" height="400" onClick={handleDrag}></canvas>}
    </div>
  );
};