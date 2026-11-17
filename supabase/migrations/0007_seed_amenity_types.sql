-- Reasonable default amenity <-> property-type associations for the seeded amenities.
with pt as (
  select id, slug from public.property_types
),
links as (
  select a.id as amenity_id, p.id as property_type_id
  from public.amenities a
  join (values
    ('Swimming Pool', array['apartment','villa']),
    ('Gymnasium', array['apartment','villa']),
    ('Clubhouse', array['apartment','villa']),
    ('24x7 Security', array['apartment','villa','open-plot']),
    ('CCTV Surveillance', array['apartment','villa','open-plot']),
    ('Power Backup', array['apartment','villa']),
    ('Covered Parking', array['apartment','villa']),
    ('Children''s Play Area', array['apartment','villa']),
    ('Landscaped Garden', array['apartment','villa']),
    ('Lift', array['apartment']),
    ('Rainwater Harvesting', array['apartment','villa']),
    ('Gated Community', array['apartment','villa','open-plot']),
    ('Borewell', array['villa','open-plot','farm-land']),
    ('Electricity Connection', array['apartment','villa','open-plot','farm-land']),
    ('Compound Wall', array['villa','open-plot','farm-land'])
  ) as m(name, slugs) on a.name = m.name
  join pt p on p.slug = any(m.slugs)
)
insert into public.amenity_property_types (amenity_id, property_type_id)
select amenity_id, property_type_id from links
on conflict do nothing;
