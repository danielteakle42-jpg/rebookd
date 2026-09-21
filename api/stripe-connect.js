import Stripe from 'stripe';
import {admin,authedUser,json} from './_lib.js';
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY||'');
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});if(!process.env.STRIPE_SECRET_KEY)return json(res,503,{error:'Stripe is not configured'});
 const user=await authedUser(req);if(!user)return json(res,401,{error:'Unauthorized'});const {business_id}=req.body||{};const db=admin();
 const {data:b}=await db.from('businesses').select('*').eq('id',business_id).eq('owner_id',user.id).single();if(!b)return json(res,404,{error:'Business not found'});
 let account=b.stripe_account_id;if(!account){const a=await stripe.accounts.create({type:'express',country:b.country_code||'GB',email:b.email||user.email,capabilities:{card_payments:{requested:true},transfers:{requested:true}},business_profile:{name:b.name}});account=a.id;await db.from('businesses').update({stripe_account_id:account}).eq('id',b.id)}
 const origin=req.headers.origin||process.env.APP_URL;const link=await stripe.accountLinks.create({account,refresh_url:`${origin}/?stripe=refresh`,return_url:`${origin}/?stripe=return`,type:'account_onboarding'});return json(res,200,{url:link.url});
}
