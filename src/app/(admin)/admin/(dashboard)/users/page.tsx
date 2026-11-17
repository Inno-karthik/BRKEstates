import { redirect } from "next/navigation";
import { getAllProfiles, getMyProfile } from "@/lib/admin-queries";
import { UsersManager } from "@/components/admin/users-manager";

export default async function UsersPage() {
  const me = await getMyProfile();
  if (me?.role !== "admin") redirect("/admin");

  const profiles = await getAllProfiles();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Users</h1>
        <p className="text-sm text-neutral-500">
          Create logins for your team and choose exactly which sections and CMS areas each one can access. Team
          members never get a delete option, anywhere.
        </p>
      </div>
      <UsersManager profiles={profiles} />
    </div>
  );
}
