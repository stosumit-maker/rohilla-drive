-- ROHILLA DRIVE multilingual Deal Room + Cross-State Assist

create table if not exists public.deal_rooms (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  public_token uuid not null default gen_random_uuid() unique,
  title text not null,
  status text not null default 'open',
  customer_language text not null default 'en-IN',
  operator_language text not null default 'hi-IN',
  customer_city text,
  vehicle_city text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deal_rooms_status_check check (status in ('open','verification','inspection','documentation','payment','logistics','delivered','closed','cancelled'))
);

create table if not exists public.deal_room_participants (
  room_id uuid not null references public.deal_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  participant_role text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (room_id,user_id)
);

create table if not exists public.deal_room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.deal_rooms(id) on delete cascade,
  sender_role text not null,
  sender_user_id uuid references auth.users(id) on delete set null,
  source_language text not null default 'en-IN',
  original_text text not null,
  operator_text text,
  customer_text text,
  translation_status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint deal_room_messages_sender_check check (sender_role in ('customer','admin','dealer','partner','system')),
  constraint deal_room_messages_translation_check check (translation_status in ('pending','ready','not_required','failed'))
);

create table if not exists public.deal_room_tasks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.deal_rooms(id) on delete cascade,
  task_type text not null,
  title text not null,
  status text not null default 'pending',
  position integer not null default 0,
  partner_id uuid references public.profiles(id) on delete set null,
  note text,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deal_room_tasks_status_check check (status in ('pending','in_progress','completed','blocked','cancelled'))
);

create index if not exists deal_rooms_lead_id_idx on public.deal_rooms(lead_id);
create index if not exists deal_room_messages_room_idx on public.deal_room_messages(room_id,created_at);
create index if not exists deal_room_tasks_room_idx on public.deal_room_tasks(room_id,position);

alter table public.deal_rooms enable row level security;
alter table public.deal_room_participants enable row level security;
alter table public.deal_room_messages enable row level security;
alter table public.deal_room_tasks enable row level security;

drop policy if exists deal_rooms_admin_all on public.deal_rooms;
create policy deal_rooms_admin_all on public.deal_rooms for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists deal_rooms_participant_read on public.deal_rooms;
create policy deal_rooms_participant_read on public.deal_rooms for select to authenticated using (
  exists(select 1 from public.deal_room_participants p where p.room_id=id and p.user_id=auth.uid() and p.active=true)
);

drop policy if exists deal_participants_admin_all on public.deal_room_participants;
create policy deal_participants_admin_all on public.deal_room_participants for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists deal_participants_self_read on public.deal_room_participants;
create policy deal_participants_self_read on public.deal_room_participants for select to authenticated using (user_id=auth.uid() and active=true);

drop policy if exists deal_messages_admin_all on public.deal_room_messages;
create policy deal_messages_admin_all on public.deal_room_messages for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists deal_messages_participant_read on public.deal_room_messages;
create policy deal_messages_participant_read on public.deal_room_messages for select to authenticated using (
  exists(select 1 from public.deal_room_participants p where p.room_id=deal_room_messages.room_id and p.user_id=auth.uid() and p.active=true)
);

drop policy if exists deal_messages_participant_insert on public.deal_room_messages;
create policy deal_messages_participant_insert on public.deal_room_messages for insert to authenticated with check (
  sender_user_id=auth.uid() and exists(select 1 from public.deal_room_participants p where p.room_id=deal_room_messages.room_id and p.user_id=auth.uid() and p.active=true)
);

drop policy if exists deal_tasks_admin_all on public.deal_room_tasks;
create policy deal_tasks_admin_all on public.deal_room_tasks for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists deal_tasks_participant_read on public.deal_room_tasks;
create policy deal_tasks_participant_read on public.deal_room_tasks for select to authenticated using (
  exists(select 1 from public.deal_room_participants p where p.room_id=deal_room_tasks.room_id and p.user_id=auth.uid() and p.active=true)
);

