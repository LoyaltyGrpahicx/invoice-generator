const fs = require('fs').promises;
const path = require('path');

// Simple JSON file storage
const DATA_DIR = '/tmp';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');

// Initialize data files
async function initDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify({}));
    }
    
    try {
      await fs.access(INVOICES_FILE);
    } catch {
      await fs.writeFile(INVOICES_FILE, JSON.stringify({}));
    }
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

async function readData(filename) {
  try {
    const data = await fs.readFile(filename, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeData(filename, data) {
  await fs.writeFile(filename, JSON.stringify(data, null, 2));
}

exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;
  
  try {
    await initDataFiles();
    
    // Handle different routes
    if (path === '/api/auth/login' && httpMethod === 'POST') {
      return await handleLogin(JSON.parse(body));
    } else if (path === '/api/auth/register' && httpMethod === 'POST') {
      return await handleRegister(JSON.parse(body));
    } else if (path === '/api/invoices' && httpMethod === 'POST') {
      return await handleSaveInvoice(JSON.parse(body), context);
    } else if (path === '/api/invoices' && httpMethod === 'GET') {
      return await handleGetInvoices(context);
    } else if (path === '/api/user/profile' && httpMethod === 'GET') {
      return await handleGetProfile(context);
    }
    
    return { statusCode: 404, body: 'Not found' };
  } catch (error) {
    console.error('Database error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function handleLogin({ email }) {
  const users = await readData(USERS_FILE);
  const user = users[email];
  
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        companyName: user.companyName 
      } 
    })
  };
}

async function handleRegister({ name, companyName, email }) {
  const users = await readData(USERS_FILE);
  
  // Check if user exists
  if (users[email]) {
    return { statusCode: 400, body: JSON.stringify({ error: 'User already exists' }) };
  }
  
  // Create user
  const newUser = {
    id: Date.now().toString(),
    name,
    companyName,
    email,
    createdAt: new Date().toISOString()
  };
  
  users[email] = newUser;
  await writeData(USERS_FILE, users);
  
  return {
    statusCode: 201,
    body: JSON.stringify({
      user: newUser
    })
  };
}

async function handleSaveInvoice(invoiceData, context) {
  const user = context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  
  const invoices = await readData(INVOICES_FILE);
  const invoiceId = Date.now().toString();
  
  const newInvoice = {
    id: invoiceId,
    ...invoiceData,
    userId: user.sub,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  invoices[invoiceId] = newInvoice;
  await writeData(INVOICES_FILE, invoices);
  
  return {
    statusCode: 201,
    body: JSON.stringify({ invoiceId })
  };
}

async function handleGetInvoices(context) {
  const user = context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  
  const invoices = await readData(INVOICES_FILE);
  const userInvoices = Object.values(invoices).filter(invoice => invoice.userId === user.sub);
  
  return {
    statusCode: 200,
    body: JSON.stringify(userInvoices)
  };
}

async function handleGetProfile(context) {
  const user = context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  
  const users = await readData(USERS_FILE);
  const userProfile = users[user.email];
  
  if (!userProfile) {
    return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      companyName: userProfile.companyName,
      createdAt: userProfile.createdAt
    })
  };
}
