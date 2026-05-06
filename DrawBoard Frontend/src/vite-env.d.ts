/// <reference types="vite/client" />

interface Window {
    MathJax: {
        Hub: {
            Config: (config: object) => void;
            Queue: (args: unknown[]) => void;
        };
    };
}
