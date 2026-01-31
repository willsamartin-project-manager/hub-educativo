import { Suspense } from 'react';
import ChallengeClient from './ChallengeClient';
import { Loader2 } from 'lucide-react';

export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>}>
            <ChallengeClient id={id} />
        </Suspense>
    );
}
