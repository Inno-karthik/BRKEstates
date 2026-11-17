-- Big specification overhaul across all 4 property types, plus certifications and
-- layout/floor-plan image galleries. Everything here is optional — the public page
-- only ever shows fields that have a value, same as the existing attribute system.

alter table properties
  add column if not exists certifications jsonb not null default '[]'::jsonb,
  add column if not exists layout_images jsonb not null default '[]'::jsonb;

-- ========== APARTMENTS ==========
insert into attribute_definitions (property_type_id, key, label, field_type, unit, options, icon_name, sort_order)
select id, v.key, v.label, v.field_type, v.unit, v.options::jsonb, v.icon_name, v.sort_order
from property_types, (values
  ('community_type', 'Community Type', 'select', null, '["Standalone","Gated Community","Semi-Gated","Other"]', 'fence', 10),
  ('flat_type', 'Flat Type', 'select', null, '["Regular Flat","Duplex Apartment","Triplex Apartment","Penthouse","Studio Apartment","Serviced Apartment","Other"]', 'layout-grid', 11),
  ('sale_type', 'Property Type', 'select', null, '["New","Resale"]', 'tag', 12),
  ('water_source', 'Water Source', 'multiselect', null, '["Municipal Water","Borewell","Water Tanker","Other"]', 'droplets', 13),
  ('water_availability', 'Water Availability', 'select', null, '["24/7","Fixed Timings","Alternate Days","Seasonal","Other"]', 'clock', 14),
  ('water_storage', 'Water Storage', 'boolean', null, '[]', 'database', 15),
  ('power_backup', 'Power Backup', 'select', null, '["Full","Partial","Common Areas Only","No Backup"]', 'zap', 16)
) as v(key, label, field_type, unit, options, icon_name, sort_order)
where property_types.slug = 'apartment'
on conflict (property_type_id, key) do update set
  label = excluded.label, field_type = excluded.field_type, options = excluded.options;

-- ========== VILLAS ==========
insert into attribute_definitions (property_type_id, key, label, field_type, unit, options, icon_name, sort_order)
select id, v.key, v.label, v.field_type, v.unit, v.options::jsonb, v.icon_name, v.sort_order
from property_types, (values
  ('community_type', 'Community Type', 'select', null, '["Standalone","Gated Community","Semi-Gated","Other"]', 'fence', 10),
  ('villa_type', 'Villa Type', 'select', null, '["Independent Villa","Duplex Villa","Triplex Villa","Luxury Villa","Farm Villa","Row Villa","Twin Villa","Other"]', 'home', 11),
  ('sale_type', 'Property Type', 'select', null, '["New","Resale"]', 'tag', 12),
  ('plot_area_unit', 'Plot Area Unit', 'select', null, '["Sq Feet","Sq Yards","Cents","Guntas","Acres"]', 'ruler', 13),
  ('main_road_width', 'Main / Community Road Width (ft)', 'number', 'ft', '[]', 'move-horizontal', 14),
  ('main_road_type', 'Main / Community Road Type', 'select', null, '["BT Road","CC Road","Gravel Road","Earthen Road","Other"]', 'road', 15),
  ('connecting_road_width', 'Connecting Road Width (ft)', 'number', 'ft', '[]', 'move-horizontal', 16),
  ('connecting_road_type', 'Connecting Road Type', 'select', null, '["BT Road","CC Road","Gravel Road","Earthen Road","Other"]', 'road', 17),
  ('internal_road_width', 'Internal Layout Road Width (ft)', 'number', 'ft', '[]', 'move-horizontal', 18),
  ('internal_road_type', 'Internal Layout Road Type', 'select', null, '["BT Road","CC Road","Gravel Road","Earthen Road","Other"]', 'road', 19),
  ('approach_road_width', 'Approach Road Width (ft)', 'number', 'ft', '[]', 'move-horizontal', 20),
  ('approach_road_type', 'Approach Road Type', 'select', null, '["BT Road","CC Road","Gravel Road","Earthen Road","Other"]', 'road', 21),
  ('approach_road_status', 'Approach Road Status', 'select', null, '["Existing","Under Construction","Proposed","Not Verified"]', 'route', 22),
  ('direct_road_access', 'Direct Road Access', 'select', null, '["Yes","No","Not Verified"]', 'route', 23)
) as v(key, label, field_type, unit, options, icon_name, sort_order)
where property_types.slug = 'villa'
on conflict (property_type_id, key) do update set
  label = excluded.label, field_type = excluded.field_type, options = excluded.options;

-- plot_area: was a fixed sqyd number, now paired with plot_area_unit above
update attribute_definitions set unit = null
where key = 'plot_area' and property_type_id = (select id from property_types where slug = 'villa');

-- ========== OPEN PLOTS ==========
delete from attribute_definitions
where key = 'approval' and property_type_id = (select id from property_types where slug = 'open-plot');

update attribute_definitions set label = 'Plot-facing Road Width (ft)'
where key = 'road_width' and property_type_id = (select id from property_types where slug = 'open-plot');

