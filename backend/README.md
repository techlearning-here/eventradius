# FastAPI Backend for Event Management Platform

This is a FastAPI-based backend that serves as the API layer between the React frontend and Supabase database. It provides RESTful endpoints for event management, user authentication, and data operations.

## 🚀 Features

- **FastAPI Framework**: Modern Python web framework with automatic OpenAPI documentation
- **Supabase Integration**: PostgreSQL database with real-time capabilities
- **JWT Authentication**: Secure token-based authentication with optional auth support
- **CORS Configuration**: Cross-origin resource sharing for frontend-backend communication
- **Comprehensive API**: Full CRUD operations for events, users, and participation
- **Error Handling**: Proper HTTP status codes and error responses
- **Logging**: Structured logging for debugging and monitoring

## 📁 Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables (not in version control)
├── .env.example           # Example environment configuration
├── api/
│   ├── events.py          # Event-related endpoints
│   └── users.py           # User profile endpoints
├── config/
│   ├── auth.py            # Authentication utilities
│   └── database.py        # Supabase database client
├── models/                # Pydantic models (future)
└── utils/                 # Utility functions (future)
```

## 🔧 Setup Instructions

### 1. Prerequisites
- Python 3.12
- pip package manager
- Supabase account with database

### 2. Create Virtual Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env` and update with your Supabase credentials:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Backend Server Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
BACKEND_CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# JWT Settings
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 5. Run the Development Server
```bash
python -m uvicorn main:app --reload --port 8000
```

The server will start at `http://localhost:8000`

## 📚 API Documentation

Once the server is running, you can access:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/health`

## 🔌 API Endpoints

### Events
- `GET /api/events/` - List events with pagination and filtering
- `GET /api/events/{event_id}` - Get specific event details
- `POST /api/events/` - Create a new event (requires authentication)
- `PUT /api/events/{event_id}` - Update an event (requires authentication)
- `DELETE /api/events/{event_id}` - Delete an event (requires authentication)
- `POST /api/events/{event_id}/participate` - Participate in an event
- `DELETE /api/events/{event_id}/participate` - Leave an event

### Users
- `GET /api/users/me` - Get current user profile (requires authentication)
- `PUT /api/users/me` - Update user profile (requires authentication)
- `GET /api/users/me/events` - Get events created by current user

### Health
- `GET /health` - Health check endpoint

## 🔐 Authentication

The backend uses JWT tokens from Supabase for authentication. To authenticate requests:

1. Get a JWT token from Supabase Auth (frontend handles this)
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### Authentication Dependencies
- `Depends(require_auth)` - Requires valid authentication
- `Depends(optional_auth)` - Optional authentication (returns user if authenticated, None otherwise)
- `Depends(require_admin)` - Requires admin privileges

## 🗄️ Database Schema

The backend expects the following tables in Supabase:

### events table
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    category TEXT,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    organizer_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### event_participants table
```sql
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);
```

## 🧪 Testing

Run the health check to verify the backend is working:
```bash
curl http://localhost:8000/health
```

Test the events endpoint:
```bash
curl http://localhost:8000/api/events/
```

## 🚀 Deployment

### Production Considerations
1. Update `.env` with production values
2. Set `JWT_SECRET_KEY` to a strong, random value
3. Configure proper CORS origins for your frontend domain
4. Use a production ASGI server like Gunicorn with Uvicorn workers
5. Set up proper logging and monitoring

### Example Production Command
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

## 📝 Notes

- The backend is standardized on Python 3.12 for local development and CI compatibility.
- The `is_public` column referenced in the code doesn't exist in the current database schema. You can either add it or modify the code to remove the filter.
- Email validation requires the `email-validator` package which is included in requirements.txt.

## 🔗 Frontend Integration

The frontend should use the backend API client located at `frontend/src/integrations/backend/client.ts`. Update the `VITE_BACKEND_URL` environment variable in the frontend `.env` file to point to your backend server.

## 📄 License

This project is part of the Event Management Platform.