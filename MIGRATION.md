# Migration to Supabase - Quick Guide

## 🚀 What You Need to Do

### 1. Set Up Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project called "invoice-generator"
3. Follow the setup guide in `supabase-setup.md`

### 2. Get Your Credentials
1. In Supabase, go to **Project Settings** → **API**
2. Copy your **Project URL** and **anon public key**

### 3. Update Your Code
Open `index.html` and replace these lines:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual credentials:
```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 4. Run the Database Setup
1. In Supabase, go to **SQL Editor**
2. Copy and paste the SQL from `supabase-setup.md`
3. Click "Run" to create all tables

### 5. Test the Application
1. Start your frontend server: `node server.js`
2. Open `http://localhost:8080`
3. Try signing up and logging in

## ✨ What You Get with Supabase

### Better Security
- Row Level Security (RLS) - Users can only see their own data
- Built-in authentication with email verification
- Secure session management

### Professional Database
- PostgreSQL (better than SQLite)
- Automatic backups
- Real-time subscriptions
- RESTful API

### Scalability
- Handles thousands of users
- Global CDN
- Edge functions when needed

### Developer Experience
- No backend server needed
- Built-in user management dashboard
- Real-time data updates
- Easy to scale

## 🔄 What Changed

### Before (Custom Backend)
- Custom Node.js server
- SQLite database
- Manual JWT handling
- Local development only

### After (Supabase)
- No backend server needed
- PostgreSQL database
- Built-in auth & security
- Production-ready

## 🛠️ Development Workflow

### Old Way
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend  
node server.js
```

### New Way
```bash
# Just run the frontend
node server.js
```

## 📊 Data Migration

If you have existing data in SQLite, you can export it and import to Supabase:

1. Export your SQLite data
2. Convert to CSV format
3. Use Supabase's CSV import feature
4. Or use the Supabase CLI for migration

## 🔧 Configuration Options

### Email Confirmation
You can disable email confirmation in Supabase settings:
1. Go to **Authentication** → **Settings**
2. Toggle "Enable email confirmations"

### Custom SMTP
Set up custom email for professional look:
1. Go to **Authentication** → **Email Templates**
2. Configure your SMTP settings

## 🚀 Production Deployment

### Netlify (Recommended)
1. Push your code to GitHub
2. Connect to Netlify
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Other Platforms
Any static hosting platform works since you don't need a backend server!

## 🎯 Next Steps

1. ✅ Set up Supabase project
2. ✅ Update credentials in code
3. ✅ Run database setup
4. ✅ Test authentication
5. 🔄 Add real-time features
6. 🔄 Add file uploads for logos
7. 🔄 Add email notifications

## 🆘 Troubleshooting

### Common Issues

**"Invalid JWT" Error**
- Check your Supabase URL and keys
- Make sure keys are correct and not expired

**"No rows returned" Error**
- Run the SQL setup script
- Check that RLS policies are correct

**CORS Issues**
- Add your frontend URL to Supabase CORS settings
- Usually `http://localhost:8080` for development

### Get Help
- Check Supabase documentation
- Review the SQL setup script
- Make sure all tables were created successfully

---

**You're now ready to use a professional, scalable backend! 🎉**
