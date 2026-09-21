import Stripe from 'stripe';
import {admin,authedUser,json} from './_lib.js';
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY||'');
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 if(!process.env.STRIPE_SECRET_KEY)return json(res,503,{error:'Stripe is not configured'});
 const user=await authedUser(req);if(!user)return json(res,401,{error:'Unauthorized'});
 const {booking_id}=req.body||{};const db=admin();
 const {data:b,error}=await db.from('bookings').select('*,services(name),businesses(name,stripe_account_id,payouts_enabled)').eq('id',booking_id).eq('customer_id',user.id).single();
 if(error||!b)return json(res,404,{error:'Booking not found'});if(b.payment_status==='paid')return json(res,409,{error:'Already paid'});
 if(!b.businesses?.stripe_account_id||!b.businesses?.payouts_enabled)return json(res,409,{error:'Business payout account is not ready'});
 const session=await stripe.checkout.sessions.create({mode:'payment',success_url:`${req.headers.origin||process.env.APP_URL}/?payment=success&booking=${b.id}`,cancel_url:`${req.headers.origin||process.env.APP_URL}/?payment=cancelled&booking=${b.id}`,customer_email:user.email,line_items:[{quantity:1,price_data:{currency:b.currency.toLowerCase(),unit_amount:b.amount_cents,product_data:{name:b.services?.name||'Rebookd booking',description:b.businesses?.name||'Rebookd'}}}],metadata:{booking_id:b.id},payment_intent_data:{application_fee_amount:b.platform_fee_cents,transfer_data:{destination:b.businesses.stripe_account_id},metadata:{booking_id:b.id}}});
 return json(res,200,{url:session.url});
}
