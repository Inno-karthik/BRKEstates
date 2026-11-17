import { notFound } from "next/navigation";
import { getLeadById } from "@/lib/admin-queries";
import { LeadDetailView } from "@/components/admin/lead-detail-view";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  return <LeadDetailView lead={lead} />;
}
