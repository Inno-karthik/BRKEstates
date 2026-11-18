export type FieldType = "number" | "text" | "select" | "multiselect" | "boolean";

export type PropertyType = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  icon_url: string | null;
  image_url: string | null;
  accent_color: string | null;
  color_scheme: string;
  is_active: boolean;
  sort_order: number;
};

export type AttributeDefinition = {
  id: string;
  property_type_id: string;
  key: string;
  label: string;
  field_type: FieldType;
  unit: string | null;
  options: string[];
  icon_name: string | null;
  is_filterable: boolean;
  is_required: boolean;
  sort_order: number;
};

export type Amenity = {
  id: string;
  name: string;
  icon_name: string | null;
  icon_url: string | null;
  is_active: boolean;
  sort_order: number;
  property_type_ids?: string[];
};

export type UnitVariant = {
  label: string;
  bhk: number | null;
  facing: string | null;
  price: number | null;
  total_units: number | null;
  area_unit: string | null;
  carpet_area: number | null;
  built_up_area: number | null;
  /** Apartments only. */
  super_built_up_area: number | null;
  /** Apartments and villas — Undivided Share of Land, always in sqyd. */
  uds: number | null;
  balconies: number | null;
  car_parking: number | null;
  bike_parking: number | null;
  construction_status: string | null;
  expected_occupancy: string | null;
  occupancy_certificate: string | null;
  property_age: number | null;
  /** Villas only. */
  water_source: string[] | null;
  water_availability: string | null;
  water_storage: boolean | null;
  power_backup: string | null;
};

export type Certification = {
  type: string;
  number: string | null;
  date_issued: string | null;
  show_publicly: boolean;
};

export type LayoutImage = {
  title: string;
  url: string;
};

/** A named 360°/iframe embed (virtual tour, OurPlots-style layout view, etc.) — up to 3
 *  per property. */
export type VirtualTour = {
  title: string;
  embed_code: string;
};

/** Admin-authored "Future Growth" point (upcoming metro, IT corridor, infra project,
 *  etc.) — any number per property, shown alongside specs/amenities/certifications. */
export type GrowthHighlight = {
  icon?: string | null;
  title: string;
  subtitle: string;
};

export type PropertyStatus = "draft" | "published" | "paused" | "sold" | "archived";
export type MapPrecision = "exact" | "approximate" | "locality";
export type ImageKind = "photo" | "floor_plan" | "render";

export type Property = {
  id: string;
  slug: string;
  title: string;
  type_id: string;
  status: PropertyStatus;
  price: number | null;
  price_label: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  area_value: number | null;
  area_value_max: number | null;
  area_unit: string | null;
  description: string | null;
  cover_image: string | null;
  featured: boolean;
  is_verified: boolean;
  color_scheme: string;
  latitude: number | null;
  longitude: number | null;
  map_precision: MapPrecision;
  embed_code: string | null;
  virtual_tours: VirtualTour[];
  growth_highlights: GrowthHighlight[];
  /** Highlighted note shown under the configurations on the public page. */
  variant_notes: string | null;
  meta_title: string | null;
  meta_description: string | null;
  total_units: number | null;
  available_units: number | null;
  unit_variants: UnitVariant[];
  certifications: Certification[];
  layout_images: LayoutImage[];
  attributes: Record<string, string | number | boolean | string[]>;
  created_at: string;
  updated_at: string;
  property_type?: PropertyType;
  images?: { id: string; url: string; sort_order: number; kind?: ImageKind }[];
  amenities?: Amenity[];
  brochure?: { pdf_url: string } | null;
  nearby_places?: NearbyPlace[];
};

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "site_visit_planned"
  | "visited"
  | "negotiation"
  | "on_hold"
  | "won"
  | "lost"
  | "inactive"
  | "duplicate";

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "site_visit_planned",
  "visited",
  "negotiation",
  "on_hold",
  "won",
  "lost",
  "inactive",
  "duplicate",
];

export type Lead = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string | null;
  property_id: string | null;
  variant_label: string | null;
  source: string;
  status: LeadStatus;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_page: string | null;
  created_at: string;
  property?: { title: string; slug: string } | null;
  notes?: LeadNote[];
};

export type LeadNote = {
  id: string;
  lead_id: string;
  note: string;
  created_at: string;
};

export type LeadEventType =
  | "page_view"
  | "property_view"
  | "property_click"
  | "whatsapp_click"
  | "call_click"
  | "email_click"
  | "directions_click"
  | "cta_click"
  | "social_click"
  | "brochure_download"
  | "share_click"
  | "search"
  | "favorite_add"
  | "compare_add"
  | "chat_open"
  | "chat_lead";

export type PropertyDocument = {
  id: string;
  property_id: string;
  title: string;
  file_url: string;
  is_confidential: boolean;
  access_key: string | null;
  sort_order: number;
  created_at: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  status: "draft" | "published";
  author: string | null;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  gallery_images: { url: string; caption: string | null }[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
  translations: Partial<Record<"te" | "hi", { title: string; content: string }>> | null;
};

export type GalleryAlbumImage = {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
};

export type GalleryAlbum = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  images?: GalleryAlbumImage[];
};

export type PageKey = "home" | "listings" | "property_detail" | "about" | "contact";

export type SiteSettings = {
  id: number;
  site_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  twitter_url: string | null;
  footer_text: string | null;
  meta_pixel_id: string | null;
  google_tag_id: string | null;
  google_ads_conversion_id: string | null;
  google_ads_conversion_label: string | null;
  whatsapp_default_message: string | null;
  blog_sidebar_title: string | null;
  blog_sidebar_property_ids: string[] | null;
  page_seo: Record<string, { title?: string; description?: string }> | null;
  home_map_enabled: boolean;
};

export const CMS_AREAS = ["properties", "property-types", "amenities", "locations", "blog", "popups", "settings"] as const;
export type CmsArea = (typeof CMS_AREAS)[number];

export const STAFF_SECTIONS = ["cms", "crm", "vault"] as const;
export type StaffSection = (typeof STAFF_SECTIONS)[number];

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "admin" | "staff";
  sections: StaffSection[];
  cms_areas: CmsArea[];
  created_at: string;
};

export type Location = {
  id: string;
  name: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export const POPUP_PAGES = ["home", "listings", "property", "locations", "blog", "blog_post", "about", "contact"] as const;
export type PopupPage = (typeof POPUP_PAGES)[number];

export type Popup = {
  id: string;
  title: string;
  image_url: string | null;
  target_url: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  /** Empty = shown on every page. Otherwise only on the listed page keys. */
  pages: PopupPage[];
  /** Only meaningful when "property" is in `pages` — null means every property page,
   *  set means only that one property's page. */
  property_id: string | null;
  property?: { slug: string; title: string } | null;
  created_at: string;
};

export type NearbyPlace = {
  id: string;
  property_id: string;
  name: string;
  category: string;
  place_id: string | null;
  latitude: number;
  longitude: number;
  sort_order: number;
};
