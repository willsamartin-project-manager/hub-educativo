import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        // 1. Fetch Challenge Details & Linked Deck
        const { data: challenge, error: challengeError } = await supabase
            .from('challenges')
            .select(`
                *,
                creator:profiles!creator_id(full_name, avatar_url),
                deck:decks!deck_id(*)
            `)
            .eq('id', id)
            .single();

        if (challengeError || !challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        // 2. Fetch Leaderboard (Matches linked to this challenge)
        const { data: matches, error: matchesError } = await supabase
            .from('matches')
            .select(`
                score,
                user:profiles!user_id(full_name, avatar_url),
                created_at
            `)
            .eq('challenge_id', id)
            .order('score', { ascending: false });

        if (matchesError) {
            console.error('Error fetching leaderboard:', matchesError);
        }

        return NextResponse.json({
            challenge,
            leaderboard: matches || []
        });

    } catch (e) {
        console.error('Server error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
