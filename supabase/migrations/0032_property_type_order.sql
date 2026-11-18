-- Display order everywhere: Open Plots, Apartments, Villas, Farm Land.
update public.property_types set sort_order = 1 where slug = 'open-plot';
update public.property_types set sort_order = 2 where slug = 'apartment';
update public.property_types set sort_order = 3 where slug = 'villa';
update public.property_types set sort_order = 4 where slug = 'farm-land';
