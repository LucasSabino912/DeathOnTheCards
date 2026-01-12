# Death On The Cards

Multiplayer card game with a web frontend and a backend powered by a REST API and WebSockets.

The project is composed of:
- **Frontend**: user interface
- **Backend**: game logic, API, and real-time communication
- **Database**: MySQL

---

## 🕹️ How to Play (Development Mode)

> Both **backend and frontend** must be running.

### General Requirements
- Node.js 16+
- Python 3.12+
- MySQL 8+

---

## 🚀 Running the Project

### 1️⃣ Backend

#### Database Setup

Start MySQL as root:
```bash
mysql -u root -p
````

Create database and user:

```sql
CREATE DATABASE cards_table_develop;

CREATE USER 'developer'@'localhost' IDENTIFIED BY 'developer_pass';

GRANT ALL PRIVILEGES ON cards_table_develop.* TO 'developer'@'localhost';

FLUSH PRIVILEGES;
```

Test the connection:

```bash
mysql -u developer -p cards_table_develop
```

---

#### Backend Setup

Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the backend root directory:

```env
DATABASE_URL="mysql+pymysql://developer:developer_pass@localhost/cards_table_develop"
SECRET_KEY="developer_pass"
```

Create tables and load initial data:

```bash
mysql -u developer -p -e "DROP DATABASE IF EXISTS cards_table_develop; CREATE DATABASE cards_table_develop;"
python create_db.py
mysql -u developer -p cards_table_develop < scripts/carga-datos.sql
```

Start the backend development server:

```bash
./scripts/start_dev.sh
```

---

### 2️⃣ Frontend

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
```

---

## 🧪 Testing (Optional)

### Backend

```bash
pytest
```

With coverage:

```bash
pytest --cov=app --cov-report=term-missing
```

### Frontend

```bash
npm run test:run
```

---

## 📚 API Documentation

Detailed documentation for the REST and WebSocket API is available at:

📄 [`documentacion-API.md`](documentacion-API.md)

Includes:

* REST endpoints
* WebSocket events
* Data models and schemas
* Usage examples

---

## 🛠️ Tech Stack

**Frontend**

* JavaScript / TypeScript
* Modern build tooling (Vite)
* Testing and linting

**Backend**

* Python
* REST API
* WebSockets
* MySQL
