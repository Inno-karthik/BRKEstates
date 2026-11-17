import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtectedRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/crm") || pathname.startsWith("/vault-admin");
  const isLoginRoute = pathname === "/admin/login";

  if (isProtectedRoute && !isLoginRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/choose";
    return NextResponse.redirect(url);
  }

  // Section/area gating for staff accounts — the real access control is in RLS (so a
  // staff user can never write outside their grant even if they hit an API directly),
  // this just stops them from navigating into a page they have no business seeing.
  if (isProtectedRoute && !isLoginRoute && pathname !== "/admin/choose" && user) {
    const required = requiredAccessFor(pathname);
    if (required) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, sections, cms_areas")
        .eq("id", user.id)
        .single();

      const isOwner = profile?.role === "admin";
      const sections: string[] = profile?.sections ?? [];
      const cmsAreas: string[] = profile?.cms_areas ?? [];

      const allowed =
        isOwner ||
        (required.type === "section" && sections.includes(required.section)) ||
        (required.type === "cms-area" && sections.includes("cms") && cmsAreas.includes(required.area));

      if (!allowed) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/choose";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

type RequiredAccess = { type: "owner" } | { type: "section"; section: "cms" | "crm" | "vault" } | { type: "cms-area"; area: string };

const CMS_AREA_ROUTES: [string, string][] = [
  ["/admin/users", "__owner__"],
  ["/admin/properties", "properties"],
  ["/admin/property-types", "property-types"],
  ["/admin/amenities", "amenities"],
  ["/admin/locations", "locations"],
  ["/admin/blog", "blog"],
  ["/admin/popups", "popups"],
  ["/admin/settings", "settings"],
];

function requiredAccessFor(pathname: string): RequiredAccess | null {
  for (const [prefix, area] of CMS_AREA_ROUTES) {
    if (pathname.startsWith(prefix)) return area === "__owner__" ? { type: "owner" } : { type: "cms-area", area };
  }
  if (pathname.startsWith("/crm")) return { type: "section", section: "crm" };
  if (pathname.startsWith("/vault-admin")) return { type: "section", section: "vault" };
  if (pathname.startsWith("/admin")) return { type: "section", section: "cms" };
  return null;
}

export const config = {
  matcher: ["/admin/:path*", "/crm/:path*", "/vault-admin/:path*"],
};
