ALTER TABLE "crm_Opportunities" ADD COLUMN "board_order" INTEGER NOT NULL DEFAULT 0;

WITH ranked AS (
  SELECT id, (ROW_NUMBER() OVER (
    PARTITION BY sales_stage
    ORDER BY created_on ASC NULLS LAST, id ASC
  ) * 1024)::INTEGER AS next_order
  FROM "crm_Opportunities"
)
UPDATE "crm_Opportunities" AS opportunity
SET "board_order" = ranked.next_order
FROM ranked
WHERE opportunity.id = ranked.id;

CREATE INDEX "crm_Opportunities_sales_stage_board_order_idx"
  ON "crm_Opportunities"("sales_stage", "board_order");
