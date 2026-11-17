-- BKR Estates branding + Visakhapatnam defaults. Config only — no listings, leads or content.
alter table public.site_settings alter column site_name set default 'BKR Estates';

update public.site_settings set
  site_name = 'BKR Estates',
  phone = '+91 95538 22333',
  whatsapp = '919553822333',
  email = 'bkrestatesvizag@gmail.com',
  address = '2nd Floor, 47-10-25/1, 2nd Ln, Sagar Nagar, Dwaraka Nagar, Visakhapatnam, Andhra Pradesh 530016',
  footer_text = 'BKR Estates — trusted real estate advisory in and around Visakhapatnam. Powered by Prakruti.',
  whatsapp_default_message = 'Hi BKR Estates, I would like to know more about your properties in Visakhapatnam.'
where id = 1;

-- Local approving authorities for Visakhapatnam / Andhra Pradesh instead of HMDA (Hyderabad).
update public.attribute_definitions
set options = '["VUDA","APCRDA","DTCP","RERA","Panchayat","Unapproved"]'::jsonb
where key = 'approval';

update public.page_themes set tokens = jsonb_build_object(
  'primary', '#9b1c1c', 'secondary', '#5c0f12', 'accent', '#d4a017',
  'background', case page_key when 'listings' then '#fffaf6' else '#ffffff' end,
  'text', '#2a1412');
alter table public.properties alter column color_scheme set default 'bkr';
