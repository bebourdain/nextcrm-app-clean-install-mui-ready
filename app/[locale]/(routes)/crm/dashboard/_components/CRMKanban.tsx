"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { GripVertical, MoreHorizontal, PlusCircle, ThumbsDown } from "lucide-react";
import { Avatar, Box, Card, CardContent, Dialog, IconButton, Menu, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  crm_Opportunities,
  crm_Opportunities_Sales_Stages,
} from "@prisma/client";

import { toast } from "sonner";

import { NewOpportunityForm } from "../../opportunities/components/NewOpportunityForm";
import { setInactiveOpportunity } from "@/actions/crm/opportunity/dashboard/set-inactive";
import { updateOpportunity } from "@/actions/crm/opportunities/update-opportunity";

interface CRMKanbanProps {
  salesStages: crm_Opportunities_Sales_Stages[];
  opportunities: crm_Opportunities[];
  crmData: any;
}

type Column = crm_Opportunities_Sales_Stages & {
  opportunities: crm_Opportunities[];
};

function initColumns(
  opps: crm_Opportunities[],
  stages: crm_Opportunities_Sales_Stages[]
): Column[] {
  return stages.map((stage) => ({
    ...stage,
    opportunities: opps.filter(
      (o: any) => o.sales_stage === stage.id && o.status === "ACTIVE"
    ),
  }));
}

// Draggable Opportunity Card
function OpportunityCard({ opportunity, router, onThumbsDown, stage, salesStages }: any) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return <Card ref={setNodeRef} style={style} variant="outlined" sx={{ my: 1 }}>
    <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>{opportunity.name}</Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton ref={setActivatorNodeRef} {...attributes} {...listeners} size="small" aria-label="Drag opportunity" sx={{ cursor: "grab", "&:active": { cursor: "grabbing" } }}><GripVertical size={18} /></IconButton>
          <IconButton size="small" aria-label="Opportunity actions" onClick={(event) => setMenuAnchor(event.currentTarget)}><MoreHorizontal size={18} /></IconButton>
        </Stack>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          <MenuItem onClick={() => { setMenuAnchor(null); router.push(`/crm/opportunities/${opportunity.id}`); }}>View</MenuItem>
        </Menu>
      </Stack>
      {opportunity.description && <Tooltip title={opportunity.description}><Typography variant="caption" color="text.secondary" sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opportunity.description.substring(0, 200)}</Typography></Tooltip>}
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>Amount: {opportunity.budget?.toString()}</Typography>
      <Typography variant="caption" color={opportunity.close_date && new Date(opportunity.close_date) < new Date() ? "error.main" : "text.secondary"} sx={{ display: "block" }}>
        Expected closing: {format(opportunity.close_date ? new Date(opportunity.close_date) : new Date(), "dd/MM/yyyy")}
      </Typography>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mt: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Avatar src={opportunity.assigned_to_user?.avatar || `${process.env.NEXT_PUBLIC_APP_URL}/images/nouser.png`} sx={{ width: 24, height: 24 }} />
          <Typography variant="caption">{opportunity.assigned_to_user?.name}</Typography>
        </Stack>
        {stage.probability !== Math.max(...salesStages.map((s: any) => Number(s.probability || 0))) &&
          <IconButton size="small" color="error" aria-label="Mark opportunity inactive" onClick={() => onThumbsDown(opportunity.id)}><ThumbsDown size={16} /></IconButton>}
      </Stack>
    </CardContent>
  </Card>;
}

