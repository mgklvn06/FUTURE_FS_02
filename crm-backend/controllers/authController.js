import User from '../models/user.js';
import { generateToken } from '../utils/token.js';
import { createWorkspace, findWorkspaceByInviteCode, normalizeInviteCode } from '../utils/team.js';

const formatTeam = (team, role, memberCount) => {
  if (!team) {
    return null;
  }

  return {
    _id: team._id,
    name: team.name,
    slug: team.slug,
    memberCount,
    inviteCode: role === 'admin' ? team.inviteCode : undefined,
  };
};

const formatUser = (user, team) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  team,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

async function buildUserPayload(user) {
  const hydratedUser =
    user?.team && typeof user.team === 'object' && 'name' in user.team ? user : await user.populate('team');
  const memberCount = hydratedUser.team
    ? await User.countDocuments({ team: hydratedUser.team._id })
    : 0;

  return formatUser(hydratedUser, formatTeam(hydratedUser.team, hydratedUser.role, memberCount));
}

async function getAuthResponse(user) {
  return {
    token: generateToken(user._id),
    user: await buildUserPayload(user),
  };
}

export async function registerUser(req, res) {
  try {
    const name = req.body?.name?.trim?.();
    const email = req.body?.email?.trim?.().toLowerCase();
    const password = req.body?.password ?? '';
    const teamName = req.body?.teamName?.trim?.();
    const inviteCode = normalizeInviteCode(req.body?.inviteCode);

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters.',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with that email already exists.',
      });
    }

    let team;
    let role = 'user';

    if (inviteCode) {
      team = await findWorkspaceByInviteCode(inviteCode);

      if (!team) {
        return res.status(404).json({
          message: 'Invite code not found. Check the code and try again.',
        });
      }
    } else if (teamName) {
      team = await createWorkspace(teamName);
      role = 'admin';
    } else {
      return res.status(400).json({
        message: 'Provide a workspace name to create one or an invite code to join an existing team.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      team: team._id,
    });

    res.status(201).json(await getAuthResponse(user));
  } catch (error) {
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
}

export async function loginUser(req, res) {
  try {
    const email = req.body?.email?.trim?.().toLowerCase();
    const password = req.body?.password ?? '';

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    res.json(await getAuthResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getCurrentUser(req, res) {
  res.json({
    user: await buildUserPayload(req.user),
  });
}
