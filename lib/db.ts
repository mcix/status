import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);

// Database schema initialization
export async function initializeDatabase() {
  try {
    // Create services table
    await sql`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create status_checks table
    await sql`
      CREATE TABLE IF NOT EXISTS status_checks (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        response_time INTEGER,
        checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        error_message TEXT
      )
    `;

    // Create incidents table
    await sql`
      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      )
    `;

    // Create incident_updates table
    await sql`
      CREATE TABLE IF NOT EXISTS incident_updates (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Seed initial services
export async function seedServices() {
  try {
    const existingServices = await sql`SELECT * FROM services`;
    
    if (existingServices.length === 0) {
      await sql`
        INSERT INTO services (name, url, type)
        VALUES 
          ('Frontend', 'https://deltaproto.com', 'frontend'),
          ('Backend API', 'https://deltaproto.com/api/test', 'backend')
      `;
      console.log('Services seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding services:', error);
    throw error;
  }
}

