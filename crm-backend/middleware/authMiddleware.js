import jwt from 'jsonwebtoken';

import User from '../models/user.js';
import { getJwtSecret } from '../utils/token.js';

export default async function protect(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';

    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Not authorized. Missing bearer token.',
      });
    }

    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).populate('team');

    if (!user) {
      return res.status(401).json({
        message: 'Not authorized. User no longer exists.',
      });
    }

    if (!user.team) {
      return res.status(403).json({
        message: 'This account is not assigned to a workspace yet.',
      });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({
      message: 'Not authorized. Token is invalid or expired.',
    });
  }
}
