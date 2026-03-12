
import { Payment, MercadoPagoConfig } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    // Initialize clients INSIDE the handler
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const client = new MercadoPagoConfig({ accessToken: mpAccessToken });

    try {
        const url = new URL(req.url);
        const topic = url.searchParams.get('topic') || url.searchParams.get('type');
        const id = url.searchParams.get('id') || url.searchParams.get('data.id');

        if (!id) {
            // Some notifications come in JSON body
            const body = await req.json().catch(() => ({}));
            if (body.data?.id) {
                return handlePayment(body.data.id, client, supabase);
            }
            return NextResponse.json({ message: 'No ID found' }, { status: 200 });
        }

        if (topic === 'payment' || topic === 'merchant_order') {
            return await handlePayment(id, client, supabase);
        }

        return NextResponse.json({ message: 'Ignored' }, { status: 200 });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function handlePayment(paymentId: string, client: any, supabase: any) {
    console.log('Checking payment:', paymentId);

    // 1. Verify with Mercado Pago
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    if (!paymentData) {
        throw new Error('Payment not found in Mercado Pago');
    }

    const { status, external_reference: userId, transaction_amount } = paymentData;

    // 2. Update Transaction in DB
    const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('provider_id', paymentId.toString()) // Or external_ref if provider_id wasn't saved yet? 
        // Actually, we inserted provider_id at create. ideally we query by it.
        // If create didn't finish before webhook (rare but possible), we might miss it if we strictly match provider_id.
        // But for PIX, creation happens first.
        .maybeSingle();

    // If not found by provider_id, maybe try by user_id + pending? (Risk of collision)
    // For now, let's assume provider_id was saved.

    if (paymentData.status === 'approved') {
        const coinsMap: Record<number, number> = {
            10: 100,
            25: 300,
            50: 700
        };
        const coinsToAdd = coinsMap[Number(transaction_amount)] || Math.floor(Number(transaction_amount) * 10);

        // Check if already processed
        if (transaction && transaction.status === 'approved') {
            return NextResponse.json({ message: 'Already processed' }, { status: 200 });
        }

        // 3. Add Coins (RPC)
        const { error: rpcError } = await supabase.rpc('add_coins', {
            user_id: userId,
            coins_to_add: coinsToAdd
        });

        if (rpcError) {
            console.error('Failed to add coins:', rpcError);
            // Even if coin add failed, we might want to log it but not fail the webhook to avoid MP retrying forever?
            // But strict consistency says fail 500 so MP retries.
            return NextResponse.json({ error: 'Failed to add coins' }, { status: 500 });
        }

        // 4. Update Transaction Status
        // We do this AFTER adding coins to ensure we don't mark as done if coin add failed (though RPC is atomic usually)
        if (transaction) {
            await supabase
                .from('transactions')
                .update({ status: 'approved' })
                .eq('id', transaction.id);
        } else {
            // Fallback: Create interaction if it didn't exist (e.g. came from outside app?)
            // Not likely in this flow.
            console.warn('Transaction not found in DB for approved payment:', paymentId);
        }
    } else {
        // Update status (rejected, pending, etc)
        if (transaction) {
            await supabase
                .from('transactions')
                .update({ status: status })
                .eq('id', transaction.id);
        }
    }

    return NextResponse.json({ message: 'OK', status: status });
}
