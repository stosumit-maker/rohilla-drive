import {createClient} from "@supabase/supabase-js";

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL||"https://abdtbnrktpdvnrswmaik.supabase.co";
const SUPABASE_ANON_KEY=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||"sb_publishable_c_yH8BDakHeeu1jYTgnGWA_YAr8ZXve";

export type PortalActor={user:any;role:"admin"|"dealer"|"partner"|"staff";db:any};

function bearer(req:Request){const h=req.headers.get("authorization")||"";return h.toLowerCase().startsWith("bearer ")?h.slice(7).trim():""}

export async function requirePortalActor(req:Request,allowed:(PortalActor["role"])[]):Promise<{actor?:PortalActor;error?:Response}>{
 const token=bearer(req);if(!token)return {error:Response.json({error:"Authentication required"},{status:401})};
 const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error:userError}=await db.auth.getUser(token);if(userError||!user)return {error:Response.json({error:"Invalid or expired session"},{status:401})};
 const {data:profile,error:profileError}=await db.from("profiles").select("role,active").eq("id",user.id).single();
 if(profileError||!profile?.active)return {error:Response.json({error:"Active portal access required"},{status:403})};
 let role=String(profile.role||"") as PortalActor["role"];
 if(role==="admin"){const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);if(aal?.currentLevel!=="aal2"||!isAdmin)return {error:Response.json({error:"Admin authenticator verification required"},{status:403})}}
 if(!allowed.includes(role))return {error:Response.json({error:"This portal role is not authorised for this action"},{status:403})};
 return {actor:{user,role,db}};
}
