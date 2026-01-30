import { Payment, MercadoPagoConfig } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// BYPASS SSL CHECK (Local Dev / Corporate Proxy Fix)
if (process.env.NODE_ENV === 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const supabase = createClient(supabaseUrl, supabaseKey);

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function POST(req: Request) {
    try {
        const { packageId, amount, userId, email, firstName } = await req.json();

        // 1. Create Payment in Mercado Pago
        const payment = new Payment(client);

        const idempotencyKey = `pay_${userId}_${Date.now()}`;

        const paymentData = {
            body: {
                transaction_amount: Number(amount),
                description: `Moedas Hub Educativo - Pack ${packageId}`,
                payment_method_id: 'pix',
                payer: {
                    email: email || 'user@hubeducativo.com', // MP requires email
                    first_name: firstName || 'User',
                },
                external_reference: userId, // Useful to track who bought
                notification_url: `https://hub-educativo.vercel.app/api/payment/webhook` // REPLACE WITH YOUR VERCEL URL
            },
            requestOptions: { idempotencyKey }
        };

        const result = await payment.create(paymentData);

        if (!result) {
            throw new Error('Failed to create payment with Mercado Pago');
        }

        // 2. Save Transaction to DB
        // Determine coins based on amount (Primitive protection)
        // Ideally look up packageId in DB, but for MVP:
        const coinsMap: Record<number, number> = {
            10: 100,
            25: 300,
            50: 700
        };
        const coins = coinsMap[Number(amount)] || Math.floor(Number(amount) * 10);

        const { error: dbError } = await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                amount: amount,
                coins: coins,
                status: 'pending',
                provider_id: result.id?.toString(),
                qr_code: result.point_of_interaction?.transaction_data?.qr_code,
                qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64
            });

        if (dbError) {
            console.error('DB Insert Error:', dbError);
            // We proceed returning the QR Code, but this is a critical log
        }

        return NextResponse.json({
            id: result.id,
            qr_code: result.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
            ticket_url: result.point_of_interaction?.transaction_data?.ticket_url
        });

    } catch (error: any) {
        console.error('Payment Creation Error FULL:', error);
        if (error.cause) console.error('Cause:', error.cause);
        return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }
}
