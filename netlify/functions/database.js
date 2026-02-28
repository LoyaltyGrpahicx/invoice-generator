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
    } else if (path === '/api/user/profile' && httpMethod === 'GET') {
      return await handleGetProfile(context, database);
    }
    
    return { statusCode: 404, body: 'Not found' };
  } catch (error) {
    console.error('Database error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function handleLogin({ email }, database) {
  const users = database.collection('users');
  const user = await users.findOne({ email });
  
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        companyName: user.companyName 
      } 
    })
  };
}

async function handleRegister({ name, companyName, email }, database) {
  const users = database.collection('users');
  
  // Check if user exists
  const existingUser = await users.findOne({ email });
  if (existingUser) {
    return { statusCode: 400, body: JSON.stringify({ error: 'User already exists' }) };
  }
  
  // Create user
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
    createdAt: new Date(),
    updatedAt: new Date()
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

async function handleGetProfile(context, database) {
  const user = context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  
  const users = database.collection('users');
  const userProfile = await users.findOne({ email: user.email });
  
  if (!userProfile) {
    return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      id: userProfile._id,
      email: userProfile.email,
      name: userProfile.name,
      companyName: userProfile.companyName,
      createdAt: userProfile.createdAt
    })
  };
}
