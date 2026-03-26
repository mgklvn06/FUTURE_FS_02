import Lead from '../models/lead.js';
import User from '../models/user.js';
import { ensureLegacyWorkspace } from './team.js';

const unassignedWorkspaceFilter = {
  $or: [{ team: { $exists: false } }, { team: null }],
};

export async function backfillLegacyWorkspace() {
  const [orphanedUsers, orphanedLeads] = await Promise.all([
    User.countDocuments(unassignedWorkspaceFilter),
    Lead.countDocuments(unassignedWorkspaceFilter),
  ]);

  if (!orphanedUsers && !orphanedLeads) {
    return;
  }

  const legacyWorkspace = await ensureLegacyWorkspace();

  await Promise.all([
    orphanedUsers
      ? User.updateMany(unassignedWorkspaceFilter, { $set: { team: legacyWorkspace._id } })
      : Promise.resolve(),
    orphanedLeads
      ? Lead.updateMany(unassignedWorkspaceFilter, { $set: { team: legacyWorkspace._id } })
      : Promise.resolve(),
  ]);
}
