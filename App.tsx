
import React, { useState, useCallback, useRef } from 'react';
import { GeometryData, HistoryState } from './types';
import { parseGeometryPrompt } from './services/geminiService';
import GeometryCanvas from './components/GeometryCanvas';
import { 
  RotateCcw, 
  RotateCw, 
  Download, 
  Trash2, 
  Send, 
  Loader2,
  Cpu,
  Info
} from 'lucide-react';

const initialGeometry: GeometryData = {
  points: [],
  lines: [],
  circles: [],
  angles: []
};

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [geometry, setGeometry] = useState<GeometryData>(initialGeometry);
  const [history, setHistory] = useState<HistoryState[]>([{ geometry: initialGeometry }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const updateGeometry = useCallback((newData: GeometryData, addToHistory = true) => {
    setGeometry(newData);
    if (addToHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ geometry: newData });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [history, historyIndex]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const parsedData = await parseGeometryPrompt(prompt);
      updateGeometry(parsedData);
    } catch (err) {
      setError("Không thể hiểu đề bài. Vui lòng thử lại với mô tả rõ ràng hơn.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setGeometry(history[prevIndex].geometry);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setGeometry(history[nextIndex].geometry);
    }
  };

  const downloadImage = () => {
    const svg = document.querySelector('svg');
    if (!svg) return;

    // Clone the SVG to modify it for export without affecting the UI
    const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute('width', '1600');
    clonedSvg.setAttribute('height', '1200');
    
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw SVG
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Use toBlob instead of toDataURL for better reliability and performance
      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `hinh-ve-ai-${Date.now()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Cleanup
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
    };

    img.onerror = () => {
      console.error("Failed to load SVG for image conversion");
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const clearCanvas = () => {
    updateGeometry(initialGeometry);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight uppercase">AI VẼ HÌNH THÔNG MINH</h1>
            <p className="text-xs text-gray-500 font-medium italic">Tạo bởi: Mr. Tổng + Hưng</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={undo} 
            disabled={historyIndex === 0}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Hoàn tác (Ctrl+Z)"
          >
            <RotateCcw className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={redo} 
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Làm lại (Ctrl+Y)"
          >
            <RotateCw className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button 
            onClick={downloadImage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Tải ảnh
          </button>
          <button 
            onClick={clearCanvas}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa tất cả"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        {/* Left: Input Panel */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nhập đề bài toán</label>
            <textarea
              className="w-full h-40 p-3 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm leading-relaxed"
              placeholder="Ví dụ: Cho tam giác ABC vuông tại A, đường cao AH. Vẽ đường tròn tâm O đường kính BC..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full mt-4 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI đang suy nghĩ...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Vẽ hình chính xác
                </>
              )}
            </button>
            {error && (
              <p className="mt-3 text-sm text-red-500 font-medium bg-red-50 p-2 rounded-md border border-red-100">
                {error}
              </p>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-blue-600">
              <Info className="w-5 h-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">Hướng dẫn sử dụng</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-bold mt-0.5">1</span>
                <span>Kéo các <b>điểm đỏ</b> để thay đổi hình dạng mà vẫn giữ tính chất.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-bold mt-0.5">2</span>
                <span>Kéo <b>tên điểm (A, B, C...)</b> để tránh bị đè lên nét vẽ.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-bold mt-0.5">3</span>
                <span>Góc vuông tự động được kí hiệu nếu có trong đề bài.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-bold mt-0.5">TIP</span>
                <span>Hãy nhập đề bài chi tiết để AI hiểu đúng các mối quan hệ hình học.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Canvas Panel */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 text-[10px] font-bold text-gray-500 flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            CANVAS TƯƠNG TÁC THÔNG MINH
          </div>
          <GeometryCanvas 
            data={geometry} 
            onUpdate={(newData) => updateGeometry(newData, false)} 
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-2 px-6 text-center text-[10px] text-gray-400 font-medium tracking-widest uppercase">
        Hệ thống hỗ trợ giảng dạy Toán học THCS - Phiên bản 1.0.0
      </footer>
    </div>
  );
};

export default App;
