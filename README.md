<div align="center">

# ✦ DrawBoard AI

### An intelligent canvas that reads your handwriting and solves it instantly.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-drawboard--ai.onrender.com-c9a13c?style=for-the-badge&logo=render&logoColor=white)](https://drawboard-using-ai-frontend.onrender.com)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://drawboard-using-ai.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-e0cc8e?style=for-the-badge)](LICENSE)

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)

</div>

---

## 📸 Screenshots

### Landing Page — The Grimoire entrance

<p align="center">
  <img src="docs/screenshots/landing.png" width="700"/>
</p>

### Canvas — Draw equations, watch them solved in real time

<p align="center">
  <img src="docs/screenshots/canvas.png" width="700"/>
</p>

### Analyze — AI analyzed answer appears on the canvas

<p align="center">
  <img src="docs/screenshots/result.png" width="700"/>
</p>

---

## 🧠 What is DrawBoard AI?

DrawBoard AI is a **handwriting aware canvas** powered by Google's Gemini Vision model. Draw anything on the canvas — an arithmetic expression, a system of equations, a Scenery or even an abstract concept and the AI reads it, solves it, and overlays the result directly on your canvas.

No typing. No forms. Just draw.

## ⚙️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Utility styling |
| Mantine UI | Component library |
| HTML5 Canvas API | Drawing engine (quadratic bézier curves) |
| Lucide React | Icons |
| React Draggable | Draggable result overlays |
| React Router v6 | Client-side routing |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | REST API framework |
| Google Gemini 2.5 Flash | Vision + reasoning AI model |
| Pillow (PIL) | Image processing |
| Gunicorn + Uvicorn | Production ASGI server |
| Pydantic v2 | Request/response validation |
| python-dotenv | Environment variable management |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- A **Google Gemini API key** → [Get one free at ai.google.dev](https://ai.google.dev)

---

### 1. Clone the repository

```bash
git clone https://github.com/vikalpshakya/DrawBoard-using-AI.git
cd DrawBoard-using-AI
```

---

### 2. Backend setup

```bash
cd "DrawBoard Backend"

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

Edit `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend:
```bash
python main.py
```

Backend runs at → `http://localhost:8900`

---

### 3. Frontend setup

```bash
cd "DrawBoard Frontend"

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_URL=http://localhost:8900
```

Start the dev server:
```bash
npm run dev
```

Frontend runs at → `http://localhost:5173`

### Architecture

```
GitHub Repo (monorepo)
│
├── DrawBoard Backend/   →   Render Web Service (Python)
│                             gunicorn + uvicorn workers
│
└── DrawBoard Frontend/  →   Render Static Site (Vite build)
                              CDN-served globally
```

## 🎨 Features

- **Smooth drawing** — Quadratic bézier curves for natural pen feel
- **Eraser tool** — Canvas `destination-out` compositing
- **Undo / Redo** — 50-deep snapshot stack (Ctrl+Z / Ctrl+Shift+Z)
- **Color palette** — 10 curated colors (keyboard shortcut: `P` for pen, `E` for eraser)
- **Draggable results** — Drag result cards anywhere on the canvas
- **Drawing persistence** — Canvas stays intact after AI analysis
- **Variable memory** — Assign `x = 5`, then use `x` in later expressions
- **RPG-themed UI** — Cinzel + Crimson Pro typography, amber-gold design system

---

## 🔌 API Reference

### `POST /calculate`

Analyzes a canvas image and returns solved expressions.

**Request body:**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgo...",
  "dict_of_vars": { "x": "5" }
}
```

**Response:**
```json
{
  "message": "Image processed",
  "status": "success",
  "data": [
    { "expr": "2 + 3", "result": "5", "assign": false }
  ]
}
```

### `GET /`

Health check — returns `{"message": "Server is running"}`.

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built by [Vikalp Shakya](https://github.com/vikalpshakya) · Powered by Google Gemini

</div>
