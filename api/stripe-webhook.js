import Stripe from 'stripe';
import {admin,json} from './_lib.js';
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY||'');
export const config={api:{bodyParser:false}};
async function raw(req){const chunks=[];for await(const c of req)chunks.push(c);return Buffer.concat(chunks)}
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});if(!process.env.STRIPE_WEBHOOK_SECRET)return json(res,503,{error:'Webhook secret missing'});
 let event;try{event=stripe.webhooks.constructEvent(await raw(req),req.headers['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET)}catch(e){return json(res,400,{error:e.message})}
 const db=admin();await db.from('payment_events').upsert({provider:'stripe',provider_event_id:event.id,event_type:event.type,payload:event,processed_at:new Date().toISOString()},{onConflict:'provider_event_id'});
 if(event.type==='checkout.session.completed'){const s=event.data.object;const id=s.metadata?.booking_id;if(id){await db.from('bookings').update({status:'confirmed',payment_provider:'stripe',payment_intent_id:String(s.payment_intent||''),payment_status:'paid'}).eq('id',id);const {data:b}=await db.from('bookings').select('customer_id,business_id').eq('id',id).single();if(b){await db.from('notifications').insert([{user_id:b.customer_id,type:'booking_confirmed',title:'Booking confirmed',body:'Your Rebookd booking is confirmed.',data:{booking_id:id}},{user_id:(await db.from('businesses').select('owner_id').eq('id',b.business_id).single()).data?.owner_id,type:'new_booking',title:'New booking',body:'You have a new confirmed Rebookd booking.',data:{booking_id:id}}])}}}
 if(event.type==='account.updated'){const a=event.data.object;await db.from('businesses').update({payouts_enabled:Boolean(a.charges_enabled&&a.payouts_enabled)}).eq('stripe_account_id',a.id)}
 return json(res,200,{received:true});
}
