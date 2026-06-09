import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bsqrkuwjvobejxosxgpx.supabase.co'
const SUPABASE_ANON = 'sb_publishable_hrNp8YrwqANRCgGp3aqn7g_nfujoX6-'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
