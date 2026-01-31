import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { challengeId, userId, deckId, maxScore } = body;

        if (!challengeId || !userId || !deckId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Check if user already has a match for this challenge
        // We don't want to reset score if they are re-entering
        const { data: existingMatch } = await supabase
            .from('matches')
            .select('id')
            .eq('challenge_id', challengeId)
            .eq('user_id', userId)
            .single();

        if (existingMatch) {
            // Already joined/played. Do nothing.
            return NextResponse.json({ success: true, matchId: existingMatch.id, status: 'existing' });
        }

        // 2. Create a "Pending" Match Record
        // Score 0 indicates they started.
        // We can add a 'status' column later if needed, but for now existence = participation.
        const { data, error } = await supabase
            .from('matches')
            .insert({
                challenge_id: challengeId,
                user_id: userId,
                deck_id: deckId,
                score: 0,
                max_score: maxScore || 0,
                played_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Join Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, matchId: data.id, status: 'new' });

    } catch (e: any) {
        console.error('Server error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
