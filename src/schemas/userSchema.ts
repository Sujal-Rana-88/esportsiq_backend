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
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    rating FLOAT DEFAULT 0,
    ratingCount INT DEFAULT 0,
    isVerified BOOLEAN DEFAULT FALSE,
    provider VARCHAR(50) NOT NULL DEFAULT 'local',
    providerId VARCHAR(255) NOT NULL DEFAULT '',
    accessToken TEXT,
    refreshToken TEXT,
    verifyToken VARCHAR(6) NULL, -- Stores OTP for email verification
    verifyTokenExpiry TIMESTAMP NULL, -- Expiration time of OTP
    passwordResetToken VARCHAR(255) NULL, -- Stores token for password reset
    passwordResetExpiry TIMESTAMP NULL -- Expiration time for password reset token
  );
`;

module.exports = userSchema;
