import { NextResponse } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Service Role Key to bypass RLS for server-side operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const { deckId, userId } = await req.json();

        if (!deckId || !userId) {
            return NextResponse.json({ error: 'Missing deckId or userId' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('challenges')
            .insert({
                deck_id: deckId,
                creator_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating challenge:', error);
            return NextResponse.json({ error: error.message || 'Failed to create challenge', details: error }, { status: 500 });
        }

        return NextResponse.json({ challengeId: data.id });
    } catch (e) {
        console.error('Server error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
