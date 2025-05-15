import { useEffect, useRef } from 'react';

export default () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Draw waveform
    const drawWaveform = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = '#19a44b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Simple sine wave for demo
      for (let x = 0; x < width; x++) {
        const y = Math.sin(x * 0.05) * (height * 0.3) + centerY;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    };
    
    drawWaveform();
  }, []);
  
  return (
    <div className="w-full h-12 bg-zinc-800 rounded-lg overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full opacity-70"
      />
    </div>
  );
};
