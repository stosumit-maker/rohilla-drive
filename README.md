# ROHILLA DRIVE — Complete Vehicle & Mobility Network

**Official public website:** https://www.rohilladrive.com/

ROHILLA DRIVE is the official vehicle and automotive network by **Rohilla Multibrand Cars, Ambala City, Haryana, India**. The platform connects customers, individual sellers, OEM/authorised new-vehicle dealers, pre-owned dealers and automotive/service businesses across new vehicles, used vehicles, verification, services, mobility support and vehicle-life workflows.

**Brand identity:** ROHILLA DRIVE / Rohilla Drive  
**Official domain:** rohilladrive.com  
**Phone:** +91 70152 60003  
**Instagram:** https://www.instagram.com/rohillamultibrandcars/  
**Facebook:** https://www.facebook.com/profile.php?id=100094277025442  
**YouTube:** https://youtube.com/@sumitrohilla983

ROHILLA DRIVE is **not a driving school or ride-booking app**. It is an automotive vehicle-and-services network.

## Public and role portals
- Customer: `/` — public, no login.
- Owner/Admin: `/admin` — secure Auth, full inventory and control room.
- Dealer: `/dealer` — approved dealer login; own submissions remain draft until approval.
- Partner: `/partner` — approved service/dealer/inspection/insurance/finance/RSA/detailing/tyre/EV partners see only assigned requests.
- PWA manifest included for installable mobile web use.

## Inventory
Starts at ZERO. Admin can add a vehicle with 1–50+ photos, edit all public details, add/delete photos, publish/unpublish, mark sold or archive. Customers see only published vehicles and full gallery on `/cars/<id>`. Dealer submissions remain draft until Admin approval.

## Enquiries and services
Buy, Sell, Exchange, Find a Car, Third-Party Inspection, Finance, Insurance, Service & Repair, Glass, Tyres, RSA, Warranty, Detailing, EV, Dealer/Partner onboarding and Collaboration create structured leads and open WhatsApp to 7015260003. Service requests are also stored in `service_requests` when Supabase is configured.

## Permanent vehicle record
`vehicle_private` stores purchase price/date, refurbishment, transport, other costs, sale price, buyer/seller private data and RC status. `vehicle_events` stores an audit trail. These are protected with RLS.

## Security model
Roles: owner/admin/manager/sales/inspector/dealer/partner. Public users only read published vehicles/photos. Dealer/partner access is restricted by RLS to their own/assigned records. Private financial/RC fields are admin-protected.

## Social
Publishing creates Instagram/Facebook/YouTube queue records from the master vehicle/photos. Real automatic posting requires official platform APIs/OAuth; handles alone cannot authorize posting.

## Setup
1. Create Supabase project.
2. Run `supabase/schema.sql`.
3. Create Auth users and set `profiles.role`.
4. Set Vercel env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Deploy.

## App
This package is a responsive website + PWA-ready role portals using the same backend. A true Play Store AAB/APK is a separate Android packaging/signing/review step and should reuse the same backend; it is not represented as a fake Play Store app inside this ZIP.
