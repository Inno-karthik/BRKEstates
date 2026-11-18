-- Palette synced to the BKR Estates + Prakruti logo: red (primary), blue (secondary), gold (accent).
update public.page_themes set tokens = jsonb_build_object(
  'primary', '#d0191f', 'secondary', '#14307e', 'accent', '#d4af37',
  'background', '#ffffff', 'text', '#1b2233');