// Droppable zone inside each column — same pattern as DroppableColumn in Kanban.tsx
function DroppableStage({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return <Box ref={setNodeRef} sx={{ minHeight: 50 }}>{children}</Box>;
}

const CRMKanban = ({
  salesStages,
  opportunities: data,
  crmData,
}: CRMKanbanProps) => {
  const router = useRouter();

  const [selectedStage, setSelectedStage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const serverDataRef = useRef(data);
  const [columns, setColumns] = useState<Column[]>(() =>
    initColumns(data, salesStages)
  );
  const columnsRef = useRef<Column[]>(columns);
  columnsRef.current = columns;

  const [activeOpportunity, setActiveOpportunity] =
    useState<crm_Opportunities | null>(null);
  const origStageIdRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);

  const { accounts, contacts, saleTypes, saleStages, campaigns, currencies } = crmData;

  // Sync from server (e.g. after onThumbsDown router.refresh()) — only when not dragging
  useEffect(() => {
    if (serverDataRef.current !== data && !isDraggingRef.current) {
      serverDataRef.current = data;
      setColumns(initColumns(data, salesStages));
    }
  }, [data, salesStages]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    isDraggingRef.current = true;
    const { active } = event;
    const activeId = active.id as string;
    for (const col of columnsRef.current) {
      const opp = col.opportunities.find((o) => o.id === activeId);
      if (opp) {
        setActiveOpportunity(opp);
        origStageIdRef.current = col.id;
        break;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const current = columnsRef.current;

    // Find source column and opportunity index
    let fromColIdx = -1,
      fromOppIdx = -1;
    for (let i = 0; i < current.length; i++) {
      const idx = current[i].opportunities.findIndex((o) => o.id === activeId);
      if (idx !== -1) {
        fromColIdx = i;
        fromOppIdx = idx;
        break;
      }
    }
    if (fromColIdx === -1) return;

    // Determine destination — overId is either a stage ID or an opportunity ID
    let toColIdx = current.findIndex((c) => c.id === overId);
    let toOppIdx = 0;
    const isOverColumn = toColIdx !== -1;

    if (!isOverColumn) {
      for (let i = 0; i < current.length; i++) {
        const idx = current[i].opportunities.findIndex((o) => o.id === overId);
        if (idx !== -1) {
          toColIdx = i;
          toOppIdx = idx;
          break;
        }
      }
    } else {
      toOppIdx = current[toColIdx].opportunities.length;
    }

    if (toColIdx === -1) return;
    if (fromColIdx === toColIdx) return;

    const newColumns = current.map((c) => ({
      ...c,
      opportunities: [...c.opportunities],
    }));
    const [movedOpp] = newColumns[fromColIdx].opportunities.splice(
      fromOppIdx,
      1
    );
    (movedOpp as any).sales_stage = newColumns[toColIdx].id;
    newColumns[toColIdx].opportunities.splice(toOppIdx, 0, movedOpp);
    columnsRef.current = newColumns;
    setColumns(newColumns);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    isDraggingRef.current = false;
    const { active } = event;
    setActiveOpportunity(null);

    const activeId = active.id as string;
    const current = columnsRef.current;

    // Find where the opportunity ended up after handleDragOver moves
    let curColIdx = -1;
    for (let i = 0; i < current.length; i++) {
      if (current[i].opportunities.find((o) => o.id === activeId)) {
        curColIdx = i;
        break;
      }
    }
    if (curColIdx === -1) return;

    const curStageId = current[curColIdx].id;
    const wasCrossStageMove =
      origStageIdRef.current !== null &&
      origStageIdRef.current !== curStageId;

    if (!wasCrossStageMove) return;

    try {
      const result = await updateOpportunity({
        id: activeId,
        sales_stage: curStageId,
      });
      if (result?.error) {
        toast.error(result.error);
        columnsRef.current = initColumns(data, salesStages);
        setColumns(initColumns(data, salesStages));
      } else {
        toast.success("Opportunity stage changed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
      columnsRef.current = initColumns(data, salesStages);
      setColumns(initColumns(data, salesStages));
    }
  };

  const onThumbsDown = async (opportunityId: string) => {
    try {
      await setInactiveOpportunity(opportunityId);
      toast.success("Opportunity has been set to inactive");
    } catch (error) {
      console.log(error);
    } finally {
      router.refresh();
    }
  };

  // Lost opportunities come from server data (updated via router.refresh on thumbsDown)
  const lostOpportunities = data.filter(
    (o: any) => o.status === "INACTIVE"
  );

  return (
    <>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="lg" fullWidth scroll="paper">
        <Box sx={{ p: { xs: 2, md: 4 }, overflowY: "auto" }}>
          <NewOpportunityForm
            accounts={accounts}
            contacts={contacts}
            salesType={saleTypes}
            saleStages={saleStages}
            campaigns={campaigns}
            currencies={(currencies ?? []).map((c: any) => ({ code: c.code, name: c.name, symbol: c.symbol }))}
            selectedStage={selectedStage}
            onDialogClose={() => setIsDialogOpen(false)}
          />
        </Box>
      </Dialog>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ display: "flex", width: "100%", gap: 1.5, overflowX: "auto", pb: 2, alignItems: "stretch" }}>
          {columns.map((col) => (
            <Card
              key={col.id}
              variant="outlined"
              sx={{ minWidth: 300, flex: "1 0 300px", maxWidth: 420, overflow: "hidden" }}
            >
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", p: 1.5, borderBottom: 1, borderColor: "divider" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{col.name}</Typography>
                <IconButton size="small" aria-label={`Add opportunity to ${col.name}`} onClick={() => {
                    setSelectedStage(col.id);
                    setIsDialogOpen(true);
                  }}><PlusCircle size={18} /></IconButton>
              </Stack>
              <CardContent sx={{ minHeight: 240, maxHeight: "65vh", overflowY: "auto", p: 1.5 }}>
                <SortableContext
                  items={col.opportunities.map((o) => o.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableStage id={col.id}>
                    {col.opportunities.map((opportunity) => (
                      <OpportunityCard
                        key={opportunity.id}
                        opportunity={opportunity}
                        router={router}
                        onThumbsDown={onThumbsDown}
                        stage={col}
                        salesStages={salesStages}
                      />
                    ))}
                  </DroppableStage>
                </SortableContext>
              </CardContent>
            </Card>
          ))}

          <Card variant="outlined" sx={{ minWidth: 300, flex: "1 0 300px", maxWidth: 420, overflow: "hidden" }}>
            <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Lost</Typography></Box>
            <CardContent sx={{ minHeight: 240, maxHeight: "65vh", overflowY: "auto", p: 1.5 }}>
              {lostOpportunities.map((opportunity: any, index: number) => (
                <Card key={opportunity.id ?? index} variant="outlined" sx={{ mb: 1 }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{opportunity?.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>{opportunity.description?.substring(0, 200)}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Amount: {opportunity.budget?.toString()}</Typography>
                    <Typography variant="caption" color={opportunity.close_date && new Date(opportunity.close_date) < new Date() ? "error.main" : "text.secondary"}>
                      Expected closing: {format(opportunity.close_date ? new Date(opportunity.close_date) : new Date(), "dd/MM/yyyy")}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </Box>

        <DragOverlay>
          {activeOpportunity ? <Card variant="outlined" sx={{ width: 280, opacity: 0.85, boxShadow: 6 }}><CardContent><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeOpportunity.name}</Typography></CardContent></Card> : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default CRMKanban;
