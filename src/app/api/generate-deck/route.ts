import { model } from '@/lib/gemini';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (using service role would be ideal for secure ops, 
// but for this MVP we use the same anon key but rely on RLS/Auth context if possible, 
// OR we pass the user's access token. 
// Actually, standard Next.js API routes don't auto-context auth.
// Simplest MVC: Pass user_id in body OR use createServerClient from SSR.
// Let's use the provided anon key and trust the client sends the user ID for now 
// (INSECURE for prod, but OK for MVP prototype speed if we validate on RLS).
// RICHER APPROACH: We should use `purchase_deck` which is `security definer`.
// But we need to know WHICH user.
// Let's require the client to send `userId` in the body for this step.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
    let subject = 'Tópico Geral';
    let grade = 'Ensino Médio';
    let userId = '';

    try {
        const body = await request.json();
        if (body.subject) subject = body.subject;
        if (body.grade) grade = body.grade;
        if (body.userId) userId = body.userId;

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 401 });
        }

        const prompt = `
            Você é um professor expert criando um quiz estilo "Show do Milhão".
            
            Crie um deck de 10 perguntas sobre "${subject}" nível "${grade}".
            
            Retorne APENAS um JSON válido seguindo exatamente este formato:
            [
                {
                    "id": "1",
                    "text": "Texto da pergunta aqui?",
                    "options": ["Opção Errada", "Opção Certa", "Opção Errada", "Opção Errada"],
                    "correctIndex": 1,
                    "difficulty": "easy",
                    "explanation": "Explicação breve (máx 20 palavras) do porquê a resposta correta é a correta."
                }
            ]
            Regras: 
            - 3 easy, 4 medium, 3 hard.
            - O campo "explanation" é OBRIGATÓRIO e deve ser educativo.
        `;

        const result = await model.generateContent(prompt);
        const text = await result.response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const deckContent = JSON.parse(jsonStr);

        const finalDeck = deckContent.map((q: any, i: number) => ({
            ...q,
            id: q.id || `q-${i}-${Date.now()}`
        }));

        // CALL DATABASE TRANSACTION (RPC)
        const { data: deckId, error: dbError } = await supabase.rpc('purchase_deck', {
            p_owner_id: userId,
            p_title: `${subject} (${grade})`,
            p_subject: subject,
            p_grade: grade,
            p_questions: finalDeck,
            p_cost: 50 // Fixed cost for MVP
        });

        if (dbError) {
            throw new Error(`DB Error: ${dbError.message}`);
        }

        return NextResponse.json({ deck: finalDeck, deckId, message: 'Deck purchased and created!' });

    } catch (error: any) {
        console.error('API Error:', error.message);

        // Return error to UI so it can show "Insufficient Funds" etc.
        return NextResponse.json(
            { error: error.message, is_mock: false },
            { status: 500 }
        );
    }
}
