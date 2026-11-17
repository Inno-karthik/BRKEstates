import { getAllLeads } from "@/lib/admin-queries";
import { LeadsCrm } from "@/components/admin/leads-crm";

export default async function LeadsPage() {
  const leads = await getAllLeads();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Leads (CRM)</h1>
        <p className="text-sm text-neutral-500">Every enquiry, with campaign source attribution.</p>
      </div>
      <LeadsCrm leads={leads} />
    </div>
  );
}
