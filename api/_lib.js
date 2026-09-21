import {createClient} from '@supabase/supabase-js';
export const SUPABASE_URL=process.env.SUPABASE_URL;
export const SERVICE_KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
export const admin=()=>createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false}});
export async function authedUser(req){const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');if(!token)return null;const {data,error}=await admin().auth.getUser(token);if(error)return null;return data.user}
export function json(res,status,body){res.status(status).setHeader('Content-Type','application/json');res.end(JSON.stringify(body))}
