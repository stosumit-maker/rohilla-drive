"use client";
import {useEffect,useRef,useState} from 'react'; import {supabase} from '../supabaseClient'; import AdminVehiclePoster from '../components/AdminVehiclePoster';
const ADMIN_GATE_KEY='rohilla_admin_verified_at';
const ADMIN_GATE_MS=10*60*1000;
function hasFreshAdminGate(){try{const t=Number(sessionStorage.getItem(ADMIN_GATE_KEY)||0);return t>0&&Date.now()-t<ADMIN_GATE_MS}catch{return false}}
function markAdminGate(){try{sessionStorage.setItem(ADMIN_GATE_KEY,String(Date.now()))}catch{}}
function clearAdminGate(){try{sessionStorage.removeItem(ADMIN_GATE_KEY)}catch{}}
export default function Admin(){const db=supabase();const [session,setSession]=useState<any>(null);const [accessDenied,setAccessDenied]=useState(false);const [cars,setCars]=useState<any[]>([]);const [apps,setApps]=useState<any[]>([]);const [partnerApps,setPartnerApps]=useState<any[]>([]);const [partners,setPartners]=useState<any[]>([]);const [requests,setRequests]=useState<any[]>([]);const [salesLeads,setSalesLeads]=useState<any[]>([]);const [msg,setMsg]=useState('');const [files,setFiles]=useState<File[]>([]);const [f,setF]=useState<any>({});const [editing,setEditing]=useState<any>(null);const [editFiles,setEditFiles]=useState<File[]>([]);const [otpEmail,setOtpEmail]=useState('');const [otpSent,setOtpSent]=useState(false);const [mfaMode,setMfaMode]=useState<'none'|'setup'|'challenge'>('none');const [mfaFactor,setMfaFactor]=useState<any>(null);const [mfaData,setMfaData]=useState<any>(null);const [mfaCode,setMfaCode]=useState('');const [mfaBusy,setMfaBusy]=useState(false);const [quickText,setQuickText]=useState('');const [soldVehicleId,setSoldVehicleId]=useState('');const [saleVehicle,setSaleVehicle]=useState<any>(null);const [saleForm,setSaleForm]=useState<any>({inventory_owner_type:'rohilla_inventory',sale_outcome:'sold_by_rohilla',sold_notes:''});const [interactiveFiles,setInteractiveFiles]=useState<Record<string,File[]>>({});const [validationTouched,setValidationTouched]=useState(false);const [publishing,setPublishing]=useState(false);const [publishProgress,setPublishProgress]=useState({stage:'Ready',done:0,total:0,percent:0});const [duplicateWarning,setDuplicateWarning]=useState<any>(null);const [allowDuplicateOnce,setAllowDuplicateOnce]=useState(false);const publishLock=useRef(false);const submissionId=useRef('');
useEffect(()=>{db.auth.getSession().then(async({data})=>{if(data.session){await ensureSecureAdmin(data.session)}else{setSession(null);clearAdminGate()}})},[]);
async function load(){const [a,b,c,d,e,g]=await Promise.all([db.from('vehicles').select('*,vehicle_photos(id,url,path,sort_order)').order('created_at',{ascending:false}),db.from('dealer_applications').select('*').order('created_at',{ascending:false}),db.from('collaboration_requests').select('*').order('created_at',{ascending:false}),db.from('profiles').select('id,name,phone,business_name,service_categories,city,active').eq('role','partner').order('created_at',{ascending:false}),db.from('service_requests').select('id,customer_name,customer_phone,category,customer_location,vehicle_location,details,preferred_time,status,assigned_partner_id,created_at,vehicle:vehicles(brand,model,variant,year)').order('created_at',{ascending:false}),db.from('leads').select('id,vehicle_id,customer_name,customer_phone,requirement,message,status,source,enquiry_type,new_or_used,created_at').order('created_at',{ascending:false})]);setCars(a.data||[]);setApps(b.data||[]);setPartnerApps(c.data||[]);setPartners(d.data||[]);setRequests((e.data||[]).map((x:any)=>({...x,vehicle:Array.isArray(x.vehicle)?x.vehicle[0]||null:x.vehicle})));setSalesLeads(g.data||[]);}
async function ensureSecureAdmin(sess:any){
 setMsg('Checking administrator access…');
 const {data:profile,error:profileErr}=await db.from('profiles').select('role,active').eq('id',sess.user.id).single();
 if(profileErr||!profile||!profile.active||!['owner','admin'].includes(profile.role)){
  setAccessDenied(true);setSession(null);clearAdminGate();await db.auth.signOut();setMsg('This account does not have administrator access.');return;
 }
 const {data:isAdmin,error:adminErr}=await db.rpc('is_admin');
 if(adminErr||!isAdmin){
  setAccessDenied(true);setSession(null);clearAdminGate();await db.auth.signOut();setMsg('This account is not authorised for the Administration Console.');return;
 }
 setAccessDenied(false);setSession(sess);setOtpSent(false);
 const {data:fac,error:facErr}=await db.auth.mfa.listFactors();
 if(facErr){setMsg(facErr.message);return}
 const verified=(fac?.totp||[]).find((x:any)=>x.status==='verified');
 if(!verified){
  const {data,error}=await db.auth.mfa.enroll({factorType:'totp',friendlyName:'ROHILLA DRIVE Administrator'});
  if(error){setMsg(error.message);return}
  setMfaData(data);setMfaMode('setup');setMsg('Set up your free Authenticator once, then enter the 6-digit code.');return;
 }
 setMfaFactor(verified);
 const {data:aal,error:aalErr}=await db.auth.mfa.getAuthenticatorAssuranceLevel();
 if(aalErr){setMsg(aalErr.message);return}
 if(aal?.currentLevel==='aal2'&&hasFreshAdminGate()){
  setMfaMode('none');setMsg('');setMfaCode('');await load();return;
 }
 setMfaMode('challenge');setMsg('Enter the 6-digit code from your Authenticator app.');
}
async function sendOtp(e:React.FormEvent<HTMLFormElement>){
 e.preventDefault();clearAdminGate();setAccessDenied(false);setMfaBusy(true);setMsg('Sending secure sign-in email…');
 await db.auth.signOut();
 const {error}=await db.auth.signInWithOtp({email:otpEmail.trim(),options:{shouldCreateUser:false,emailRedirectTo:`${location.origin}/admin`}});
 setMfaBusy(false);
 if(error){setMsg(error.message);return}
 setOtpSent(true);setMsg('Check your email. Use the sign-in code or link, then Authenticator will handle future unlocks.');
}
async function verifyEmailOtp(e:React.FormEvent<HTMLFormElement>){
 e.preventDefault();if(mfaCode.length!==6)return;
 setMfaBusy(true);setMsg('Verifying email code…');
 const {data,error}=await db.auth.verifyOtp({email:otpEmail.trim(),token:mfaCode,type:'email'});
 setMfaBusy(false);
 if(error||!data.session){setMsg(error?.message||'Code could not be verified.');return}
 setMfaCode('');await ensureSecureAdmin(data.session);
}
async function verifySetup(){
 if(!mfaData?.id||mfaCode.length!==6)return;
 setMfaBusy(true);
 const {error}=await db.auth.mfa.challengeAndVerify({factorId:mfaData.id,code:mfaCode});
 setMfaBusy(false);
 if(error){setMsg(error.message);return}
 markAdminGate();setMfaMode('none');setMfaData(null);setMfaCode('');setMsg('');
 const {data:{session:nextSession}}=await db.auth.getSession();
 if(nextSession){setSession(nextSession);await load()}
}
async function verifyChallenge(){
 if(!mfaFactor?.id||mfaCode.length!==6)return;
 setMfaBusy(true);
 const {error}=await db.auth.mfa.challengeAndVerify({factorId:mfaFactor.id,code:mfaCode});
 setMfaBusy(false);
 if(error){setMsg(error.message);return}
 markAdminGate();setMfaMode('none');setMfaCode('');setMsg('');
 const {data:{session:nextSession}}=await db.auth.getSession();
 if(nextSession){setSession(nextSession);await load()}
}
async function signOutAdmin(){clearAdminGate();setMfaMode('challenge');setMfaCode('');setMsg('Admin locked. Enter your Authenticator code to unlock.')}
function cleanRegistration(value:any){return String(value||'').toUpperCase().replace(/[^A-Z0-9]/g,'')}
function publicRegistrationPrefix(value:any){const s=cleanRegistration(value);return s.match(/^[A-Z]{2}\d{1,2}/)?.[0]||s.match(/^\d{2}BH/)?.[0]||''}
async function registrationFingerprint(value:any){const s=cleanRegistration(value);if(!s)return '';const bytes=new TextEncoder().encode(s);const digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('')}
function chooseInteractive(category:string,list:File[]){setInteractiveFiles(old=>({...old,[category]:list}))}
const requiredVehicleFields=[['brand','Brand'],['model','Model'],['year','Year'],['km','KM'],['fuel','Fuel'],['owner_count','Owner'],['price','Price'],['city','City'],['registration_number','Full Registration']] as const;
function missingVehicleFields(values:any){return requiredVehicleFields.filter(([key])=>!String(values?.[key]??'').trim())}
function updateVehicleField(key:string,value:any){setF((old:any)=>({...old,[key]:value}))}
async function uploadInteractiveMedia(vehicleId:string){
 const rows:any[]=[];let index=0;
 for(const [category,chosen] of Object.entries(interactiveFiles)){
  for(const file of chosen){
   const path=`${vehicleId}/interactive-${category}-${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'')}`;
   const up=await db.storage.from('vehicle-photos').upload(path,file,{upsert:false,contentType:file.type||undefined});if(up.error)throw new Error(up.error.message);
   const url=db.storage.from('vehicle-photos').getPublicUrl(path).data.publicUrl;
   rows.push({vehicle_id:vehicleId,media_kind:file.type.startsWith('video/')?'video':'image',media_category:category,url,path,sort_order:index++});
  }
 }
 if(rows.length){const {error}=await db.from('vehicle_media').insert(rows);if(error)throw new Error(error.message)}
 return rows;
}
function openSale(car:any){setSaleVehicle(car);setSoldVehicleId('');setSaleForm({inventory_owner_type:car.inventory_owner_type||'rohilla_inventory',sale_outcome:car.partner_id?'sold_through_rohilla':'sold_by_rohilla',sold_notes:''})}
async function confirmSale(){
 if(!saleVehicle)return;
 const through=['sold_by_rohilla','sold_through_rohilla'].includes(saleForm.sale_outcome);
 const nextStatus=through?'sold':'archived';
 const {error}=await db.from('vehicles').update({status:nextStatus,inventory_owner_type:saleForm.inventory_owner_type,sale_outcome:saleForm.sale_outcome,sold_notes:saleForm.sold_notes||null,sold_at:saleForm.sale_outcome==='removed'?null:new Date().toISOString()}).eq('id',saleVehicle.id);
 if(error){setMsg(error.message);return}
 setSaleVehicle(null);setMsg(through?'Moved to Sold History.':'Removed from active inventory; it will not appear in Sold History.');await load();
}
async function uploadPhotos(vehicleId:string, chosen:File[]){
 const rows:any[]=[];let completed=0;const batchSize=4;
 for(let i=0;i<chosen.length;i+=batchSize){
  const batch=chosen.slice(i,i+batchSize);
  const uploaded=await Promise.all(batch.map(async(file,batchIndex)=>{
   const n=i+batchIndex;const path=`${vehicleId}/${Date.now()}-${n}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'')}`;
   const up=await db.storage.from('vehicle-photos').upload(path,file,{upsert:false});if(up.error)throw new Error(up.error.message);
   const pub=db.storage.from('vehicle-photos').getPublicUrl(path).data.publicUrl;
   completed++;setPublishProgress({stage:`Uploading photos ${completed}/${chosen.length}`,done:completed,total:chosen.length,percent:20+Math.round((completed/Math.max(chosen.length,1))*65)});
   return {vehicle_id:vehicleId,url:pub,sort_order:n,path};
  }));
  rows.push(...uploaded);
  const {error}=await db.from('vehicle_photos').insert(uploaded);if(error)throw new Error(error.message);
 }
 return rows.map(row=>row.url);
}
async function findDuplicateVehicle(registrationHash=''){
 if(registrationHash){const exact=await db.from('vehicles').select('id,brand,model,variant,year,km,fuel,owner_count,asking_price,city,status,created_at').eq('registration_fingerprint',registrationHash).in('status',['published','draft']).limit(1);if(exact.error)throw new Error(exact.error.message);if(exact.data?.[0])return exact.data[0]}
 const {data,error}=await db.from('vehicles').select('id,brand,model,variant,year,km,fuel,owner_count,asking_price,city,status,created_at')
  .ilike('brand',String(f.brand||'').trim()).ilike('model',String(f.model||'').trim()).eq('year',Number(f.year)).eq('km',Number(f.km))
  .eq('fuel',String(f.fuel||'')).eq('owner_count',Number(f.owner_count)).eq('asking_price',Number(f.price)).in('status',['published','draft','sold'])
  .order('created_at',{ascending:false}).limit(10);
 if(error)throw new Error(error.message);
 const norm=(v:any)=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');
 return (data||[]).find((v:any)=>norm(v.variant)===norm(f.variant)&&norm(v.city)===norm(f.city))||null;
}
function parseVehicleText(input:string){
 const clean=input.replace(/\r/g,' ').replace(/[•|]+/g,' ').replace(/\s+/g,' ').trim();const lower=clean.toLowerCase();
 const modelBrands:Record<string,string>={'grand vitara':'Maruti Suzuki','wagon r':'Maruti Suzuki','wagonr':'Maruti Suzuki','brezza':'Maruti Suzuki','baleno':'Maruti Suzuki','swift':'Maruti Suzuki','alto':'Maruti Suzuki','celerio':'Maruti Suzuki','dzire':'Maruti Suzuki','ertiga':'Maruti Suzuki','fronx':'Maruti Suzuki','s-cross':'Maruti Suzuki','grand i10':'Hyundai','i20':'Hyundai','creta':'Hyundai','venue':'Hyundai','verna':'Hyundai','aura':'Hyundai','alcazar':'Hyundai','tucson':'Hyundai','seltos':'Kia','sonet':'Kia','carens':'Kia','wr-v':'Honda','wrv':'Honda','amaze':'Honda','elevate':'Honda','city':'Honda','innova crysta':'Toyota','innova':'Toyota','fortuner':'Toyota','glanza':'Toyota','hyryder':'Toyota','xuv700':'Mahindra','xuv500':'Mahindra','scorpio':'Mahindra','thar':'Mahindra','bolero':'Mahindra','harrier':'Tata','safari':'Tata','nexon':'Tata','punch':'Tata','tiago':'Tata','altroz':'Tata','aria':'Tata','polo':'Volkswagen','vento':'Volkswagen','virtus':'Volkswagen','taigun':'Volkswagen','superb':'Skoda','octavia':'Skoda','rapid':'Skoda','kushaq':'Skoda','slavia':'Skoda','kwid':'Renault','duster':'Renault','kiger':'Renault','triber':'Renault','ecosport':'Ford','endeavour':'Ford','figo':'Ford','hector':'MG','astor':'MG','compass':'Jeep','meridian':'Jeep','c200':'Mercedes-Benz','c-class':'Mercedes-Benz','e-class':'Mercedes-Benz','gla':'Mercedes-Benz','glc':'Mercedes-Benz','evoque':'Land Rover','discovery sport':'Land Rover','xc40':'Volvo','xc60':'Volvo','es 300h':'Lexus'};
 const brandAliases:[string,string][]=[['maruti suzuki','Maruti Suzuki'],['maruti','Maruti Suzuki'],['hyundai','Hyundai'],['kia','Kia'],['honda','Honda'],['toyota','Toyota'],['mahindra','Mahindra'],['tata','Tata'],['volkswagen','Volkswagen'],['skoda','Skoda'],['renault','Renault'],['nissan','Nissan'],['ford','Ford'],['mercedes','Mercedes-Benz'],['bmw','BMW'],['audi','Audi'],['land rover','Land Rover'],['range rover','Land Rover'],['mg','MG'],['jeep','Jeep'],['volvo','Volvo'],['lexus','Lexus']];
 const model=Object.keys(modelBrands).sort((a,b)=>b.length-a.length).find(name=>lower.includes(name))||'';
 let brand=brandAliases.find(([key])=>lower.includes(key))?.[1]||modelBrands[model]||'';
 const yearMatch=clean.match(/\b(20(?:0\d|1\d|2\d))(?:\s*\/\s*(20(?:0\d|1\d|2\d)))?\b/);const year=yearMatch?.[1]||'';
 const lakhKm=lower.match(/(\d+(?:\.\d+)?)\s*(?:lac|lakh|lacs|lakhs)\s*(?:km|kms|driven)\b/i);
 const directKm=lower.match(/(\d{1,3}(?:,\d{3})+|\d{4,6})\s*(?:km|kms|kilomet(?:er|re)s?|driven)\b/i);
 const km=lakhKm?Math.round(Number(lakhKm[1])*100000):directKm?Number(directKm[1].replace(/,/g,'')):'';
 const priceMatch=lower.match(/(?:asking(?:\s*price)?|price|rate|₹|rs\.?|inr)\s*[:=-]?\s*(\d+(?:[.,]\d+)*)\s*(lac|lakh|lacs|lakhs|l)?/i);
 let price:number|string='';if(priceMatch){const raw=Number(priceMatch[1].replace(/,/g,''));price=Math.round((priceMatch[2]||raw<1000)?raw*100000:raw)}
 const ownerMatch=lower.match(/\b([1-9])\s*(?:st|nd|rd|th)?\s*owner\b|\b(first|second|third|fourth)\s*owner\b/i);
 const ownerWords:Record<string,number>={first:1,second:2,third:3,fourth:4};const owner=ownerMatch?(ownerMatch[1]?Number(ownerMatch[1]):ownerWords[String(ownerMatch[2]).toLowerCase()]):'';
 const fuelMatch=lower.match(/\b(petrol|diesel|cng|electric|ev|hybrid)\b/i);const fuel=fuelMatch?(fuelMatch[1].toLowerCase()==='ev'?'Electric':fuelMatch[1][0].toUpperCase()+fuelMatch[1].slice(1).toLowerCase()):'';
 const cityMatch=clean.match(/(?:location|city)\s*[:=-]?\s*([A-Za-z ]{2,28}?)(?=\s+(?:price|rate|₹|rs\.?|\d{4,6}\s*km|\d+\s*(?:st|nd|rd|th)?\s*owner)|$)/i);const city=cityMatch?.[1]?.trim()||'Ambala City';
 const registrationMatch=clean.toUpperCase().match(/\b(?:[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{1,4}|\d{2}\s?BH\s?\d{4}\s?[A-Z]{1,2})\b/);const registration_number=registrationMatch?.[0]||'';
 let variant='';const variantMatch=clean.match(/\b(AX7L|AX7|HTX\+?|GTX\+?|X-?Line|RXT|RXZ|Titanium(?:\s+Plus)?|Trendline|Trend|Highline|Sportz|Asta|Era|Delta|Zeta|Alpha|ZXI(?:\+|\(O\))?|VXI(?:\+|\(O\))?|VDI|LDI|VX|ZX|XZ\+|XT\+|XZ|XT|HSE|SE|L&K|EX|SX\+?)\b/i);if(variantMatch)variant=variantMatch[1];else if(model){const idx=lower.indexOf(model.toLowerCase());if(idx>=0){const tail=clean.slice(idx+model.length).trim();variant=tail.split(/\b(?:petrol|diesel|cng|electric|hybrid|automatic|manual|amt|dct|cvt|\d+\s*(?:st|nd|rd|th)?\s*owner|\d[\d,.]*\s*(?:km|kms|lac|lakh)|price|rate|asking|₹|rs\.)\b/i)[0].trim().replace(/^(?:-|:)+|(?:-|:)+$/g,'').trim();if(variant.split(/\s+/).length>5)variant=''}}
 return {brand,model:model?model.replace(/\b\w/g,x=>x.toUpperCase()):'',variant,year,km,fuel,owner_count:owner,price,city,registration_number,notes:input.trim()};
}
function applyQuickDetails(){if(!quickText.trim()){setValidationTouched(true);setMsg('Paste the vehicle details first.');return}const parsed=parseVehicleText(quickText);const next={...f,...Object.fromEntries(Object.entries(parsed).filter(([,v])=>v!==''&&v!==undefined))};setF(next);setValidationTouched(true);const missing=missingVehicleFields(next).map(([,label])=>label);setMsg(missing.length?'Details read. Missing: '+missing.join(', ')+'. Fill them here before publishing.':'Details auto-filled. Add photos and publish.');}
async function add(e:React.FormEvent){
 e.preventDefault();if(publishLock.current)return;
 setValidationTouched(true);const missing=missingVehicleFields(f).map(([,label])=>label);
 if(missing.length){setMsg('Missing details: '+missing.join(', ')+'. Fill the highlighted fields in Quick Add.');document.getElementById('quick-add')?.scrollIntoView({behavior:'smooth',block:'start'});return}if(files.length<1){setMsg('Please select at least 1 vehicle photo.');document.getElementById('quick-add')?.scrollIntoView({behavior:'smooth',block:'start'});return}
 publishLock.current=true;setPublishing(true);setDuplicateWarning(null);setPublishProgress({stage:'Checking for duplicate listing…',done:0,total:files.length,percent:5});setMsg('Submitting vehicle… please do not tap Publish again.');
 try{
  const regHash=await registrationFingerprint(f.registration_number);
  if(!allowDuplicateOnce){
   const existing=await findDuplicateVehicle(regHash);
   if(existing){setDuplicateWarning(existing);setMsg(`Duplicate blocked: ${existing.year} ${existing.brand} ${existing.model} is already in inventory.`);setPublishProgress({stage:'Duplicate blocked',done:0,total:files.length,percent:0});return}
  }
  if(!submissionId.current)submissionId.current=crypto.randomUUID();
  setPublishProgress({stage:'Creating secure draft…',done:0,total:files.length,percent:12});
  const {data,error}=await db.from('vehicles').insert({brand:f.brand,model:f.model,variant:f.variant,year:Number(f.year),km:Number(f.km),fuel:f.fuel,owner_count:Number(f.owner_count),asking_price:Number(f.price),city:f.city,public_notes:f.notes||'',status:'draft',client_submission_id:submissionId.current,registration_prefix:publicRegistrationPrefix(f.registration_number)||null,registration_fingerprint:regHash||null,inventory_owner_type:f.inventory_owner_type||'rohilla_inventory'}).select().single();
  if(error){
   if((error as any)?.code==='23505'){setMsg('This vehicle or registration is already active/submitted. Duplicate prevented.');setPublishProgress({stage:'Duplicate prevented',done:0,total:files.length,percent:100});await load();return}
   throw new Error(error.message);
  }
  const privateRegistration=await db.from('vehicle_private').upsert({id:data.id,registration_number:cleanRegistration(f.registration_number),registration_source:'admin_intake',registration_verified:false},{onConflict:'id'});
  if(privateRegistration.error){
   await db.from('vehicles').update({status:'archived'}).eq('id',data.id);
   submissionId.current='';setAllowDuplicateOnce(false);
   throw new Error('Vehicle registration could not be stored privately. The incomplete draft was hidden: '+privateRegistration.error.message);
  }
  setPublishProgress({stage:'Uploading vehicle photos…',done:0,total:files.length,percent:20});
  let media:string[]=[];
  try{media=await uploadPhotos(data.id,files);const extra=await uploadInteractiveMedia(data.id);media.push(...extra.map((x:any)=>x.url))}catch(err:any){await db.from('vehicles').update({status:'archived'}).eq('id',data.id);submissionId.current='';setAllowDuplicateOnce(false);setMsg((err?.message?err.message+' — ':'')+'Upload interrupted. Incomplete attempt is hidden; press Publish to retry safely.');setPublishProgress({stage:'Upload interrupted — safe to retry',done:0,total:files.length,percent:0});await load();return}
  setPublishProgress({stage:'Finalizing listing…',done:files.length,total:files.length,percent:92});
  const published=await db.from('vehicles').update({status:'published'}).eq('id',data.id);if(published.error)throw new Error(published.error.message);
  setPublishProgress({stage:'Published. Preparing social queue…',done:files.length,total:files.length,percent:97});
  const social=await db.from('social_posts').insert(['instagram','facebook','youtube'].map(platform=>({vehicle_id:data.id,platform,caption:null,media_urls:media,status:'queued'})));
  setF({});setFiles([]);setInteractiveFiles({});setQuickText('');setValidationTouched(false);setAllowDuplicateOnce(false);submissionId.current='';setPublishProgress({stage:'Vehicle published successfully',done:files.length,total:files.length,percent:100});
  setMsg(social.error?'Vehicle published. Social queue was not created, but the website listing is live.':'Vehicle published successfully. You can safely add the next car.');
  await load();
 }catch(err:any){setMsg(err?.message||'Vehicle submission failed. Please try again.');setPublishProgress({stage:'Submission failed',done:0,total:files.length,percent:0})}
 finally{publishLock.current=false;setPublishing(false)}
}
function startEdit(c:any){setEditing({...c});setEditFiles([]);setMsg('')}
async function saveEdit(e:React.FormEvent){e.preventDefault();if(!editing)return;setMsg('Saving changes…');const {error}=await db.from('vehicles').update({brand:editing.brand,model:editing.model,variant:editing.variant,year:Number(editing.year),km:Number(editing.km),fuel:editing.fuel,owner_count:Number(editing.owner_count),asking_price:Number(editing.asking_price),city:editing.city,public_notes:editing.public_notes||'',status:editing.status}).eq('id',editing.id);if(error){setMsg(error.message);return}try{if(editFiles.length)await uploadPhotos(editing.id,editFiles);setEditing(null);setEditFiles([]);setMsg('Vehicle updated.');load()}catch(err:any){setMsg(err.message)}}
async function deletePhoto(p:any){if(!confirm('Delete this photo?'))return;const {error}=await db.from('vehicle_photos').delete().eq('id',p.id);if(error){setMsg(error.message);return}if(p.path)await db.storage.from('vehicle-photos').remove([p.path]);if(editing){setEditing({...editing,vehicle_photos:(editing.vehicle_photos||[]).filter((x:any)=>x.id!==p.id)})}}
async function status(id:string,status:string){const {error}=await db.from('vehicles').update({status}).eq('id',id);if(error)setMsg(error.message);load()}
async function appStatus(id:string,status:string){const {data,error}=await db.from('dealer_applications').update({status}).eq('id',id).select('applicant_user_id').single();if(error){setMsg(error.message);return}if(status==='approved'&&data?.applicant_user_id){const p=await db.from('profiles').update({role:'dealer',active:true}).eq('id',data.applicant_user_id);if(p.error){setMsg(p.error.message);return}}if(status==='rejected'&&data?.applicant_user_id){await db.from('profiles').update({active:false}).eq('id',data.applicant_user_id)}setMsg(`Dealer application ${status}.`);load()}
async function partnerStatus(id:string,status:string){const {data,error}=await db.from('collaboration_requests').update({status}).eq('id',id).select('applicant_user_id').single();if(error){setMsg(error.message);return}if(status==='approved'&&data?.applicant_user_id){const p=await db.from('profiles').update({role:'partner',active:true}).eq('id',data.applicant_user_id);if(p.error){setMsg(p.error.message);return}}if(status==='rejected'&&data?.applicant_user_id){await db.from('profiles').update({active:false}).eq('id',data.applicant_user_id)}setMsg(`Partner application ${status}.`);load()}
async function assignRequest(id:string,partnerId:string){const {error}=await db.from('service_requests').update({assigned_partner_id:partnerId||null,status:partnerId?'assigned':'new',updated_at:new Date().toISOString()}).eq('id',id);if(error){setMsg(error.message);return}setMsg(partnerId?'Request assigned to partner.':'Assignment removed.');load()}
async function leadStatus(id:string,status:string){const {error}=await db.from('leads').update({status}).eq('id',id);if(error){setMsg(error.message);return}setMsg(`Customer lead marked ${status}.`);load()}
const missingFields=missingVehicleFields(f);
const activeCars=cars.filter(c=>['published','draft'].includes(c.status));
const publishedCars=cars.filter(c=>c.status==='published').length;
const openSales=salesLeads.filter(l=>!['closed','lost','completed'].includes(String(l.status||'new'))).length;
const openServices=requests.filter(r=>!['completed','closed','cancelled'].includes(String(r.status||'new'))).length;
const pendingApprovals=apps.filter(a=>['new','reviewing'].includes(String(a.status||'new'))).length+partnerApps.filter(a=>['new','reviewing'].includes(String(a.status||'new'))).length;
if(accessDenied)return <main><div className="auth"><h1>ROHILLA DRIVE</h1><h2>Administration Console</h2><p>{msg}</p><button onClick={()=>{setAccessDenied(false);setOtpSent(false);setMsg('')}}>Try Another Email</button></div></main>;
if(!session)return <main><div className="auth"><h1>ROHILLA DRIVE</h1><h2>Administration Console</h2><p>New device / signed-out access only. After this, the free Authenticator app is used for Admin unlock.</p>{!otpSent?<form onSubmit={sendOtp}><input name="email" type="email" placeholder="Administrator email" value={otpEmail} onChange={e=>setOtpEmail(e.target.value)} required/><button disabled={mfaBusy}>{mfaBusy?'Sending…':'Send Sign-In Email'}</button></form>:<form onSubmit={verifyEmailOtp}><input autoFocus inputMode="numeric" maxLength={6} placeholder="Email code (if provided)" value={mfaCode} onChange={e=>setMfaCode(e.target.value.replace(/\D/g,'').slice(0,6))}/><button disabled={mfaBusy||mfaCode.length!==6}>{mfaBusy?'Verifying…':'Verify Email Code'}</button><button type="button" className="secondary" onClick={()=>{setOtpSent(false);setMfaCode('');setMsg('')}}>Use Another Email</button></form>}<p>{msg}</p></div></main>;
if(mfaMode==='setup')return <main><div className="auth"><h1>Free Authenticator Setup</h1><p>Scan this QR once in Google Authenticator or Microsoft Authenticator. There is no per-code charge.</p>{mfaData?.totp?.qr_code&&<img src={mfaData.totp.qr_code} alt="Authenticator QR code" style={{width:220,height:220,background:'#fff',padding:12,borderRadius:12}}/>}<input inputMode="numeric" maxLength={6} placeholder="6-digit Authenticator code" value={mfaCode} onChange={e=>setMfaCode(e.target.value.replace(/\D/g,'').slice(0,6))}/><button disabled={mfaBusy||mfaCode.length!==6} onClick={verifySetup}>{mfaBusy?'Verifying…':'Enable Authenticator'}</button><p>{msg}</p></div></main>;
if(mfaMode==='challenge')return <main><div className="auth"><h1>ROHILLA DRIVE</h1><h2>Admin Unlock</h2><p>Enter the free 6-digit code from your Authenticator app.</p><input autoFocus inputMode="numeric" maxLength={6} placeholder="6-digit Authenticator code" value={mfaCode} onChange={e=>setMfaCode(e.target.value.replace(/\D/g,'').slice(0,6))}/><button disabled={mfaBusy||mfaCode.length!==6} onClick={verifyChallenge}>{mfaBusy?'Verifying…':'Unlock Admin'}</button><p>{msg}</p></div></main>;
return <main><header><div className="brand"><b>ROHILLA DRIVE</b><small>Administration Console</small></div><div className="row"><a className="call" href="/admin/verification">Verification Operations</a><button onClick={()=>signOutAdmin()}>Lock Admin</button></div></header>
<section className="section adminDashboardIntro">
 <div className="adminEyebrow">ADMINISTRATION</div>
 <div className="adminDashboardHeading"><div><h1>Operations Dashboard</h1><p>Your fastest actions stay at the top: paste vehicle details, publish inventory and mark sold cars without hunting through menus.</p></div><div className="adminHeaderActions"><a href="#quick-add">Quick Add Vehicle</a><a className="secondaryAction" href="#quick-sold">Mark Vehicle Sold</a></div></div>
 <div className="adminFastDesk">
  <div className="adminFastCard adminFastAdd" id="quick-add"><span>FAST VEHICLE INTAKE</span><h2>Paste full car details</h2><p>Paste the same text you normally send on WhatsApp. Year, KM, fuel, owner, price, brand/model and location are read automatically where possible.</p><textarea rows={5} value={quickText} onChange={e=>setQuickText(e.target.value)} placeholder={"Example:\n2019 Creta EX 1.4 Diesel, 2nd owner, 1.20 lac km, Ambala City, price 6.45 lakh, HR01AB1234, all original"} /><button type="button" onClick={applyQuickDetails}>Auto-Fill Vehicle Details</button>{validationTouched&&missingFields.length>0&&<div className="adminInlineMissing" role="alert"><b>Missing before publish: {missingFields.map(([,label])=>label).join(', ')}</b><p>Fill only these missing details here. No need to scroll down and re-check the full form.</p><div className="adminInlineMissingGrid">{missingFields.map(([key,label])=><label key={key}>{label}<input type={['year','km','owner_count','price'].includes(key)?'number':'text'} value={f[key]||''} onChange={e=>updateVehicleField(key,e.target.value)} placeholder={label}/></label>)}</div></div>}<label className="upload adminQuickPhoto">Vehicle photos<input multiple accept="image/*" type="file" onChange={e=>setFiles(Array.from(e.target.files||[]))}/><span>{files.length?files.length+' photo(s) selected':'Choose photos'}</span></label><AdminVehiclePoster fields={f} photoFile={files[0]||null}/></div>
  <div className="adminFastCard adminFastSold" id="quick-sold"><span>FAST INVENTORY ACTION</span><h2>Close / sell a vehicle</h2><p>Select a live vehicle. You will choose whether it sold through Rohilla Drive or should simply leave active inventory.</p><select value={soldVehicleId} onChange={e=>setSoldVehicleId(e.target.value)}><option value="">Select published vehicle</option>{cars.filter(c=>c.status==='published').map(c=><option key={c.id} value={c.id}>{c.year} {c.brand} {c.model} {c.variant||''}</option>)}</select><button type="button" disabled={!soldVehicleId} onClick={()=>{const car=cars.find(c=>c.id===soldVehicleId);if(car)openSale(car)}}>Close Vehicle</button><a href="/admin/sold">Open Sold History</a></div>
 </div>
 <div className="adminOverviewGrid">
  <a href="/admin/add-vehicle" className="adminOverviewCard"><span>Published Inventory</span><strong>{publishedCars}</strong><small>Live vehicles</small></a>
  <a href="#customer-leads" className="adminOverviewCard"><span>Open Customer Leads</span><strong>{openSales}</strong><small>Needs follow-up</small></a>
  <a href="/admin/service-operations" className="adminOverviewCard"><span>Service Requests</span><strong>{openServices}</strong><small>Active queue</small></a>
  <a href="/admin/partner-kyc" className="adminOverviewCard"><span>Pending Approvals</span><strong>{pendingApprovals}</strong><small>Dealer + partner</small></a>
 </div>
 <div className="adminQuickActions">
  <a href="/admin/seller-submissions"><b>Seller Submissions</b><span>Review cars submitted by customers</span></a>
  <a href="/admin/deal-rooms"><b>Deal Management</b><span>Track active negotiations and handoffs</span></a>
  <a href="/admin/revenue"><b>Revenue & Collections</b><span>Monitor money movement and collections</span></a>
  <a href="/admin/connections"><b>Integrations</b><span>Manage connected business services</span></a>
 </div>
</section>
<section className="section adminVehiclePanel"><div className="adminSectionKicker">READY TO PUBLISH</div><h2>Add Vehicle</h2><p>Paste details above, check the summary, add photos and publish. Open manual details only if something needs correction.</p><form className="adminForm adminFastPublishForm" onSubmit={add}><div className="adminParsedSummary"><div><span>VEHICLE</span><b>{f.brand||'—'} {f.model||''} {f.variant||''}</b></div><div><span>DETAILS</span><b>{f.year||'—'} • {f.km?Number(f.km).toLocaleString('en-IN')+' km':'—'} • {f.fuel||'—'} • {f.owner_count?f.owner_count+' Owner':'—'}</b></div><div><span>PRICE / CITY</span><b>{f.price?'₹'+Number(f.price).toLocaleString('en-IN'):'—'} • {f.city||'—'}</b></div></div><details className="adminManualDetails"><summary>Review / correct parsed details</summary><div className="adminManualGrid"><input placeholder="Brand" value={f.brand||''} onChange={e=>setF({...f,brand:e.target.value})}/><input placeholder="Model" value={f.model||''} onChange={e=>setF({...f,model:e.target.value})}/><input placeholder="Variant" value={f.variant||''} onChange={e=>setF({...f,variant:e.target.value})}/><input type="number" placeholder="Year" value={f.year||''} onChange={e=>setF({...f,year:e.target.value})}/><input type="number" placeholder="KM" value={f.km||''} onChange={e=>setF({...f,km:e.target.value})}/><input placeholder="Fuel" value={f.fuel||''} onChange={e=>setF({...f,fuel:e.target.value})}/><input type="number" placeholder="Owners" value={f.owner_count||''} onChange={e=>setF({...f,owner_count:e.target.value})}/><input type="number" placeholder="Asking Price ₹" value={f.price||''} onChange={e=>setF({...f,price:e.target.value})}/><input placeholder="City" value={f.city||''} onChange={e=>setF({...f,city:e.target.value})}/><input required placeholder="Full registration (kept private; public shows only HR85 / DL01)" value={f.registration_number||''} onChange={e=>setF({...f,registration_number:e.target.value})}/><select value={f.inventory_owner_type||'rohilla_inventory'} onChange={e=>setF({...f,inventory_owner_type:e.target.value})}><option value="rohilla_inventory">Rohilla inventory</option><option value="dealer_inventory">Dealer inventory</option><option value="customer_vehicle">Customer vehicle</option><option value="external_vehicle">External listing</option></select><textarea placeholder="Description / features" value={f.notes||''} onChange={e=>setF({...f,notes:e.target.value})}/></div></details><label className="upload adminPhotoUpload">Add vehicle photos<input required multiple accept="image/*" type="file" onChange={e=>setFiles(Array.from(e.target.files||[]))}/><span>{files.length?files.length+' photo(s) selected':'Choose photos'}</span></label><details className="adminManualDetails"><summary>Interactive customer views (optional) • Engine / Boot / Doors / Video / 360</summary><div className="adminMediaRequirements"><p>Add only real media. A customer button appears only when that media exists. For 360, upload a sequence of real photos around the car; 12–24 photos is recommended.</p><label>Interior <small>{interactiveFiles.interior?.length?'✓ '+interactiveFiles.interior.length+' selected':'Optional'}</small><input type="file" accept="image/*,video/*" onChange={e=>chooseInteractive('interior',Array.from(e.target.files||[]))}/></label><label>Bonnet / Engine <small>{interactiveFiles.engine?.length?'✓ '+interactiveFiles.engine.length+' selected':'Optional'}</small><input type="file" accept="image/*,video/*" onChange={e=>chooseInteractive('engine',Array.from(e.target.files||[]))}/></label><label>Boot / Dicky <small>{interactiveFiles.boot?.length?'✓ '+interactiveFiles.boot.length+' selected':'Optional'}</small><input type="file" accept="image/*,video/*" onChange={e=>chooseInteractive('boot',Array.from(e.target.files||[]))}/></label><label>Driver door open <small>{interactiveFiles.driver_door?.length?'✓ selected':'Optional'}</small><input type="file" accept="image/*" onChange={e=>chooseInteractive('driver_door',Array.from(e.target.files||[]))}/></label><label>Passenger door open <small>{interactiveFiles.passenger_door?.length?'✓ selected':'Optional'}</small><input type="file" accept="image/*" onChange={e=>chooseInteractive('passenger_door',Array.from(e.target.files||[]))}/></label><label>Rear left door open <small>{interactiveFiles.rear_left_door?.length?'✓ selected':'Optional'}</small><input type="file" accept="image/*" onChange={e=>chooseInteractive('rear_left_door',Array.from(e.target.files||[]))}/></label><label>Rear right door open <small>{interactiveFiles.rear_right_door?.length?'✓ selected':'Optional'}</small><input type="file" accept="image/*" onChange={e=>chooseInteractive('rear_right_door',Array.from(e.target.files||[]))}/></label><label>Walkaround video <small>{interactiveFiles.walkaround?.length?'✓ video selected':'Optional'}</small><input type="file" accept="video/*" onChange={e=>chooseInteractive('walkaround',Array.from(e.target.files||[]))}/></label><label>360 spin photos <small>{interactiveFiles.spin_360?.length?interactiveFiles.spin_360.length+' frames selected':'12–24 recommended'}</small><input type="file" multiple accept="image/*" onChange={e=>chooseInteractive('spin_360',Array.from(e.target.files||[]))}/></label></div></details>{duplicateWarning&&<div className="adminDuplicateWarning"><b>Possible duplicate blocked</b><span>{duplicateWarning.year} {duplicateWarning.brand} {duplicateWarning.model} {duplicateWarning.variant||''} • {Number(duplicateWarning.km).toLocaleString('en-IN')} km • ₹{Number(duplicateWarning.asking_price).toLocaleString('en-IN')}</span><div><button type="button" onClick={()=>document.getElementById('inventory-list')?.scrollIntoView({behavior:'smooth'})}>Open Existing Inventory</button><button type="button" className="secondary" onClick={()=>{setAllowDuplicateOnce(true);setDuplicateWarning(null);setMsg('Duplicate override enabled for one publish only. Press Publish again if this is genuinely a different car.')}}>This Is A Different Car</button></div></div>}
{publishing&&<div className="adminPublishProgress" aria-live="polite"><div><b>{publishProgress.stage}</b><span>{publishProgress.total?Math.min(publishProgress.done,publishProgress.total)+' / '+publishProgress.total+' photos':''}</span></div><div className="adminProgressTrack"><i style={{width:`${publishProgress.percent}%`}}/></div><small>Keep this page open. Publish is locked while submission is running.</small></div>}
<button className="adminPublishButton" disabled={publishing}>{publishing?'Submitting… '+publishProgress.percent+'%':'Publish Vehicle Live'}</button></form><p className="adminActionMessage">{msg}</p></section>
<section className="section" id="inventory-list"><div className="adminSectionTitleRow"><h2>Active Inventory ({activeCars.length})</h2><a className="call" href="/admin/sold">Sold History →</a></div>{activeCars.length===0?<p>No active vehicles.</p>:<div className="grid">{activeCars.map(c=><article className="card" key={c.id}><div className="photo real">{c.vehicle_photos?.[0]?.url&&<img src={c.vehicle_photos[0].url}/>}</div><div className="body"><h3>{c.brand} {c.model} {c.variant}</h3><p>{c.year} • {c.km} km • {c.city}{c.registration_prefix?` • ${c.registration_prefix}`:''}</p><strong>₹{Number(c.asking_price).toLocaleString('en-IN')}</strong><small>{c.vehicle_photos?.length||0} photos • {c.status}</small><div className="row"><button onClick={()=>startEdit(c)}>Edit</button>{c.status==='published'?<button onClick={()=>openSale(c)}>Close / Sold</button>:<button onClick={()=>status(c.id,'published')}>Publish</button>}</div></div></article>)}</div>}</section>
{editing&&<div className="overlay"><div className="modal"><button className="x" onClick={()=>setEditing(null)} aria-label="Close editor">×</button><h2>Edit Vehicle</h2><form className="adminForm" onSubmit={saveEdit}><input required value={editing.brand||''} onChange={e=>setEditing({...editing,brand:e.target.value})} placeholder="Brand"/><input required value={editing.model||''} onChange={e=>setEditing({...editing,model:e.target.value})} placeholder="Model"/><input value={editing.variant||''} onChange={e=>setEditing({...editing,variant:e.target.value})} placeholder="Variant"/><input required type="number" value={editing.year||''} onChange={e=>setEditing({...editing,year:e.target.value})} placeholder="Year"/><input required type="number" value={editing.km||''} onChange={e=>setEditing({...editing,km:e.target.value})} placeholder="KM"/><input required value={editing.fuel||''} onChange={e=>setEditing({...editing,fuel:e.target.value})} placeholder="Fuel"/><input required type="number" value={editing.owner_count||''} onChange={e=>setEditing({...editing,owner_count:e.target.value})} placeholder="Owners"/><input required type="number" value={editing.asking_price||''} onChange={e=>setEditing({...editing,asking_price:e.target.value})} placeholder="Asking Price ₹"/><input required value={editing.city||''} onChange={e=>setEditing({...editing,city:e.target.value})} placeholder="City"/><textarea value={editing.public_notes||''} onChange={e=>setEditing({...editing,public_notes:e.target.value})} placeholder="Description / features"/><select value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived / Removed</option></select><div className="photoStrip">{(editing.vehicle_photos||[]).sort((a:any,b:any)=>a.sort_order-b.sort_order).map((p:any)=><div key={p.id} className="thumb"><img src={p.url}/><button type="button" onClick={()=>deletePhoto(p)}>Delete</button></div>)}</div><label className="upload">Add more photos<input multiple accept="image/*" type="file" onChange={e=>setEditFiles(Array.from(e.target.files||[]))}/></label><button>Save Changes</button></form><p>{msg}</p></div></div>}
{saleVehicle&&<div className="overlay"><div className="modal adminSaleModal"><button className="x" onClick={()=>setSaleVehicle(null)} aria-label="Close sale dialog">×</button><div className="adminSectionKicker">CLOSE INVENTORY</div><h2>{saleVehicle.year} {saleVehicle.brand} {saleVehicle.model}</h2><p>Only vehicles sold by / through Rohilla Drive are kept in Sold History.</p><label>Whose inventory?</label><select value={saleForm.inventory_owner_type} onChange={e=>setSaleForm({...saleForm,inventory_owner_type:e.target.value})}><option value="rohilla_inventory">Our / Rohilla inventory</option><option value="dealer_inventory">Dealer inventory</option><option value="customer_vehicle">Customer vehicle</option><option value="external_vehicle">External listing</option></select><label>What happened?</label><select value={saleForm.sale_outcome} onChange={e=>setSaleForm({...saleForm,sale_outcome:e.target.value})}><option value="sold_by_rohilla">Sold by Rohilla Drive</option><option value="sold_through_rohilla">Sold through Rohilla Drive</option><option value="sold_elsewhere">Sold elsewhere</option><option value="removed">Remove / withdraw listing</option></select><textarea placeholder="Optional sale / removal note" value={saleForm.sold_notes} onChange={e=>setSaleForm({...saleForm,sold_notes:e.target.value})}/><button onClick={confirmSale}>{['sold_by_rohilla','sold_through_rohilla'].includes(saleForm.sale_outcome)?'Move to Sold History':'Remove from Active Inventory'}</button></div></div>}
<section className="section" id="customer-leads"><h2>Customer Sales, New Vehicle & Listing Leads ({salesLeads.length})</h2>{salesLeads.length===0?<p>No website sales or listing leads yet.</p>:salesLeads.map(l=><article className="application" key={l.id}><b>{String(l.enquiry_type||l.requirement||'Customer enquiry').replaceAll('_',' ')}</b><p>{l.customer_name||'Customer'} • {l.customer_phone||'No phone'} • {l.new_or_used||'vehicle'}</p><p>{l.message||l.requirement||'—'}</p><small>Source: {l.source||'website'} • Status: {l.status||'new'}</small><div className="row"><button onClick={()=>leadStatus(l.id,'contacted')}>Contacted</button><button onClick={()=>leadStatus(l.id,'qualified')}>Qualified</button><button onClick={()=>leadStatus(l.id,'closed')}>Closed</button></div></article>)}</section>
<section className="section"><h2>Dealer Applications ({apps.length})</h2>{apps.length===0?<p>No dealer applications yet.</p>:apps.map(a=><article className="application" key={a.id}><b>{a.business_name}</b><p>{a.contact_name} • {a.mobile} • {a.city} • approx {a.inventory_count||0} vehicles</p><p>{a.services}</p><small>Status: {a.status}</small><div><button onClick={()=>appStatus(a.id,'reviewing')}>Reviewing</button><button onClick={()=>appStatus(a.id,'approved')}>Approve</button><button onClick={()=>appStatus(a.id,'rejected')}>Reject</button></div></article>)}</section>
<section className="section"><h2>Partner Applications ({partnerApps.length})</h2>{partnerApps.length===0?<p>No partner applications yet.</p>:partnerApps.map(a=><article className="application" key={a.id}><b>{a.business_name||'ROHILLA DRIVE Partner'}</b><p>{a.contact} • {a.city} • {a.category}</p><p>{a.message||'—'}</p><small>Status: {a.status}</small><div><button onClick={()=>partnerStatus(a.id,'reviewing')}>Reviewing</button><button onClick={()=>partnerStatus(a.id,'approved')}>Approve</button><button onClick={()=>partnerStatus(a.id,'rejected')}>Reject</button></div></article>)}</section>
<section className="section"><h2>Customer Service Requests ({requests.length})</h2>{requests.length===0?<p>No customer service requests yet.</p>:requests.map(r=><article className="application" key={r.id}><b>{r.category}</b><p>{r.customer_name} • {r.customer_phone} • {r.customer_location||'Location not given'}</p>{r.vehicle&&<p>Vehicle: {r.vehicle.brand} {r.vehicle.model} {r.vehicle.variant||''} {r.vehicle.year||''}</p>}<p>{r.details||'—'}{r.preferred_time?` • Preferred: ${r.preferred_time}`:''}</p><small>Status: {r.status}{r.assigned_partner_id?' • Partner assigned':''}</small><div><select value={r.assigned_partner_id||''} onChange={e=>assignRequest(r.id,e.target.value)}><option value="">{r.assigned_partner_id?'Remove assignment':'Assign Partner'}</option>{partners.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.business_name||p.name||'Partner'} • {p.city||'Area'} • {p.service_categories||'Service'}</option>)}</select></div></article>)}</section>
<section className="section"><h2>Social Publishing Queue</h2><p>Website publishing is independent from social delivery. Instagram/Facebook/YouTube queue records can be created, while automatic external posting still requires the official platform API/OAuth connections.</p></section></main>}