create or replace function public.create_cross_state_deal_room(
  p_lead_id uuid,
  p_title text,
  p_customer_language text default 'en-IN',
  p_operator_language text default 'hi-IN',
  p_vehicle_id uuid default null,
  p_customer_city text default null,
  p_vehicle_city text default null
) returns public.deal_rooms
language plpgsql
security definer
set search_path='public'
as $$
declare r public.deal_rooms;
begin
  if not public.is_admin() then raise exception 'admin access required'; end if;
  insert into public.deal_rooms(lead_id,vehicle_id,title,customer_language,operator_language,customer_city,vehicle_city,created_by)
  values(p_lead_id,p_vehicle_id,p_title,p_customer_language,p_operator_language,p_customer_city,p_vehicle_city,auth.uid())
  returning * into r;

  insert into public.deal_room_tasks(room_id,task_type,title,position) values
   (r.id,'vehicle_verification','Vehicle identity & listing verification',10),
   (r.id,'video_walkaround','Live / recorded vehicle walk-around',20),
   (r.id,'inspection','Independent physical inspection',30),
   (r.id,'documents','RC / ownership / challan / NOC document review',40),
   (r.id,'commercial_terms','Price, token and commercial terms confirmation',50),
   (r.id,'payment','Controlled payment coordination',60),
   (r.id,'transport','Transporter quote, pickup and transit plan',70),
   (r.id,'delivery','Delivery, handover and receipt confirmation',80),
   (r.id,'post_delivery','Post-delivery support / issue closure',90);

  insert into public.deal_room_messages(room_id,sender_role,source_language,original_text,operator_text,customer_text,translation_status)
  values(r.id,'system','en-IN','Rohilla Cross-State Assist room created.','Rohilla Cross-State Assist room created.','Rohilla Cross-State Assist room created.','ready');
  return r;
end;
$$;

create or replace function public.get_public_deal_room(p_token uuid)
returns jsonb
language sql
security definer
set search_path='public'
as $$
 select case when r.id is null then null else jsonb_build_object(
   'id',r.id,
   'title',r.title,
   'status',r.status,
   'customer_language',r.customer_language,
   'customer_city',r.customer_city,
   'vehicle_city',r.vehicle_city,
   'created_at',r.created_at,
   'tasks',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'task_type',t.task_type,'title',t.title,'status',t.status,'position',t.position,'note',t.note) order by t.position) from public.deal_room_tasks t where t.room_id=r.id),'[]'::jsonb),
   'messages',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'sender_role',m.sender_role,'text',coalesce(m.customer_text,m.original_text),'source_language',m.source_language,'created_at',m.created_at) order by m.created_at) from public.deal_room_messages m where m.room_id=r.id),'[]'::jsonb)
 ) end
 from public.deal_rooms r where r.public_token=p_token limit 1;
$$;

grant execute on function public.get_public_deal_room(uuid) to anon, authenticated;

create or replace function public.post_public_deal_message(p_token uuid,p_text text,p_language text default 'en-IN')
returns uuid
language plpgsql
security definer
set search_path='public'
as $$
declare v_room uuid; v_id uuid;
begin
  if length(trim(coalesce(p_text,'')))<1 or length(p_text)>5000 then raise exception 'invalid message'; end if;
  select id into v_room from public.deal_rooms where public_token=p_token and status not in ('closed','cancelled') limit 1;
  if v_room is null then raise exception 'deal room not available'; end if;
  insert into public.deal_room_messages(room_id,sender_role,source_language,original_text,customer_text,translation_status)
  values(v_room,'customer',coalesce(nullif(p_language,''),'en-IN'),trim(p_text),trim(p_text),'pending') returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.post_public_deal_message(uuid,text,text) to anon, authenticated;

create or replace function public.get_deal_room_by_id(p_room_id uuid)
returns jsonb
language sql
security definer
set search_path='public'
as $$
 select case when not public.is_admin() then null when r.id is null then null else jsonb_build_object(
   'room',to_jsonb(r),
   'tasks',coalesce((select jsonb_agg(to_jsonb(t) order by t.position) from public.deal_room_tasks t where t.room_id=r.id),'[]'::jsonb),
   'messages',coalesce((select jsonb_agg(to_jsonb(m) order by m.created_at) from public.deal_room_messages m where m.room_id=r.id),'[]'::jsonb),
   'participants',coalesce((select jsonb_agg(to_jsonb(p)) from public.deal_room_participants p where p.room_id=r.id),'[]'::jsonb)
 ) end
 from public.deal_rooms r where r.id=p_room_id limit 1;
$$;

grant execute on function public.get_deal_room_by_id(uuid) to authenticated;
