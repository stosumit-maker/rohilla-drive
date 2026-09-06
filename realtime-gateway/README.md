# Rohilla Realtime Telephony Gateway

Rohilla Drive now has two implementation options for phone/media translation:

1. **Vercel WebSocket route:** `/api/telephony/media` in the main Next.js app. This is the preferred integrated route while Vercel WebSocket support is enabled for the project.
2. **Standalone Node gateway:** `realtime-gateway/server.mjs` for a dedicated always-on media worker if the telephony provider/account needs a separate host.

## What is already implemented

- WebSocket media ingress.
- OpenAI dedicated realtime translation WebSocket connection (`gpt-realtime-translate`).
- Continuous audio forwarding.
- Translated audio returned to the telephony stream.
- PCM16 24 kHz passthrough.
- G.711 μ-law 8 kHz ↔ PCM16 24 kHz conversion for common telephony media.
- Stream-token protection on the Vercel route.
- Target language can be supplied as `?target=hi`, `?target=kn`, etc.
- Input media track can be selected with `?source_track=inbound`.

## Required secrets / account configuration

These are intentionally not committed:

- `OPENAI_API_KEY`
- `EXOTEL_STREAM_SECRET` — random private token for the media WebSocket URL.
- Exotel/account credentials used to configure or initiate the call: `EXOTEL_ACCOUNT_SID`, `EXOTEL_API_KEY`, `EXOTEL_API_TOKEN`, `EXOTEL_CALLER_ID`.
- `TELEPHONY_AUDIO_CODEC` (`mulaw-8000` by default, or `pcm16-24000` when the provider sends that format).

Example stream URL shape after deployment:

`wss://www.rohilladrive.com/api/telephony/media?token=<private-token>&target=hi&source_track=inbound`

Do not place the private stream token in public website HTML.

## Exotel activation

Exotel's current developer documentation supports sending a call to a bot/media WebSocket using a `streamurl` with `streamtype=bidirectional`. The exact media event/track names and codec must be verified against the enabled Exotel AgentStream/Voicebot product on the Rohilla account before a real customer call is enabled.

The gateway accepts common `event: "start" | "media" | "stop"` frames, reads media from `media.payload`, and writes translated media using the same structure. If the enabled Exotel product uses a different frame contract, only the adapter functions need changing; the OpenAI translation side is already isolated.

## Two-human-leg calls

For a true **customer ↔ Rohilla operator** call where each side hears a different translated language, the telephony account must expose the two call legs/tracks separately (or route each leg through a dedicated media stream). Run one translation direction per leg:

- customer speech → operator language
- operator speech → customer language

The code is ready for the translation/media layer, but the final track mapping cannot be safely hardcoded before Exotel enables the account and confirms its AgentStream frame/leg contract.

## Safety / privacy

- Never expose standard AI/API keys to the browser or caller.
- Use a long random `EXOTEL_STREAM_SECRET`.
- Keep recordings disabled by default unless there is a business need and appropriate notice/consent.
- Do not infer identity, ownership, payment status or legal document validity from translated speech alone.
