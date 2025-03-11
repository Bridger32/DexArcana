import React, { useState, useEffect, useRef } from 'react';

const Codex = ({ user, grokGenerate, onRestrictedClick }) => {
  const [codexes, setCodexes] = useState([]);
  const [selectedCodex, setSelectedCodex] = useState(null);
  const [section, setSection] = useState('Lore');
  const [content, setContent] = useState('');
  const [bookOpen, setBookOpen] = useState(false);
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [canvasActive, setCanvasActive] = useState(false);

  useEffect(() => {
    Backend.load(user.id, 'codexes', []).then(data => {
      setCodexes(Array.isArray(data) ? data : []);
    });
  }, [user.id]);

  useEffect(() => {
    if (user.tier !== 'scribe') {
      Backend.save(user.id, 'codexes', codexes);
    }
    if (section === 'Maps' && selectedCodex && canvasRef.current && canvasActive) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, 600, 400);
      ctx.fillStyle = '#e0d0a0';
      ctx.fillRect(0, 0, 600, 400);
      const gridSize = 30 * zoom;
      for (let x = 0; x < 600; x += gridSize) for (let y = 0; y < 400; y += gridSize) ctx.strokeRect(x, y, gridSize, gridSize);
      selectedCodex.sections.Maps.forEach(t => {
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(t.x * zoom + gridSize / 2, t.y * zoom + gridSize / 2, 10 * zoom, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [codexes, section, zoom, canvasActive, user.id]);

  const createCodex = () => {
    if (onRestrictedClick && onRestrictedClick()) return;
    const newCodex = { 
      id: Date.now(), 
      name: `Codex ${codexes.length + 1}`, 
      sections: { 
        Settings: { campaign: 'D&D 5e', rules: 'D&D', ai: 'Strict' },
        Lore: '', Secrets: [], Buildings: [], Characters: [], Conditions: [], Documents: [], Ethnicities: [],
        Geographic: [], Generic: [], Items: [], Laws: [], Languages: [], Conflicts: [], Formations: [],
        Myths: [], Organizations: [], Professions: [], Prose: [], Ranks: [], Session: [], Settlements: [],
        Species: [], Spells: [], Plots: [], Tech: [], Traditions: [], Vehicles: [], Timeline: [], Relations: [], Maps: []
      } 
    };
    setCodexes([...codexes, newCodex]);
  };

  const deleteCodex = (id) => {
    if (onRestrictedClick && onRestrictedClick()) return;
    setCodexes(prev => prev.filter(c => c.id !== id));
    if (selectedCodex && selectedCodex.id === id) {
      setSelectedCodex(null);
      setBookOpen(false);
      setContent('');
    }
  };

  return (
    <div className="codex">
      <h2>Codex</h2>
      {!selectedCodex && (
        <>
          <div className="codex-form">
            <input value={content} onChange={e => setContent(e.target.value)} placeholder="New Codex Name" />
            <button onClick={createCodex}>Create Codex</button>
          </div>
          <div className="codex-list">
            {codexes.map(c => (
              <div
                key={c.id}
                onClick={() => { setSelectedCodex(c); setContent(c.sections[section] || ''); setBookOpen(true); setCanvasActive(true); }}
                className="codex-cover animate-hover"
              >
                <h3>{c.name}</h3>
              </div>
            ))}
          </div>
        </>
      )}
      {selectedCodex && (
        <div className={`codex-book ${bookOpen ? 'open' : ''}`}>
          <div
            className="book-cover"
            onClick={() => { setBookOpen(!bookOpen); if (!bookOpen) setCanvasActive(true); else setCanvasActive(false); }}
          >
            <h3>{selectedCodex.name}</h3>
          </div>
          {bookOpen && (
            <div className="book-content">
              <button onClick={() => deleteCodex(selectedCodex.id)}>Delete Codex</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Codex;