insert into attribute_definitions (property_type_id, key, label, field_type, unit, options, icon_name, sort_order)
select id, v.key, v.label, v.field_type, v.unit, v.options::jsonb, v.icon_name, v.sort_order
from property_types, (values
  ('plot_type', 'Plot Type', 'select', null, '["Residential","Commercial","Mixed-use","Industrial","Other"]', 'map', 10),
  ('listing_type', 'Listing Type', 'select', null, '["Individual Plot","Resale Plot","Developer Layout","Gated Plotting Venture","Other"]', 'file-text', 11),
  ('development_type', 'Development Type', 'select', null, '["Gated Community","Open Layout","Standalone Plot","Other"]', 'fence', 12),
  ('sale_type', 'Sale Type', 'select', null, '["New","Resale"]', 'tag', 13),
  ('plot_status', 'Plot Status', 'select', null, '["Vacant","Developed","Partially Developed","Other"]', 'square-dashed', 14),
  ('plot_shape', 'Plot Shape', 'select', null, '["Rectangular","Square","Irregular","Other"]', 'shapes', 15),
  ('corner_plot', 'Corner Plot', 'select', null, '["Not a Corner Plot","North-East","North-West","South-East","South-West"]', 'compass', 16),
  ('plot_level', 'Plot Level', 'select', null, '["Road Level","Above Road Level","Below Road Level"]', 'layers', 17),
  ('main_road_width', 'Main / Community Road Width (ft)', 'number', 'ft', '[]', 'move-horizontal', 18),
  ('main_road_type', 'Main / Community Road Type', 'select', null, '["BT Road","CC Road","Gravel Road","Earthen Road","Other"]', 'road', 19),
  ('connecting_road_width', 'Connecting Road Width (ft)', 'number', 'ft', '[]', 'move-horizontal', 20),
  ('connecting_road_type', 'Connecting Road Type', 'select', null, '["BT Road","CC Road","Gravel Road","Earthen Road","Other"]', 'road', 21),
  ('internal_road_width', 'Internal Layout Road Width (ft)', 'number', 'ft', '[]', 'move-horizontal', 22),
  ('internal_road_type', 'Internal Layout Road Type', 'select', null, '["BT Road","CC Road","Gravel Road","Earthen Road","Other"]', 'road', 23),
  ('approach_road_width', 'Approach Road Width (ft)', 'number', 'ft', '[]', 'move-horizontal', 24),
  ('approach_road_type', 'Approach Road Type', 'select', null, '["BT Road","CC Road","Gravel Road","Earthen Road","Other"]', 'road', 25),
  ('approach_road_status', 'Approach Road Status', 'select', null, '["Existing","Under Construction","Proposed","Not Verified"]', 'route', 26),
  ('direct_road_access', 'Direct Road Access', 'select', null, '["Yes","No","Not Verified"]', 'route', 27)
) as v(key, label, field_type, unit, options, icon_name, sort_order)
where property_types.slug = 'open-plot'
on conflict (property_type_id, key) do update set
  label = excluded.label, field_type = excluded.field_type, options = excluded.options;

-- ========== FARM LAND ==========
delete from attribute_definitions
where key = 'extent' and property_type_id = (select id from property_types where slug = 'farm-land');

update attribute_definitions set field_type = 'multiselect',
  options = '["Borewell","Canal","Open Well","Rain-fed","Farm Pond","River","Other","None"]'::jsonb
where key = 'water_source' and property_type_id = (select id from property_types where slug = 'farm-land');

insert into attribute_definitions (property_type_id, key, label, field_type, unit, options, icon_name, sort_order)
select id, v.key, v.label, v.field_type, v.unit, v.options::jsonb, v.icon_name, v.sort_order
from property_types, (values
  ('farmland_type', 'Farmland Type', 'select', null, '["Agricultural Land","Farm Plot","Managed Farmland","Orchard","Plantation","Farmhouse with Land","Other"]', 'trees', 10),
  ('land_type', 'Land Type', 'select', null, '["Dry Land","Wet Land","Irrigated Land","Rainfed Land","Other"]', 'mountain', 11),
  ('sale_type', 'Sale Type', 'select', null, '["New","Resale"]', 'tag', 12),
  ('land_usage', 'Land Usage', 'select', null, '["Agricultural","Converted Non-Agricultural","Other","Not Verified"]', 'leaf', 13),
  ('land_condition', 'Land Condition', 'select', null, '["Cultivated","Uncultivated","Partially Cultivated","Other"]', 'sprout', 14),
  ('land_shape', 'Land Shape', 'select', null, '["Rectangular","Square","Irregular","Other"]', 'shapes', 15),
  ('land_level', 'Land Level', 'select', null, '["Level","Sloping","Uneven","Other"]', 'layers', 16),
  ('current_crops', 'Current Crops / Plantation', 'text', null, '[]', 'wheat', 17),
  ('number_of_trees', 'Number of Trees', 'number', null, '[]', 'trees', 18),
  ('number_of_borewells', 'Number of Borewells', 'number', null, '[]', 'droplets', 19),
  ('water_availability', 'Water Availability', 'select', null, '["Throughout the Year","Seasonal","Limited","Not Verified"]', 'clock', 20),
  ('approach_road_width', 'Approach Road Width (ft)', 'number', 'ft', '[]', 'move-horizontal', 21),
  ('approach_road_type', 'Approach Road Type', 'select', null, '["BT Road","CC Road","Gravel Road","Earthen Road","Other"]', 'road', 22),
  ('internal_road_width', 'Internal Road Width (ft)', 'number', 'ft', '[]', 'move-horizontal', 23),
  ('internal_road_type', 'Internal Road Type', 'select', null, '["BT Road","CC Road","Gravel Road","Earthen Road","Other"]', 'road', 24),
  ('distance_from_main_road', 'Distance from Main Road (km)', 'number', 'km', '[]', 'map-pin', 25)
) as v(key, label, field_type, unit, options, icon_name, sort_order)
where property_types.slug = 'farm-land'
on conflict (property_type_id, key) do update set
  label = excluded.label, field_type = excluded.field_type, options = excluded.options;
