const userSchema = `
  CREATE TABLE IF NOT EXISTS users ( 
    userId VARCHAR(255) PRIMARY KEY,
    firstName VARCHAR(255), -- User's first name
    lastName VARCHAR(255), -- User's last name
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    profilePictureUrl TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

module.exports = userSchema;