import { BasicView } from "./components/BasicView";
import { MuiOpportunityDetailLayout } from "./components/MuiOpportunityDetailLayout";
import { MuiOpportunityAccounts, MuiOpportunityContacts, MuiOpportunityDocuments } from "./components/MuiRelatedSections";
import { MuiFindSimilarButton } from "./components/MuiFindSimilarButton";
import LineItemsSection from "./components/LineItemsSection";


import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getOpportunity } from "@/actions/crm/get-opportunity";
import { getContactsByOpportunityId } from "@/actions/crm/get-contacts-by-opportunityId";
import { getDocumentsByOpportunityId } from "@/actions/documents/get-documents-by-opportunityId";
import { getAccountsByOpportunityId } from "@/actions/crm/get-accounts-by-opportunityId";
import { getProductsFull } from "@/actions/crm/products/get-products";
import { serializeDecimalsList } from "@/lib/serialize-decimals";
import { HistoryTab } from "./components/HistoryTab";
import { ActivitiesSection } from "./components/ActivitiesSection";

const OpportunityView = async (
  props: {
    params: Promise<{ opportunityId: string }>;
  }
) => {
  const params = await props.params;

  const {
    opportunityId
  } = params;

  const [opportunity, crmData, accounts, contacts, documents, allProducts] =
    await Promise.all([
      getOpportunity(opportunityId),
      getAllCrmData(),
      getAccountsByOpportunityId(opportunityId),
      getContactsByOpportunityId(opportunityId),
      getDocumentsByOpportunityId(opportunityId),
      getProductsFull(),
    ]);

  const activeProducts = allProducts
    .filter((p: any) => p.status === "ACTIVE")
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      unit_price: Number(p.unit_price),
    }));

  const serializedLineItems = opportunity?.lineItems
    ? serializeDecimalsList(opportunity.lineItems as any[])
    : [];

  if (!opportunity) return <div>Opportunity not found</div>;

  return (
    <MuiOpportunityDetailLayout
      title={`Opportunity ${opportunity.name} - detail view`}
      description={"Description - " + opportunity.description}
      overview={
        <>
            <BasicView data={opportunity as any} />
            <LineItemsSection
              opportunityId={opportunityId}
              lineItems={serializedLineItems}
              currency={(opportunity as any)?.currency || "EUR"}
              products={activeProducts}
            />
            <ActivitiesSection opportunityId={opportunityId} />
            <MuiFindSimilarButton recordId={opportunityId} />
            <MuiOpportunityAccounts crmData={crmData} data={accounts} />
            <MuiOpportunityContacts crmData={crmData} data={contacts} />
            <MuiOpportunityDocuments data={documents} />
        </>
      }
      history={<HistoryTab opportunityId={opportunityId} />}
    />
  );
};

export default OpportunityView;
