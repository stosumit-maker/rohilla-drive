import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://abdtbnrktpdvnrswmaik.supabase.co'
const SUPABASE_KEY = 'sb_publishable_c_yH8BDakHeeu1jYTgnGWA_YAr8ZXve'

export function supabase(){
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}
