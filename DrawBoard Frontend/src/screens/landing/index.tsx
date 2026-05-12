import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './landing.css';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-root">
            <div className="landing-grain" />

            {/* Floating rune symbols */}
            <div className="runes">
                <span className="rune">∫</span>
                <span className="rune">π</span>
                <span className="rune">∑</span>
                <span className="rune">√</span>
                <span className="rune">∞</span>
                <span className="rune">Δ</span>
                <span className="rune">θ</span>
                <span className="rune">λ</span>
            </div>

            {/* ── Left: Content ── */}
            <div className="landing-content">
                <div className="eyebrow">
                    <span className="eyebrow-dot" />
                    AI POWERED DRAWBOARD
                </div>

                <h1 className="headline">
                    Draw it.
                    <span className="headline-gold">Solve it.</span>
                </h1>

                <p className="subheadline">
                    An intelligent canvas that reads your handwriting.
                    Sketch equations, diagrams, or abstract ideas — and watch
                    the answer emerge.
                </p>

                <div className="features">
                    <div className="feature-item">
                        <span className="feature-rune">✐</span>
                        Draw freely on an infinite canvas
                    </div>
                    <div className="feature-item">
                        <span className="feature-rune">◎</span>
                        AI reads your handwriting instantly
                    </div>
                    <div className="feature-item">
                        <span className="feature-rune">⟡</span>
                        Results appear where you drew
                    </div>
                </div>

                <button className="cta-btn" onClick={() => navigate('/draw')}>
                    START DRAWING
                    <ArrowRight size={16} className="cta-arrow" />
                </button>
            </div>

            {/* ── Right: Tome preview ── */}
            <div className="tome-container">
                <div className="tome-frame">
                    {/* Corner ornaments */}
                    <div className="tome-corner tome-corner--tl" />
                    <div className="tome-corner tome-corner--tr" />
                    <div className="tome-corner tome-corner--bl" />
                    <div className="tome-corner tome-corner--br" />

                    {/* Header */}
                    <div className="tome-header">
                        <span className="tome-title">drawboard · canvas</span>
                        <div className="tome-dots">
                            <div className="tome-dot" />
                            <div className="tome-dot" />
                            <div className="tome-dot" />
                        </div>
                    </div>

                    {/* Canvas area */}
                    <div className="tome-canvas">
                        {/* Mini toolbar */}
                        <div className="mock-tools">
                            <div className="mock-tool-btn active" />
                            <div className="mock-tool-btn" />
                            <div className="mock-tool-divider" />
                            <div className="mock-swatch-sm" style={{ background: '#f0e8d0' }} />
                            <div className="mock-swatch-sm" style={{ background: '#e8c870' }} />
                            <div className="mock-swatch-sm" style={{ background: '#cc3333' }} />
                            <div className="mock-swatch-sm" style={{ background: '#4488ee' }} />
                        </div>

                        {/* Animated inscription */}
                        <svg className="inscription-svg" viewBox="0 0 300 150" fill="none">
                            {/* "2" */}
                            <path
                                className="inscribe-path inscribe-1"
                                d="M 50 55 C 50 38, 78 34, 78 52 C 78 70, 44 88, 86 92"
                                stroke="#e0cc8e"
                                strokeWidth="2.5"
                            />
                            {/* "+" */}
                            <path
                                className="inscribe-path inscribe-2"
                                d="M 116 62 L 116 84 M 105 73 L 127 73"
                                stroke="#e0cc8e"
                                strokeWidth="2.5"
                            />
                            {/* "3" */}
                            <path
                                className="inscribe-path inscribe-3"
                                d="M 148 42 C 172 42, 176 60, 158 66 C 176 72, 172 94, 148 94"
                                stroke="#e0cc8e"
                                strokeWidth="2.5"
                            />
                        </svg>

                        {/* Result card */}
                        <div className="tome-result">
                            <span className="tome-result-label">RESULT</span>
                            <span className="tome-result-value">2 + 3 = 5</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
