import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkjcgrwztyhcsyxlajia.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_hDVzss_qaBJt2oomigdykw_hawRjenT';

export const supabase = createClient(supabaseUrl, supabaseKey);

