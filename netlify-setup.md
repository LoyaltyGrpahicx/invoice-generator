# Netlify Setup Guide

## 1. Deploy to Netlify

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/invoice-generator.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login
   - Click "New site from Git"
   - Connect your GitHub repository
   - Build settings:
     - Build command: `echo "No build needed"`
     - Publish directory: `.`
   - Click "Deploy site"

## 2. Enable Netlify Identity

1. **In your Netlify dashboard:**
   - Go to **Site settings** → **Identity**
   - Click **Enable Identity**
   - Registration preferences: **Open** or **Invite only**
   - Save changes

2. **Configure Identity:**
   - Go to **Identity** → **Settings**
   - Registration: **Enabled**
   - Email confirmation: **Disabled** (for easier testing)
   - Save settings

3. **Add providers:**
   - Go to **Identity** → **Providers**
   - Enable **Email/Password**
   - Optionally enable Google, GitHub, etc.

## 3. Set Up Netlify Functions

1. **Create netlify.toml file:**
   ```toml
   [build]
     publish = "."
     functions = "netlify/functions"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

2. **Create functions directory:**
   ```bash
   mkdir -p netlify/functions
   ```

## 4. Create Database Function

Create `netlify/functions/database.js`:

```javascript
const { MongoClient } = require('mongodb');

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db('invoice-generator');
  }
  return db;
}

exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;
  
  try {
    await connectToDatabase();
    const database = db;
    
    // Handle different routes
    if (path === '/api/auth/login' && httpMethod === 'POST') {
      return await handleLogin(JSON.parse(body), database);
    } else if (path === '/api/auth/register' && httpMethod === 'POST') {
      return await handleRegister(JSON.parse(body), database);
    } else if (path === '/api/invoices' && httpMethod === 'POST') {
      return await handleSaveInvoice(JSON.parse(body), context, database);
    } else if (path === '/api/invoices' && httpMethod === 'GET') {
      return await handleGetInvoices(context, database);
    }
    
    return { statusCode: 404, body: 'Not found' };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function handleLogin({ email, password }, database) {
  // Netlify Identity handles login, this just returns user info
  const users = database.collection('users');
  const user = await users.findOne({ email });
  
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ user: { id: user._id, email: user.email, name: user.name } })
  };
}

async function handleRegister({ name, companyName, email, password }, database) {
  const users = database.collection('users');
  
  // Check if user exists
  const existingUser = await users.findOne({ email });
  if (existingUser) {
    return { statusCode: 400, body: JSON.stringify({ error: 'User already exists' }) };
  }
  
  // Create user (password is handled by Netlify Identity)
  const result = await users.insertOne({
    name,
    companyName,
    email,
    createdAt: new Date()
  });
  
  return {
    statusCode: 201,
    body: JSON.stringify({
      user: { id: result.insertedId, email, name, companyName }
    })
  };
}

async function handleSaveInvoice(invoiceData, context, database) {
  const user = context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  
  const invoices = database.collection('invoices');
  const result = await invoices.insertOne({
    ...invoiceData,
    userId: user.sub,
    createdAt: new Date()
  });
  
  return {
    statusCode: 201,
    body: JSON.stringify({ invoiceId: result.insertedId })
  };
}

async function handleGetInvoices(context, database) {
  const user = context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  
  const invoices = database.collection('invoices');
  const userInvoices = await invoices.find({ userId: user.sub }).toArray();
  
  return {
    statusCode: 200,
    body: JSON.stringify(userInvoices)
  };
}
```

## 5. Set Up MongoDB Atlas (Free)

1. **Go to [MongoDB Atlas](https://mongodb.com/atlas)**
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user
5. Get your connection string

## 6. Add Environment Variables

In Netlify dashboard:
- Go to **Site settings** → **Environment variables**
- Add:
  - `MONGODB_URI`: Your MongoDB connection string
  - `JWT_SECRET`: A random secret key

## 7. Update Frontend for Netlify Identity

Replace your authentication code with Netlify Identity:

```html
<!-- Add this to your HTML head -->
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
```

```javascript
// Initialize Netlify Identity
const netlifyIdentity = new netlifyIdentityWidget({
  url: 'https://your-site-name.netlify.app'
});

// Authentication functions
async function login(email, password) {
  return await netlifyIdentity.login(email, password);
}

async function signup(name, companyName, email, password) {
  // First signup with Netlify Identity
  const user = await netlifyIdentity.signup(email, password);
  
  // Then save additional profile data
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, companyName, email, password })
  });
  
  return response.json();
}

async function logout() {
  netlifyIdentity.logout();
}

// Listen for auth changes
netlifyIdentity.on('login', (user) => {
  currentUser = user;
  showMainApp();
  initializeApp();
});

netlifyIdentity.on('logout', () => {
  currentUser = null;
  showAuthContainer();
});
```

## 8. Deploy Functions

1. **Install dependencies:**
   ```bash
   npm init -y
   npm install mongodb
   ```

2. **Deploy:**
   ```bash
   git add .
   git commit -m "Add Netlify functions"
   git push
   ```

## 9. Test Your Application

1. Visit your Netlify site
2. Test signup and login
3. Create invoices
4. Verify data is saved to MongoDB

## Benefits of Netlify

✅ **Easy Deployment**: Git-based deployment  
✅ **Built-in Auth**: No separate auth service needed  
✅ **Serverless Functions**: Pay only for what you use  
✅ **Free Tier**: Generous free plan  
✅ **CDN**: Global content delivery  
✅ **Forms**: Built-in form handling  
✅ **HTTPS**: Automatic SSL certificates  

## Troubleshooting

**Functions not working:**
- Check netlify.toml configuration
- Verify function files are in correct directory
- Check Netlify function logs

**Auth not working:**
- Ensure Identity is enabled in site settings
- Check redirect URLs are correct
- Verify email confirmation settings

**Database connection issues:**
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure environment variables are set
