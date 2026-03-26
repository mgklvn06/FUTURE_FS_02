import Team from '../models/team.js';

const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LEGACY_TEAM_SLUG = 'northstar-shared-workspace';
const LEGACY_TEAM_NAME = 'Northstar Shared Workspace';

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function createInviteCode(length = 8) {
  return Array.from({ length }, () => {
    const index = Math.floor(Math.random() * INVITE_CODE_ALPHABET.length);
    return INVITE_CODE_ALPHABET[index];
  }).join('');
}

export function normalizeInviteCode(value = '') {
  return value.trim().toUpperCase();
}

export async function createWorkspace(name) {
  const normalizedName = name?.trim();

  if (!normalizedName) {
    throw new Error('Workspace name is required.');
  }

  const baseSlug = slugify(normalizedName) || 'workspace';
  let slug = baseSlug;
  let counter = 1;

  while (await Team.exists({ slug })) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  let inviteCode = createInviteCode();

  while (await Team.exists({ inviteCode })) {
    inviteCode = createInviteCode();
  }

  return Team.create({
    name: normalizedName,
    slug,
    inviteCode,
  });
}

export async function findWorkspaceByInviteCode(inviteCode) {
  const normalizedCode = normalizeInviteCode(inviteCode);

  if (!normalizedCode) {
    return null;
  }

  return Team.findOne({ inviteCode: normalizedCode });
}

export async function ensureLegacyWorkspace() {
  let team = await Team.findOne({ slug: LEGACY_TEAM_SLUG });

  if (team) {
    return team;
  }

  team = await createWorkspace(LEGACY_TEAM_NAME);

  if (team.slug !== LEGACY_TEAM_SLUG) {
    team.slug = LEGACY_TEAM_SLUG;
    await team.save();
  }

  return team;
}
