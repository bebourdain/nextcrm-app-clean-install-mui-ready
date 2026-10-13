"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prismadb } from "@/lib/prisma";
import { rankBetween, BOARD_ORDER_GAP } from "@/lib/crm/board-order";
import { requireAuthenticated, assertCanWriteOpportunity, AuthenticationError, AuthorizationError } from "@/lib/authz";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function saveOpportunityBoardOrder(data: {
  opportunityId: string;
  stageId: string;
  beforeId: string | null;
  afterId: string | null;
}) {
  const { opportunityId, stageId, beforeId, afterId } = data;
  if (typeof opportunityId !== "string" || typeof stageId !== "string" ||
      ![opportunityId, stageId, beforeId, afterId].every((value) => value === null || uuid.test(value)) ||
      beforeId === opportunityId || afterId === opportunityId || (beforeId && beforeId === afterId)) {
    return { error: "Invalid board position" };
  }
  let user;
  try {
    user = await requireAuthenticated();
    await assertCanWriteOpportunity(user, opportunityId);
  } catch (error) {
    if (error instanceof AuthenticationError) return { error: "Unauthorized" };
    if (error instanceof AuthorizationError) return { error: "Forbidden" };
    throw error;
  }

  try {
    await prismadb.$transaction(async (tx) => {
      const [moving, stage, neighbors] = await Promise.all([
        tx.crm_Opportunities.findFirst({ where: { id: opportunityId, sales_stage: stageId, status: "ACTIVE", deletedAt: null }, select: { id: true } }),
        tx.crm_Opportunities_Sales_Stages.findUnique({ where: { id: stageId }, select: { id: true } }),
        tx.crm_Opportunities.findMany({ where: { id: { in: [beforeId, afterId].filter((id): id is string => id !== null) }, sales_stage: stageId, status: "ACTIVE", deletedAt: null }, select: { id: true, board_order: true } }),
      ]);
      if (!moving || !stage || neighbors.length !== Number(Boolean(beforeId)) + Number(Boolean(afterId))) throw new Error("Board changed while dragging");
      const before = beforeId ? neighbors.find((row) => row.id === beforeId)?.board_order ?? null : null;
      const after = afterId ? neighbors.find((row) => row.id === afterId)?.board_order ?? null : null;
      const rank = rankBetween(before, after);
      if (rank !== null) {
        await tx.crm_Opportunities.update({ where: { id: opportunityId }, data: { board_order: rank, updatedBy: user.id } });
        return;
      }

      // A crowded interval is rare. Re-space this stage while preserving its current order.
      const rows = await tx.crm_Opportunities.findMany({
        where: { sales_stage: stageId, status: "ACTIVE", deletedAt: null, id: { not: opportunityId } },
        select: { id: true },
        orderBy: [{ board_order: "asc" }, { created_on: "asc" }, { id: "asc" }],
      });
      const insertionIndex = afterId ? rows.findIndex((row) => row.id === afterId) : beforeId ? rows.findIndex((row) => row.id === beforeId) + 1 : 0;
      if (insertionIndex < 0 || insertionIndex > rows.length) throw new Error("Board changed while dragging");
      const orderedIds = rows.map((row) => row.id);
      orderedIds.splice(insertionIndex, 0, opportunityId);
      if (orderedIds.length > Math.floor(2_147_483_647 / BOARD_ORDER_GAP)) throw new Error("Board is too large to reorder");
      for (let index = 0; index < orderedIds.length; index++) {
        await tx.crm_Opportunities.update({ where: { id: orderedIds[index] }, data: { board_order: (index + 1) * BOARD_ORDER_GAP } });
      }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 60_000 });
    revalidatePath("/[locale]/(routes)/crm/dashboard", "page");
    return { success: true };
  } catch (error) {
    console.error("[SAVE_OPPORTUNITY_BOARD_ORDER]", error);
    return { error: "Could not save board order. Refresh and try again." };
  }
}
