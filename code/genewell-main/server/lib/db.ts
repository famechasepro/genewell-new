import { Pool, QueryResult } from 'pg';

// Initialize connection pool - will use DATABASE_URL env variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create tables
    await client.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        phone VARCHAR(20),
        age INT,
        gender VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Quiz responses table
      CREATE TABLE IF NOT EXISTS quiz_responses (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        analysis_id VARCHAR(255) NOT NULL UNIQUE,
        quiz_data JSONB NOT NULL,
        personalization_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Purchases table
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        analysis_id VARCHAR(255) NOT NULL,
        plan_id VARCHAR(255) NOT NULL,
        add_ons TEXT[] DEFAULT ARRAY[]::TEXT[],
        total_price DECIMAL(10, 2) NOT NULL,
        payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        instamojo_payment_id VARCHAR(255),
        instamojo_transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (analysis_id) REFERENCES quiz_responses(analysis_id)
      );

      -- Email logs table
      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        purchase_id INT REFERENCES purchases(id) ON DELETE SET NULL,
        email_type VARCHAR(50) NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        sent_at TIMESTAMP,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Admin users table
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_quiz_responses_user_id ON quiz_responses(user_id);
      CREATE INDEX IF NOT EXISTS idx_quiz_responses_analysis_id ON quiz_responses(analysis_id);
      CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
      CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(payment_status);
      CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    console.log('Database schema initialized successfully');
  } catch (err) {
    console.error('Error initializing database schema:', err);
    throw err;
  } finally {
    client.release();
  }
}

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

export async function getUser(email: string) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function createUser(email: string, name?: string, phone?: string, age?: number, gender?: string) {
  const result = await query(
    'INSERT INTO users (email, name, phone, age, gender) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [email, name, phone, age, gender]
  );
  return result.rows[0];
}

export async function updateUser(userId: number, data: any) {
  const { name, phone, age, gender } = data;
  const result = await query(
    'UPDATE users SET name = COALESCE($2, name), phone = COALESCE($3, phone), age = COALESCE($4, age), gender = COALESCE($5, gender), updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
    [userId, name, phone, age, gender]
  );
  return result.rows[0];
}

export async function saveQuizResponse(userId: number, analysisId: string, quizData: any, personalizationData: any) {
  const result = await query(
    'INSERT INTO quiz_responses (user_id, analysis_id, quiz_data, personalization_data) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, analysisId, JSON.stringify(quizData), JSON.stringify(personalizationData)]
  );
  return result.rows[0];
}

export async function getPurchases(userId: number) {
  const result = await query(
    'SELECT * FROM purchases WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function createPurchase(userId: number, analysisId: string, planId: string, addOns: string[], totalPrice: number) {
  const result = await query(
    'INSERT INTO purchases (user_id, analysis_id, plan_id, add_ons, total_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, analysisId, planId, addOns, totalPrice]
  );
  return result.rows[0];
}

export async function updatePurchasePaymentStatus(purchaseId: number, status: string, instamojoPaymentId?: string, instamojoTransactionId?: string) {
  const result = await query(
    'UPDATE purchases SET payment_status = $2, instamojo_payment_id = COALESCE($3, instamojo_payment_id), instamojo_transaction_id = COALESCE($4, instamojo_transaction_id), completed_at = CASE WHEN $2 = \'completed\' THEN CURRENT_TIMESTAMP ELSE completed_at END WHERE id = $1 RETURNING *',
    [purchaseId, status, instamojoPaymentId, instamojoTransactionId]
  );
  return result.rows[0];
}

export async function logEmail(userId: number, purchaseId: number | null, emailType: string, recipientEmail: string, subject: string) {
  const result = await query(
    'INSERT INTO email_logs (user_id, purchase_id, email_type, recipient_email, subject) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, purchaseId, emailType, recipientEmail, subject]
  );
  return result.rows[0];
}

export async function updateEmailLogStatus(emailLogId: number, status: string, errorMessage?: string) {
  const result = await query(
    'UPDATE email_logs SET status = $2, error_message = $3, sent_at = CASE WHEN $2 = \'sent\' THEN CURRENT_TIMESTAMP ELSE sent_at END WHERE id = $1 RETURNING *',
    [emailLogId, status, errorMessage]
  );
  return result.rows[0];
}

export async function getAllUsers(limit: number = 100, offset: number = 0) {
  const result = await query(
    'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return result.rows;
}

export async function getUserWithPurchases(userId: number) {
  const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
  const purchasesResult = await query('SELECT * FROM purchases WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  const quizResult = await query('SELECT * FROM quiz_responses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
  
  return {
    user: userResult.rows[0],
    purchases: purchasesResult.rows,
    latestQuiz: quizResult.rows[0],
  };
}

export async function closePool() {
  await pool.end();
}
