/* eslint-disable no-undef */
import jwt from 'jsonwebtoken';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('Missing JWT_SECRET in crm-backend/.env');
  }

  return secret;
}

export function generateToken(userId) {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: '7d',
  });
}
