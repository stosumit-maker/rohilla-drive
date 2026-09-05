-- Applied to ROHILLA-DRIVE production on 2026-09-05.
alter table public.vehicle_private
  add column if not exists sale_date date,
  add column if not exists total_cost numeric generated always as (
    coalesce(purchase_price,0)+coalesce(refurbishment_cost,0)+coalesce(transport_cost,0)+coalesce(other_cost,0)
  ) stored,
  add column if not exists margin numeric generated always as (
    coalesce(sale_price,0)-(
      coalesce(purchase_price,0)+coalesce(refurbishment_cost,0)+coalesce(transport_cost,0)+coalesce(other_cost,0)
    )
  ) stored;

comment on column public.vehicle_private.sale_date is 'Date the vehicle was sold.';
comment on column public.vehicle_private.total_cost is 'Generated total landed cost: purchase + refurbishment + transport + other.';
comment on column public.vehicle_private.margin is 'Generated gross margin: sale price - total cost.';
