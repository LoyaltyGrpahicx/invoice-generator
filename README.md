# Invoice Generator - Full Stack Application

A professional invoice management system with user authentication, built with Express.js backend and vanilla JavaScript frontend.

## Features

### Authentication
- User registration and login
- JWT token-based authentication
- Secure password hashing with bcrypt
- Persistent login sessions

### Invoice Management
- Create and manage professional invoices
- Live preview with real-time updates
- Multi-currency support (40+ currencies)
- Automatic country-based currency detection
- Tax and delivery/shipping fee options
- Company logo management
- Mobile-responsive design

### User Experience
- Collapsible sidebar for mobile
- Dark/light mode ready
- Professional UI with Tailwind CSS
- Real-time form validation
- Smooth animations and transitions

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **Vanilla JavaScript** - No frameworks required
- **Tailwind CSS** - Styling
- **Font Awesome** - Icons
- **HTML5** - Markup

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Backend will be running on:** `http://localhost:3001`

### Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Start the frontend server:**
   ```bash
   node server.js
   ```

3. **Frontend will be running on:** `http://localhost:8080`

### Complete Setup

1. **Start Backend (Terminal 1):**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start Frontend (Terminal 2):**
   ```bash
   cd ..
   node server.js
   ```

3. **Open your browser and navigate to:** `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/user/profile` - Get user profile (protected)

### Invoices
- `POST /api/invoices` - Save invoice (protected)
- `GET /api/invoices` - Get user's invoices (protected)

### Database Schema

#### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password
- `name` - User's full name
- `company_name` - Optional company name
- `created_at` - Registration timestamp

#### Invoices Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `invoice_number` - Invoice number
- `client_name` - Client's name
- `client_email` - Client's email
- `client_address` - Client's address
- `items` - Invoice items (JSON)
- `subtotal` - Subtotal amount
- `tax_rate` - Tax rate percentage
- `tax_amount` - Tax amount
- `delivery_fee` - Delivery/shipping fee
- `total_amount` - Total amount
- `currency` - Currency code
- `notes` - Additional notes
- `status` - Invoice status (draft, sent, paid)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Usage

1. **Register Account:** Click "Sign Up" to create a new account
2. **Login:** Use your credentials to log in
3. **Create Invoices:** Navigate to Dashboard to create invoices
4. **Manage Settings:** Configure company info, currency, and preferences
5. **View Invoices:** Check the Invoices page to see all your invoices

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Input validation
- SQL injection prevention with parameterized queries

## Development

### Environment Variables
Create a `.env` file in the backend directory:
```
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3001
```

### Database
The application uses SQLite for simplicity. The database file (`invoices.db`) will be created automatically on first run.

## Deployment

For production deployment:

1. **Set environment variables:**
   - `JWT_SECRET` - Use a strong, random secret
   - `PORT` - Set your preferred port

2. **Use a process manager:**
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name "invoice-backend"
   ```

3. **Configure reverse proxy** (nginx/Apache) for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.
