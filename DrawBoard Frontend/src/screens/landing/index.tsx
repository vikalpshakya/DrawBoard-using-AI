import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, PenTool, Brain, Zap } from 'lucide-react';
import './landing.css';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Background decorations */}
            <div className="bg-grid" />
            <div className="floating-symbols">
                <span className="symbol symbol-1">∫</span>
                <span className="symbol symbol-2">π</span>
                <span className="symbol symbol-3">∑</span>
                <span className="symbol symbol-4">√</span>
                <span className="symbol symbol-5">∞</span>
                <span className="symbol symbol-6">Δ</span>
                <span className="symbol symbol-7">θ</span>
                <span className="symbol symbol-8">λ</span>
            </div>

            {/* Main content */}
            <div className="landing-content">
                {/* Badge */}
                <div className="badge">
                    <Sparkles size={14} />
                    <span>Powered by Gemini AI</span>
                </div>

                {/* Headline */}
                <h1 className="headline">
                    <span className="headline-line">Draw it.</span>
                    <span className="headline-line gradient-text">Solve it.</span>
                </h1>

                <p className="subheadline">
                    A smart canvas that understands your math. Draw equations,
                    diagrams, or abstract concepts — and watch AI solve them instantly.
                </p>

                {/* Feature pills */}
                <div className="features">
                    <div className="feature-pill">
                        <PenTool size={16} />
                        <span>Draw freely</span>
                    </div>
                    <div className="feature-pill">
                        <Brain size={16} />
                        <span>AI-powered</span>
                    </div>
                    <div className="feature-pill">
                        <Zap size={16} />
                        <span>Instant results</span>
                    </div>
                </div>

                {/* CTA Button */}
                <button className="cta-button" onClick={() => navigate('/draw')}>
                    <span>Start Drawing</span>
                    <ArrowRight size={20} />
                </button>
            </div>

            {/* Animated Preview */}
            <div className="preview-container">
                <div className="browser-frame">
                    <div className="browser-bar">
                        <div className="traffic-lights">
                            <span className="dot red" />
                            <span className="dot yellow" />
                            <span className="dot green" />
                        </div>
                        <div className="url-bar">drawboard.ai/draw</div>
                    </div>
                    <div className="canvas-preview">
                        {/* Animated toolbar mockup */}
                        <div className="mock-toolbar">
                            <div className="mock-tool active" />
                            <div className="mock-tool" />
                            <div className="mock-divider" />
                            <div className="mock-swatch" style={{ background: '#ffffff' }} />
                            <div className="mock-swatch" style={{ background: '#ee3333' }} />
                            <div className="mock-swatch" style={{ background: '#228be6' }} />
                            <div className="mock-swatch" style={{ background: '#40c057' }} />
                        </div>

                        {/* Animated SVG drawing */}
                        <svg className="drawing-svg" viewBox="0 0 500 250" fill="none">
                            {/* "2+3=" drawn as animated path */}
                            <path
                                className="draw-path path-1"
                                d="M 80 80 C 80 60, 110 55, 110 75 C 110 95, 75 115, 115 120"
                                stroke="#ffffff"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            {/* Plus sign */}
                            <path
                                className="draw-path path-2"
                                d="M 145 85 L 145 110 M 132 97 L 158 97"
                                stroke="#ffffff"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            {/* 3 */}
                            <path
                                className="draw-path path-3"
                                d="M 185 65 C 210 65, 215 85, 195 90 C 215 95, 210 120, 185 120"
                                stroke="#ffffff"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>

                        {/* Result that fades in */}
                        <div className="mock-result">
                            <span className="result-expr">2 + 3</span>
                            <span className="result-eq">=</span>
                            <span className="result-answer">5</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
