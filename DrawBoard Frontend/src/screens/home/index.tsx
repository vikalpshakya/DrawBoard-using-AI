import { ColorSwatch } from '@mantine/core';
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { SWATCHES, API_URL } from '@/constants';
import {
    Pencil,
    Eraser,
    Undo2,
    Redo2,
    Trash2,
    Play,
    Loader2,
    Minus,
    Plus,
} from 'lucide-react';

interface ApiResponse {
    expr: string;
    result: string;
    assign: boolean;
}

interface LatexOverlay {
    id: number;
    latex: string;
    position: { x: number; y: number };
}

type Tool = 'pen' | 'eraser';

const BRUSH_SIZES = [2, 5, 10, 18];

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<Tool>('pen');
    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(1);
    const [dictOfVars, setDictOfVars] = useState<Record<string, string>>({});
    const [overlays, setOverlays] = useState<LatexOverlay[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const undoStack = useRef<ImageData[]>([]);
    const redoStack = useRef<ImageData[]>([]);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);
    const overlayIdRef = useRef(0);

    const getCtx = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return canvas.getContext('2d');
    }, []);

    const saveSnapshot = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = getCtx();
        if (!canvas || !ctx) return;
        undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (undoStack.current.length > 50) undoStack.current.shift();
        redoStack.current = [];
    }, [getCtx]);

    const undo = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = getCtx();
        if (!canvas || !ctx || undoStack.current.length === 0) return;
        redoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        ctx.putImageData(undoStack.current.pop()!, 0, 0);
    }, [getCtx]);

    const redo = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = getCtx();
        if (!canvas || !ctx || redoStack.current.length === 0) return;
        undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        ctx.putImageData(redoStack.current.pop()!, 0, 0);
    }, [getCtx]);

    const resetCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = getCtx();
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        undoStack.current = [];
        redoStack.current = [];
        setOverlays([]);
        setDictOfVars({});
        setError(null);
    }, [getCtx]);

    // Canvas setup
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.putImageData(imageData, 0, 0);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        };

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }

        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    // MathJax
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
        script.async = true;
        document.head.appendChild(script);
        script.onload = () => {
            window.MathJax.Hub.Config({
                tex2jax: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
            });
        };
        return () => { document.head.removeChild(script); };
    }, []);

    // Re-typeset when overlays change
    useEffect(() => {
        if (overlays.length > 0 && window.MathJax) {
            setTimeout(() => {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
            }, 0);
        }
    }, [overlays]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey) {
                if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
                if (e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
                if (e.key === 'y') { e.preventDefault(); redo(); }
            }
            if (e.key === 'p') setTool('pen');
            if (e.key === 'e') setTool('eraser');
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [undo, redo]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const ctx = getCtx();
        if (!ctx) return;
        saveSnapshot();
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        lastPoint.current = { x, y };
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !lastPoint.current) return;
        const ctx = getCtx();
        if (!ctx) return;

        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        const prev = lastPoint.current;

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);

        // Quadratic bezier through midpoint for smooth curves
        const midX = (prev.x + x) / 2;
        const midY = (prev.y + y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);

        if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = BRUSH_SIZES[brushSize] * 3;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = color;
            ctx.lineWidth = BRUSH_SIZES[brushSize];
        }

        ctx.stroke();
        lastPoint.current = { x, y };
    };

    const stopDrawing = () => {
        const ctx = getCtx();
        if (ctx) ctx.globalCompositeOperation = 'source-over';
        lastPoint.current = null;
        setIsDrawing(false);
    };

    const findDrawingCenter = (): { x: number; y: number } => {
        const canvas = canvasRef.current;
        const ctx = getCtx();
        if (!canvas || !ctx) return { x: 200, y: 200 };

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
        let hasPixels = false;

        for (let y = 0; y < canvas.height; y += 4) {
            for (let x = 0; x < canvas.width; x += 4) {
                const i = (y * canvas.width + x) * 4;
                if (imageData.data[i + 3] > 0) {
                    hasPixels = true;
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        if (!hasPixels) return { x: canvas.width / 2, y: canvas.height / 2 };
        return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
    };

    const runAnalysis = async () => {
        const canvas = canvasRef.current;
        if (!canvas || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_URL}/calculate`, {
                image: canvas.toDataURL('image/png'),
                dict_of_vars: dictOfVars,
            });

            const results: ApiResponse[] = response.data.data;
            const center = findDrawingCenter();

            results.forEach((data, i) => {
                if (data.assign) {
                    setDictOfVars(prev => ({ ...prev, [data.expr]: data.result }));
                }

                const latex = `\\(\\LARGE{\\text{${data.expr}} = \\text{${data.result}}}\\)`;
                const id = ++overlayIdRef.current;
                setTimeout(() => {
                    setOverlays(prev => [...prev, {
                        id,
                        latex,
                        position: { x: center.x, y: center.y + i * 60 },
                    }]);

                    const ctx = getCtx();
                    if (ctx && canvas) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }, i * 500);
            });
        } catch (e) {
            const msg = axios.isAxiosError(e)
                ? (e.response?.data?.detail || e.message)
                : 'Something went wrong';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const currentBrushSize = BRUSH_SIZES[brushSize];

    return (
        <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#1a1a2e' }}>
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{
                    cursor: tool === 'eraser'
                        ? 'crosshair'
                        : `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='${currentBrushSize + 8}' height='${currentBrushSize + 8}'><circle cx='${(currentBrushSize + 8) / 2}' cy='${(currentBrushSize + 8) / 2}' r='${currentBrushSize / 2}' fill='none' stroke='white' stroke-width='1.5'/></svg>") ${(currentBrushSize + 8) / 2} ${(currentBrushSize + 8) / 2}, crosshair`,
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />

            {/* Floating Toolbar */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-3 rounded-2xl border border-white/10"
                 style={{ background: 'rgba(20, 20, 40, 0.85)', backdropFilter: 'blur(16px)' }}>

                {/* Tools */}
                <ToolButton
                    active={tool === 'pen'}
                    onClick={() => setTool('pen')}
                    title="Pen (P)"
                >
                    <Pencil size={20} />
                </ToolButton>

                <ToolButton
                    active={tool === 'eraser'}
                    onClick={() => setTool('eraser')}
                    title="Eraser (E)"
                >
                    <Eraser size={20} />
                </ToolButton>

                <Divider />

                {/* Brush size */}
                <ToolButton onClick={() => setBrushSize(s => Math.max(0, s - 1))} title="Smaller brush">
                    <Minus size={16} />
                </ToolButton>
                <div className="flex items-center justify-center w-10 h-6">
                    <div
                        className="rounded-full bg-white"
                        style={{ width: currentBrushSize + 2, height: currentBrushSize + 2 }}
                    />
                </div>
                <ToolButton onClick={() => setBrushSize(s => Math.min(BRUSH_SIZES.length - 1, s + 1))} title="Larger brush">
                    <Plus size={16} />
                </ToolButton>

                <Divider />

                {/* Colors */}
                {SWATCHES.map((swatch) => (
                    <button
                        key={swatch}
                        onClick={() => { setColor(swatch); setTool('pen'); }}
                        className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-110"
                        style={{
                            outline: color === swatch && tool === 'pen' ? `2px solid ${swatch}` : '2px solid transparent',
                            outlineOffset: '2px',
                        }}
                        title={swatch}
                    >
                        <ColorSwatch color={swatch} size={22} />
                    </button>
                ))}

                <Divider />

                {/* Undo / Redo */}
                <ToolButton onClick={undo} title="Undo (Ctrl+Z)">
                    <Undo2 size={20} />
                </ToolButton>
                <ToolButton onClick={redo} title="Redo (Ctrl+Shift+Z)">
                    <Redo2 size={20} />
                </ToolButton>

                <Divider />

                {/* Clear */}
                <ToolButton onClick={resetCanvas} title="Clear canvas">
                    <Trash2 size={20} />
                </ToolButton>
            </div>

            {/* Run Button */}
            <button
                onClick={runAnalysis}
                disabled={isLoading}
                className="absolute bottom-6 right-6 flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 4px 24px rgba(99, 102, 241, 0.4)',
                }}
            >
                {isLoading ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Play size={20} />
                        Run
                    </>
                )}
            </button>

            {/* Error Toast */}
            {error && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-white text-sm"
                     style={{ background: 'rgba(239, 68, 68, 0.9)', backdropFilter: 'blur(8px)' }}>
                    {error}
                    <button onClick={() => setError(null)} className="ml-3 font-bold hover:opacity-70">&times;</button>
                </div>
            )}

            {/* LaTeX Overlays */}
            {overlays.map((overlay) => (
                <Draggable
                    key={overlay.id}
                    defaultPosition={overlay.position}
                >
                    <div className="absolute p-3 rounded-xl text-white cursor-grab active:cursor-grabbing"
                         style={{ background: 'rgba(20, 20, 40, 0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="latex-content" dangerouslySetInnerHTML={{ __html: overlay.latex }} />
                    </div>
                </Draggable>
            ))}
        </div>
    );
}

function ToolButton({ children, active, onClick, title }: {
    children: React.ReactNode;
    active?: boolean;
    onClick: () => void;
    title: string;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                active
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="w-full h-px bg-white/10 my-1" />;
}
