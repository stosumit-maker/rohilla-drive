-- ROHILLA DRIVE: multilingual + Growth Engine V2
-- Prepared on feature branch. Apply at launch after preview QA.

insert into public.platform_connections(platform,connection_status,capabilities)
values
 ('translation','not_connected','["translate_text","detect_language","localize_content"]'::jsonb),
 ('speech','not_connected','["speech_to_text","text_to_speech","streaming_voice"]'::jsonb),
 ('telephony','not_connected','["inbound_call","outbound_call","bidirectional_audio_stream","live_call_translation"]'::jsonb),
 ('multimodal_ai','not_connected','["vehicle_vision","rc_understanding","plate_privacy","creative_generation","reasoning"]'::jsonb),
 ('whatsapp','not_connected','["translated_message_draft","approved_send","conversation_handoff"]'::jsonb)
on conflict (platform) do update set capabilities=excluded.capabilities,updated_at=now();

create or replace function public.plan_rohilla_daily_growth()
returns integer
language plpgsql
security definer
set search_path='public'
as $$
declare
  v_admin uuid;
  v_count integer:=0;
  v_added integer:=0;
begin
  select id into v_admin from public.profiles where role='admin' and active=true order by created_at asc limit 1;
  if v_admin is null then return 0; end if;

  -- Layer A: stale published inventory -> fresh creative/SEO/local-language review.
  insert into public.automation_jobs(created_by,actor_role,job_type,command,channels,source_vehicle_id,payload,status)
  select v_admin,'admin','inventory_growth_review',
         'Review this published vehicle for fresh creative, SEO, local-language variants, lead performance and promotion opportunity. Keep facts verified; do not publish externally or spend ad budget without an authorised connection and applicable approval.',
         '["website","seo","instagram","facebook","youtube"]'::jsonb,
         v.id,
         jsonb_build_object('pipeline_version',2,'signal','stale_inventory','vehicle_type',coalesce(v.vehicle_type,'car'),'brand',v.brand,'model',v.model,'year',v.year,'asking_price',v.asking_price,'city',v.city,'stock_age_days',greatest(0,(current_date-v.created_at::date)),'target_languages',jsonb_build_array('en-IN','hi-IN')),
         'queued'
  from public.vehicles v
  where v.status='published' and v.created_at < now()-interval '7 days'
    and not exists(select 1 from public.automation_jobs j where j.source_vehicle_id=v.id and j.job_type='inventory_growth_review' and j.created_at>now()-interval '7 days');
  get diagnostics v_added=row_count; v_count:=v_count+v_added;

  -- Layer B: customer lead follow-up gap.
  insert into public.automation_jobs(created_by,actor_role,job_type,command,channels,payload,status)
  select v_admin,'admin','lead_followup_review',
         'Prepare the next best customer follow-up: concise, relevant, language-aware and based only on this lead. Draft only; do not contact the customer until an authorised messaging channel or operator action is available.',
         '["whatsapp_draft"]'::jsonb,
         jsonb_build_object('pipeline_version',2,'signal','lead_followup_gap','lead_id',l.id,'enquiry_type',l.enquiry_type,'vehicle_type',l.vehicle_type,'city',l.customer_city,'preferred_brand',l.preferred_brand,'preferred_model',l.preferred_model,'budget',l.budget),
         'queued'
  from public.leads l
  where coalesce(l.status,'new') in ('new','contacted','qualified') and l.created_at < now()-interval '4 hours'
    and not exists(select 1 from public.automation_jobs j where j.job_type='lead_followup_review' and j.payload->>'lead_id'=l.id::text and j.created_at>now()-interval '24 hours');
  get diagnostics v_added=row_count; v_count:=v_count+v_added;

  -- Layer C: new vehicle demand with no competing OEM/dealer offer yet.
  insert into public.automation_jobs(created_by,actor_role,job_type,command,channels,payload,status)
  select v_admin,'admin','new_vehicle_network_gap',
         'This new-vehicle requirement has no dealer/OEM offer yet. Recommend which authorised new-vehicle dealers/OEM sales teams should receive the opportunity and what information is still needed. Do not reveal private customer contact details to a dealer before controlled handoff.',
         '["website"]'::jsonb,
         jsonb_build_object('pipeline_version',2,'signal','new_vehicle_no_offer','lead_id',l.id,'vehicle_type',l.vehicle_type,'city',l.customer_city,'preferred_brand',l.preferred_brand,'preferred_model',l.preferred_model,'budget',l.budget),
         'queued'
  from public.leads l
  where l.new_or_used='new' and coalesce(l.status,'new') not in ('closed','lost') and l.created_at < now()-interval '2 hours'
    and not exists(select 1 from public.new_vehicle_offers o where o.lead_id=l.id)
    and not exists(select 1 from public.automation_jobs j where j.job_type='new_vehicle_network_gap' and j.payload->>'lead_id'=l.id::text and j.created_at>now()-interval '24 hours');
  get diagnostics v_added=row_count; v_count:=v_count+v_added;

  -- Layer D: service request waiting for network action.
  insert into public.automation_jobs(created_by,actor_role,job_type,command,channels,payload,status)
  select v_admin,'admin','service_network_gap',
         'Review this waiting service request and recommend the right Rohilla Business Hub provider/category and next action. Preserve customer privacy and draft the language-aware handoff.',
         '["website","whatsapp_draft"]'::jsonb,
         jsonb_build_object('pipeline_version',2,'signal','service_waiting','service_request_id',s.id,'category',s.category,'location',s.customer_location),
         'queued'
  from public.service_requests s
  where coalesce(s.status,'new')='new' and s.created_at < now()-interval '2 hours'
    and not exists(select 1 from public.automation_jobs j where j.job_type='service_network_gap' and j.payload->>'service_request_id'=s.id::text and j.created_at>now()-interval '24 hours');
  get diagnostics v_added=row_count; v_count:=v_count+v_added;

  -- Layer E: network activation opportunities.
  insert into public.automation_jobs(created_by,actor_role,job_type,command,channels,payload,status)
  select v_admin,'admin','network_activation_review',
         'Review this pending business application for fit, missing verification and the safest next onboarding action. Do not auto-approve.',
         '["website"]'::jsonb,
         jsonb_build_object('pipeline_version',2,'signal','dealer_application_waiting','application_id',d.id,'business_name',d.business_name),
         'queued'
  from public.dealer_applications d
  where coalesce(d.status,'new') in ('new','reviewing') and d.created_at < now()-interval '12 hours'
    and not exists(select 1 from public.automation_jobs j where j.job_type='network_activation_review' and j.payload->>'application_id'=d.id::text and j.created_at>now()-interval '3 days');
  get diagnostics v_added=row_count; v_count:=v_count+v_added;

  return v_count;
end;
$$;
