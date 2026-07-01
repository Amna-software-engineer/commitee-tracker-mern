import { api } from "./client";

// GET /api/members -> [{ name, totalSlots, availableSlots }]
// availableSlots is computed live on the server from current assignments,
// so this replaces the old MEMBER_TOTAL_SLOTS - savedAllocations math.
export const fetchMembers = () => api.get("/members");
