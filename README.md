# 💰 OpenBudget

OpenBudget is a free, open-source budgeting app inspired by YNAB — designed to be fast, clean, and transparent.  
It’s your personal finance command center, without the subscription.

---

## 🚀 Features (WIP)

- 💸 Budget creation with multiple budget support
- 🧩 Custom categories and category groups
- 🏦 On-budget & off-budget accounts (checking, savings, credit, 401k, etc.)
- 🧾 Transaction entry, activity tracking, and available balance logic
- 📊 Dashboard overview with budget progress and recent activity
- 🧠 Built with a future-facing goal of AI-powered budgeting advice

---

## 🛠️ Tech Stack

| Layer     | Stack                         |
|-----------|-------------------------------|
| Frontend  | React + TypeScript + Vite     |
| Styling   | Tailwind CSS                  |
| Backend   | FastAPI (Python)              |
| Package   | pnpm                          |
| Dev Env   | Docker + Docker Compose       |

---

## 📦 Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/esalce/openbudget.git
cd openbudget
2. Run it with Docker
bash
Copy
Edit
docker compose up --build
Frontend → http://localhost:5173

Backend API → http://localhost:8000

🧪 First-time build may take a few minutes

📁 Project Structure
bash
Copy
Edit
openbudget/
├── backend/             # FastAPI app (Python)
├── frontend/            # Vite + React + Tailwind UI
├── docker-compose.yml   # Unified container setup
└── README.md
