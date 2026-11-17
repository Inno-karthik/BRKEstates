-- Seed default property types, their dynamic attributes, and common amenities.
-- All are editable/removable from the admin; nothing here is hardcoded in the app.

insert into public.property_types (slug, name, description, icon_name, sort_order) values
  ('apartment', 'Apartments', 'Flats and apartments in gated communities', 'building-2', 1),
  ('villa', 'Villas', 'Independent villas and houses', 'home', 2),
  ('open-plot', 'Open Plots', 'Residential and commercial plots', 'square-dashed', 3),
  ('farm-land', 'Farm Land', 'Agricultural and farm land', 'trees', 4)
on conflict (slug) do nothing;

-- Apartment attributes
insert into public.attribute_definitions (property_type_id, key, label, field_type, unit, options, icon_name, sort_order)
select id, v.key, v.label, v.field_type, v.unit, v.options::jsonb, v.icon_name, v.sort_order
from public.property_types, (values
  ('bedrooms', 'Bedrooms', 'number', null, '[]', 'bed-double', 1),
  ('bathrooms', 'Bathrooms', 'number', null, '[]', 'bath', 2),
  ('floor_number', 'Floor Number', 'number', null, '[]', 'layers', 3),
  ('total_floors', 'Total Floors', 'number', null, '[]', 'building', 4),
  ('furnishing', 'Furnishing', 'select', null, '["Unfurnished","Semi-Furnished","Fully Furnished"]', 'sofa', 5),
  ('facing', 'Facing', 'select', null, '["North","South","East","West","North-East","North-West","South-East","South-West"]', 'compass', 6)
) as v(key, label, field_type, unit, options, icon_name, sort_order)
where property_types.slug = 'apartment'
on conflict (property_type_id, key) do nothing;

-- Villa attributes
insert into public.attribute_definitions (property_type_id, key, label, field_type, unit, options, icon_name, sort_order)
select id, v.key, v.label, v.field_type, v.unit, v.options::jsonb, v.icon_name, v.sort_order
from public.property_types, (values
  ('bedrooms', 'Bedrooms', 'number', null, '[]', 'bed-double', 1),
  ('bathrooms', 'Bathrooms', 'number', null, '[]', 'bath', 2),
  ('plot_area', 'Plot Area', 'number', 'sqyd', '[]', 'ruler', 3),
  ('floors', 'Number of Floors', 'number', null, '[]', 'building', 4),
  ('facing', 'Facing', 'select', null, '["North","South","East","West","North-East","North-West","South-East","South-West"]', 'compass', 5),
  ('car_parking', 'Car Parking', 'number', null, '[]', 'car', 6)
) as v(key, label, field_type, unit, options, icon_name, sort_order)
where property_types.slug = 'villa'
on conflict (property_type_id, key) do nothing;

-- Open Plot attributes
insert into public.attribute_definitions (property_type_id, key, label, field_type, unit, options, icon_name, sort_order)
select id, v.key, v.label, v.field_type, v.unit, v.options::jsonb, v.icon_name, v.sort_order
from public.property_types, (values
  ('plot_dimensions', 'Dimensions', 'text', null, '[]', 'ruler', 1),
  ('facing', 'Facing', 'select', null, '["North","South","East","West","North-East","North-West","South-East","South-West"]', 'compass', 2),
  ('approval', 'Approval', 'select', null, '["HMDA","DTCP","RERA","Panchayat","Unapproved"]', 'badge-check', 3),
  ('road_width', 'Road Width', 'number', 'ft', '[]', 'move-horizontal', 4)
) as v(key, label, field_type, unit, options, icon_name, sort_order)
where property_types.slug = 'open-plot'
on conflict (property_type_id, key) do nothing;

-- Farm Land attributes
insert into public.attribute_definitions (property_type_id, key, label, field_type, unit, options, icon_name, sort_order)
select id, v.key, v.label, v.field_type, v.unit, v.options::jsonb, v.icon_name, v.sort_order
from public.property_types, (values
  ('extent', 'Extent', 'number', 'acres', '[]', 'ruler', 1),
  ('water_source', 'Water Source', 'select', null, '["Borewell","Canal","Open Well","Rain-fed","None"]', 'droplets', 2),
  ('soil_type', 'Soil Type', 'text', null, '[]', 'mountain', 3),
  ('road_access', 'Road Access', 'boolean', null, '[]', 'route', 4)
) as v(key, label, field_type, unit, options, icon_name, sort_order)
where property_types.slug = 'farm-land'
on conflict (property_type_id, key) do nothing;

-- Amenities
insert into public.amenities (name, icon_name, category, sort_order) values
  ('Swimming Pool', 'waves', 'leisure', 1),
  ('Gymnasium', 'dumbbell', 'leisure', 2),
  ('Clubhouse', 'building', 'leisure', 3),
  ('24x7 Security', 'shield-check', 'safety', 4),
  ('CCTV Surveillance', 'camera', 'safety', 5),
  ('Power Backup', 'zap', 'utility', 6),
  ('Covered Parking', 'car', 'utility', 7),
  ('Children''s Play Area', 'baby', 'leisure', 8),
  ('Landscaped Garden', 'flower-2', 'leisure', 9),
  ('Lift', 'move-vertical', 'utility', 10),
  ('Rainwater Harvesting', 'cloud-rain', 'utility', 11),
  ('Gated Community', 'fence', 'safety', 12),
  ('Borewell', 'droplets', 'utility', 13),
  ('Electricity Connection', 'plug', 'utility', 14),
  ('Compound Wall', 'square', 'safety', 15)
on conflict (name) do nothing;
