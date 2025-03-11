const BrainMap = ({ relations }) => {
  const mountRef = React.useRef(null);

  React.useEffect(() => {
    if (!window.THREE) {
      console.error('Three.js not loaded!');
      return;
    }
    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new window.THREE.WebGLRenderer();
    renderer.setSize(400, 400);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new window.THREE.SphereGeometry(1, 32, 32);
    const material = new window.THREE.MeshBasicMaterial({ color: 0xD97706 });
    const sphere = new window.THREE.Mesh(geometry, material);
    scene.add(sphere);
    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      sphere.rotation.x += 0.01;
      sphere.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [relations]);

  return <div ref={mountRef} className="brain-map"></div>;
};