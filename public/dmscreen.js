const DMScreen = ({ user, grokGenerate }) => {
  const [npcs, setNpcs] = React.useState([]);
  const [notes, setNotes] = React.useState('');
  const [diceResult, setDiceResult] = React.useState('');
  const [initiative, setInitiative] = React.useState([]);
  const [loot, setLoot] = React.useState('');
  const [weather, setWeather] = React.useState('');
  const [sound, setSound] = React.useState('');
  const [timer, setTimer] = React.useState(0);
  const [npcMood, setNpcMood] = React.useState('');
  const [computerPlayers, setComputerPlayers] = React.useState([]);
  const canvasRef = React.useRef(null);
  const [canvasActive, setCanvasActive] = React.useState(false);

  React.useEffect(() => {
    Backend.load(user.id, 'npcs', []).then(data => setNpcs(data));
  }, [user.id]);

  React.useEffect(() => {
    Backend.save(user.id, 'npcs', npcs);
    if (canvasRef.current && canvasActive) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.fillStyle = '#e0d0a0';
      ctx.fillRect(0, 0, 600, 400);
      for (let x = 0; x < 600; x += 30) for (let y = 0; y < 400; y += 30) ctx.strokeRect(x, y, 30, 30);
      computerPlayers.forEach(cp => {
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(cp.x + 15, cp.y + 15, 10, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [npcs, computerPlayers, canvasActive, user.id]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => t + 1);
      computerPlayers.forEach((cp, i) => {
        if (Math.random() < 0.1) {
          const newX = Math.min(Math.max(cp.x + (Math.random() - 0.5) * 60, 0), 570);
          const newY = Math.min(Math.max(cp.y + (Math.random() - 0.5) * 60, 0), 370);
          setComputerPlayers(prev => prev.map((p, idx) => idx === i ? { ...p, x: newX, y: newY } : p));
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [computerPlayers]);

  const addNpc = () => setNpcs([...npcs, { id: Date.now(), name: `NPC ${npcs.length + 1}`, hp: 10, ac: 12 }]);
  const rollDice = () => setDiceResult(Math.floor(Math.random() * 20) + 1);
  const addToInitiative = () => setInitiative([...initiative, { id: Date.now(), name: 'Combatant', roll: Math.floor(Math.random() * 20) + 1 }]);
  const generateLoot = () => setLoot(grokGenerate('Generate loot for level 5'));
  const generateWeather = () => setWeather(grokGenerate('Generate weather conditions'));
  const playSound = () => setSound('Playing: Tavern Noise (Placeholder)');
  const setMood = () => setNpcMood(grokGenerate('Generate NPC mood'));
  const addComputerPlayer = () => setComputerPlayers([...computerPlayers, { id: Date.now(), name: `NPC ${computerPlayers.length + 1}`, x: 0, y: 0 }]);
  const toggleCanvas = () => setCanvasActive(!canvasActive);

  return (
    <div className="dm-screen">
      <h2>DM Screen</h2>
      <div className="widgets">
        <div className="widget">
          <h3>NPCs</h3>
          <button onClick={addNpc}>Add NPC</button>
          <ul>{npcs.map(n => <li key={n.id}>{n.name} (HP: {n.hp}, AC: {n.ac})</li>)}</ul>
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
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="DM notes..." />
        </div>
      </div>
      <button onClick={toggleCanvas}>{canvasActive ? 'Hide Map' : 'Show Map'}</button>
      {canvasActive && <canvas ref={canvasRef} width="600" height="400"></canvas>}
    </div>
  );
};