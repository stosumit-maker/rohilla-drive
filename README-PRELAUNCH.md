# ROHILLA DRIVE — Prelaunch V2 Checklist

## Code / database complete on `multilingual-ai-v2`

- Customer first-visit 12-language selection.
- Public language translation layer with private-portal exclusion.
- Localized SEO landing URLs: `/en /hi /pa /kn /ta /te /ml /mr /gu /bn /or /ur`.
- Hreflang alternates and sitemap coverage.
- Customer Language Bridge and multilingual voice/text intake.
- Customer Back/Home navigation on subflows.
- Collapsible Quick Actions so floating actions do not hide page content.
- Direct Business Hub create-account / register / login flows.
- Separate OEM / Authorised New Vehicle Dealer and Pre-Owned Dealer registration.
- Direct Service / Mobility / RVSF / Other Partner registration.
- OEM/new-vehicle opportunity and quote network wording/workflows.
- Secure Admin/Dealer/Partner Language Desks.
- Browser speech-to-speech realtime interpretation code.
- Cross-State Deal Room database, RLS, customer token access and 9-step workflow.
- Admin Deal Room control, customer Deal Room, Dealer Deal Rooms and Partner Deal Rooms.
- Multimodal Vehicle AI secured endpoint and Admin Vehicle AI desk.
- Rohilla Intelligence V2 8-layer growth command model.
- Additive `plan_rohilla_daily_growth_v2()` prepared in DB without replacing current production planner.
- Connection readiness dashboard.
- Vercel WebSocket telephony translation media route + standalone fallback gateway.
- Preview build/TypeScript check passes.

## External authorisations still required before features can execute live

- `OPENAI_API_KEY` — multimodal vehicle AI + browser realtime interpretation + telephony translation engine.
- `GOOGLE_TRANSLATE_API_KEY` — public website/message translation layer (unless consolidated to another translation provider before launch).
- Exotel/telephony account with AgentStream/Voicebot bidirectional streaming enabled and credentials.
- `EXOTEL_STREAM_SECRET` — generated private random stream token.
- Confirm Exotel media codec and customer/operator track names on the enabled account.
- Meta/Instagram/Facebook OAuth.
- YouTube OAuth/API access.
- Google Ads OAuth/developer token and budget controls.
- Google Search Console property verification/API access.

## Activation gates

- Do not merge the feature branch until preview UI/device QA is complete.
- Do not activate `plan_rohilla_daily_growth_v2()` on a schedule until Admin confirms desired cadence.
- Do not enable automated external publishing or paid spend without account authorisation and explicit budget controls.
- Do not enable real customer phone-call recording by default; apply notice/consent requirements first.
- Test one Punjabi and one Kannada end-to-end customer journey before production promotion.
