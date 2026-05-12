import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { SWATCHES, API_URL } from '@/constants';
import { Pencil, Eraser, Undo2, Redo2, Trash2, Loader2, Minus, Plus } from 'lucide-react';
import './home.css';

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
    const [color, setColor] = useState('#f0e8d0');
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
        if (ctx) { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

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
        lastPoint.current = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !lastPoint.current) return;
        const ctx = getCtx();
        if (!ctx) return;
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        const prev = lastPoint.current;
        const midX = (prev.x + x) / 2;
        const midY = (prev.y + y) / 2;

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
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

    const findDrawingBounds = () => {
        const canvas = canvasRef.current;
        const ctx = getCtx();
        if (!canvas || !ctx) return null;
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
        if (!hasPixels) return null;
        return { minX, minY, maxX, maxY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
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
            const bounds = findDrawingBounds();
            const drawingCenterX = bounds?.centerX ?? canvas.width / 2;

            const resultX = bounds && bounds.maxX + 200 < canvas.width
                ? bounds.maxX + 80
                : drawingCenterX;
            const resultY = bounds ? bounds.minY : canvas.height / 2;

            results.forEach((data, i) => {
                if (data.assign) {
                    setDictOfVars(prev => ({ ...prev, [data.expr]: data.result }));
                }
                const latex = `${data.expr} = ${data.result}`;
                const id = ++overlayIdRef.current;
                setTimeout(() => {
                    setOverlays(prev => [...prev, {
                        id,
                        latex,
                        position: { x: resultX, y: resultY + i * 80 },
                    }]);
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

    const currentBrushPx = BRUSH_SIZES[brushSize];
    const cursorSize = currentBrushPx + 8;
    const cursorHalf = cursorSize / 2;
    const cursorRadius = currentBrushPx / 2;
    const customCursor = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='${cursorSize}' height='${cursorSize}'><circle cx='${cursorHalf}' cy='${cursorHalf}' r='${cursorRadius}' fill='none' stroke='%23c9a13c' stroke-width='1.5' opacity='0.8'/></svg>") ${cursorHalf} ${cursorHalf}, crosshair`;

    return (
        <div className="grimoire-root">
            {/* Atmospheric layers */}
            <div className="grimoire-grain" />
            <div className="grimoire-vignette" />

            {/* Drawing canvas */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1,
                    cursor: tool === 'eraser' ? 'crosshair' : customCursor,
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />

            {/* Grimoire Sidebar */}
            <aside className="grimoire-sidebar">
                <div className="grimoire-ornament">◆</div>

                <GBtn active={tool === 'pen'} onClick={() => setTool('pen')} title="Pen (P)">
                    <Pencil size={15} />
                </GBtn>
                <GBtn active={tool === 'eraser'} onClick={() => setTool('eraser')} title="Eraser (E)">
                    <Eraser size={15} />
                </GBtn>

                <div className="grimoire-divider" />

                <GBtn onClick={() => setBrushSize(s => Math.max(0, s - 1))} title="Smaller brush">
                    <Minus size={12} />
                </GBtn>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 18 }}>
                    <div style={{
                        borderRadius: '50%',
                        background: '#e8c870',
                        width: Math.min(currentBrushPx + 2, 18),
                        height: Math.min(currentBrushPx + 2, 18),
                        boxShadow: '0 0 6px rgba(232,200,112,0.4)',
                    }} />
                </div>
                <GBtn onClick={() => setBrushSize(s => Math.min(BRUSH_SIZES.length - 1, s + 1))} title="Larger brush">
                    <Plus size={12} />
                </GBtn>

                <div className="grimoire-divider" />

                <div className="swatch-grid">
                    {SWATCHES.map((swatch) => (
                        <button
                            key={swatch}
                            className={`grimoire-swatch${color === swatch && tool === 'pen' ? ' active' : ''}`}
                            style={{ background: swatch }}
                            onClick={() => { setColor(swatch); setTool('pen'); }}
                            title={swatch}
                        />
                    ))}
                </div>

                <div className="grimoire-divider" />

                <GBtn onClick={undo} title="Undo (Ctrl+Z)"><Undo2 size={15} /></GBtn>
                <GBtn onClick={redo} title="Redo (Ctrl+Shift+Z)"><Redo2 size={15} /></GBtn>

                <div className="grimoire-divider" />

                <GBtn onClick={resetCanvas} title="Clear canvas"><Trash2 size={15} /></GBtn>

                <div className="grimoire-ornament">◆</div>
            </aside>

            {/* Cast Button */}
            <button className="cast-btn" onClick={runAnalysis} disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 size={15} className="spin" />
                        Divining
                    </>
                ) : (
                    <>
                        <span className="cast-glyph">✦</span>
                        Cast
                    </>
                )}
            </button>

            {/* Error Toast */}
            {error && (
                <div className="grimoire-error">
                    {error}
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* Result Overlays */}
            {overlays.map((overlay) => (
                <Draggable key={overlay.id} defaultPosition={overlay.position}>
                    <div className="result-scroll-wrapper" style={{ zIndex: 15 }}>
                        <div className="result-scroll">
                            <span className="result-label">RESULT</span>
                            {overlay.latex}
                        </div>
                    </div>
                </Draggable>
            ))}
        </div>
    );
}

function GBtn({ children, active, onClick, title }: {
    children: React.ReactNode;
    active?: boolean;
    onClick: () => void;
    title: string;
}) {
    return (
        <button className={`grimoire-btn${active ? ' active' : ''}`} onClick={onClick} title={title}>
            {children}
        </button>
    );
}
