const MapEditor = ({ codexId, update }) => {
  const canvasRef = React.useRef(null);
  const [tool, setTool] = React.useState('freehand');
  const [isometric, setIsometric] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let drawing = false;

    const startDrawing = (e) => { drawing = true; draw(e); };
    const stopDrawing = () => { drawing = false; ctx.beginPath(); };
    const draw = (e) => {
      if (!drawing) return;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
    };
  }, [tool]);

  const addFurniture = (type) => {
    // Placeholder for furniture (e.g., chair, torch)
    console.log(`Adding ${type} to map`);
  };

  return (
    <div className="map-editor">
      <h4>Maps</h4>
      <select value={tool} onChange={e => setTool(e.target.value)}>
        <option value="freehand">Freehand</option>
        <option value="grid">Grid</option>
        <option value="furniture">Furniture</option>
      </select>
      <button onClick={() => setIsometric(!isometric)}>
        {isometric ? '2D' : 'Isometric'}
      </button>
      <canvas ref={canvasRef} width={500} height={400} style={{ border: '1px solid #000' }} />
      <div className="furniture-tools">
        <button onClick={() => addFurniture('chair')}>Chair</button>
        <button onClick={() => addFurniture('torch')}>Torch</button>
        <button onClick={() => addFurniture('trap')}>Trap</button>
      </div>
    </div>
  );
};