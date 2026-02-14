# Social Wishlist - Full-Stack Web Application

A modern, real-time social wishlist application where users can create wishlists, share them with friends and family, and enable group contributions or individual reservations for gifts.

## 🚀 Features

- **User Authentication**: Email/password registration and login with JWT tokens
- **Wishlist Management**: Create, edit, and delete wishlists
- **Item Management**: Add items with auto-fill from product URLs
- **Group Gifts**: Enable multiple people to contribute to expensive items
- **Individual Reservations**: Reserve items for single-payer gifts
- **Real-time Updates**: WebSocket-based live updates for all visitors
- **Public Sharing**: Share wishlists via unique links without requiring login
- **Modern UI**: Responsive design with Tailwind CSS, no default browser styles
- **Auto-fill**: Automatically extract product title, image, and price from URLs

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router v6** for routing
- **Axios** for HTTP requests
- **Zustand** for state management
- **WebSocket** (native browser API) for real-time updates

### Backend
- **FastAPI** (Python 3.11+)
- **SQLAlchemy 2.0** (async) with PostgreSQL
- **Alembic** for database migrations
- **Pydantic v2** for data validation
- **JWT** authentication (python-jose)
- **bcrypt** for password hashing
- **WebSockets** for real-time communication
- **HTTPX + BeautifulSoup4** for URL auto-fill

## 📁 Project Structure

```
wishlist-app/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API and WebSocket services
│   │   ├── store/        # Zustand state management
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Helper functions
│   └── package.json
│
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Configuration and security
│   │   ├── db/          # Database models and session
│   │   └── schemas/     # Pydantic schemas
│   └── requirements.txt
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** 14+ (or use Supabase/other managed PostgreSQL)
- **Git**

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/wishlist_db
   SECRET_KEY=your-secret-key-here-change-in-production
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

5. **Create database:**
   ```bash
   createdb wishlist_db  # or use your PostgreSQL client
   ```

6. **Run migrations:**
   ```bash
   alembic upgrade head
   ```
   
   Or if tables don't exist, the app will create them on startup.

7. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`
   API docs at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_WS_URL=ws://localhost:8000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 🚢 Deployment

### Frontend (Vercel)

1. **Push code to GitHub**
2. **Import project in Vercel**
3. **Set environment variables:**
   - `VITE_API_URL`: Your backend API URL
   - `VITE_WS_URL`: Your WebSocket URL (ws:// or wss://)
4. **Deploy**

   Build command: `npm run build`
   Output directory: `dist`

### Backend (Render/Railway)

1. **Create a new service** (Web Service on Render, or New Project on Railway)
2. **Connect your GitHub repository**
3. **Set environment variables:**
   ```env
   DATABASE_URL=postgresql+asyncpg://...
   SECRET_KEY=your-secret-key
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
4. **Set build command:**
   ```bash
   pip install -r requirements.txt
   ```
5. **Set start command:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### Database (Supabase/Managed PostgreSQL)

1. **Create a PostgreSQL database** on Supabase or your preferred provider
2. **Get the connection string** (format: `postgresql+asyncpg://user:pass@host:port/dbname`)
3. **Set `DATABASE_URL`** in your backend environment variables
4. **Run migrations** on first deploy (or let the app create tables on startup)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (requires auth)

### Wishlists
- `GET /api/wishlists` - Get user's wishlists (requires auth)
- `POST /api/wishlists` - Create wishlist (requires auth)
- `GET /api/wishlists/{slug}` - Get wishlist by slug (public)
- `PUT /api/wishlists/{slug}` - Update wishlist (owner only)
- `DELETE /api/wishlists/{slug}` - Delete wishlist (owner only)

### Items
- `GET /api/wishlists/{slug}/items` - Get items for wishlist
- `POST /api/wishlists/{slug}/items` - Add item (owner only)
- `PUT /api/items/{item_id}` - Update item (owner only)
- `DELETE /api/items/{item_id}` - Delete item (owner only)

### Reservations
- `POST /api/items/{item_id}/reserve` - Reserve an item (public)

### Contributions
- `POST /api/items/{item_id}/contribute` - Contribute to group gift (public)
- `GET /api/items/{item_id}/contributions` - Get contributions list (public)

### Auto-fill
- `POST /api/autofill` - Extract product info from URL

### WebSocket
- `ws://backend/ws/{slug}` - Real-time updates for wishlist

## 🎯 Key Features Explained

### Owner View vs Public View

**Owner View** (`/wishlist/{slug}`):
- Can add, edit, delete items
- Sees only status (Reserved/Collecting/Collected)
- **Never sees names or amounts** (privacy-first)

**Public View** (`/w/{slug}`):
- Can reserve items or contribute to group gifts
- Sees contributor names and amounts
- Real-time updates via WebSocket

### Group Gifts vs Individual Gifts

**Individual Gifts** (`is_group_gift = false`):
- One person can reserve the entire item
- Button shows "Reserve" or "Reserved by [name]"

**Group Gifts** (`is_group_gift = true`):
- Multiple people can contribute any amount
- Progress bar shows collected/total
- List of contributors with names and amounts
- Button disabled when fully funded

### Auto-fill Feature

When adding an item, paste a product URL and click "Auto-fill":
- Extracts title from Open Graph or `<title>` tag
- Extracts image from Open Graph image
- Attempts to find price from various meta tags or JSON-LD
- Falls back gracefully if price not found

### Real-time Updates

- WebSocket connection per wishlist slug
- Server broadcasts updates when:
  - Items are added/edited/deleted
  - Reservations are made
  - Contributions are added
- All connected clients receive updates instantly

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Row-level locking for concurrent reservations/contributions
- CORS protection
- Input validation with Pydantic
- SQL injection protection via SQLAlchemy ORM

## 🐛 Known Issues / Future Improvements

- Google OAuth is stubbed but not fully implemented
- Price extraction from URLs may not work for all sites
- WebSocket reconnection could be improved with exponential backoff (partially implemented)
- No email notifications (future feature)
- No wishlist templates (future feature)

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using React, FastAPI, and PostgreSQL**

