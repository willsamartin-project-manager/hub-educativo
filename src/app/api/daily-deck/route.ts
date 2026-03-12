import { model } from '@/lib/gemini';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    try {
        // 1. Determine "Today" (Brasilia Time approx or UTC)
        // For simplicity, we use UTC date part. 
        // Improvement: Use 'pt-BR' locale if we want strictly Brazilian days.
        const today = new Date().toISOString().split('T')[0];

        // 2. Check if daily deck exists
        const { data: existingDeck, error: fetchError } = await supabase
            .from('decks')
            .select('*')
            .eq('is_daily', true)
            .eq('daily_date', today)
            .maybeSingle();

        if (fetchError) {
            console.error('Error fetching daily deck:', fetchError);
        }

        if (existingDeck) {
            return NextResponse.json(existingDeck);
        }

        // 3. Generate content if not exists
        // Step A: Get Topic (Try Search First)
        let topic = "Curiosidades Gerais";

        try {
            const { searchModel } = await import('@/lib/gemini');

            const searchPrompt = `
                Hoje é dia ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.
                
                Use a PESQUISA DO GOOGLE para encontrar o que está em alta no Brasil AGORA (últimas 24-48 horas).
                Procure por "Trending Topics Brasil", "Notícias mais lidas hoje", "Assuntos do momento".

                Escolha UM tema que seja:
                1. Atual (aconteceu ontem ou hoje).
                2. Educativo ou Curioso (evite fofocas puras ou crimes violentos).
                3. Tenha potencial para um quiz divertido.

                Responda APENAS com o título do assunto (máximo 6 palavras).
            `;

            console.log('Attempting to fetch trending topic with Grounding...');
            const topicResult = await searchModel.generateContent(searchPrompt);
            const topicText = await topicResult.response.text();
            topic = topicText.trim().replace(/\*/g, '').replace(/"/g, '');
            console.log('Grounding Success! Topic:', topic);

        } catch (searchError) {
            console.warn('Grounding/Search failed or disabled. Falling back to standard generation.', searchError);

            // FALLBACK PROMPT
            const fallbackPrompt = `
                Hoje é dia ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}.
                Escolha um tema interessante para um "Quiz do Dia".
                
                Opções:
                1. Evento histórico deste dia.
                2. Curiosidade científica atemporal.
                3. Conhecimentos gerais.

                Responda APENAS com o título do assunto (máximo 6 palavras).
            `;

            try {
                const fallbackResult = await model.generateContent(fallbackPrompt);
                topic = (await fallbackResult.response.text()).trim().replace(/\*/g, '').replace(/"/g, '');
            } catch (fallbackError) {
                console.error('All topic generation failed.', fallbackError);
                topic = "Curiosidades do Mundo";
            }
        }

        // Step B: Generate Questions
        const quizPrompt = `
            Crie um quiz educativo e divertido sobre: "${topic}".
            Nível: Conhecimento Geral / Variedades.
            
            Retorne APENAS um JSON válido seguindo exatamente este formato:
            [
                {
                    "id": "1",
                    "text": "Texto da pergunta?",
                    "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
                    "correctIndex": 0,
                    "difficulty": "medium",
                    "explanation": "Explicação curta."
                }
            ]
            Regras:
            - Exatamente 7 perguntas.
            - Misture dificuldades.
        `;

        const quizResult = await model.generateContent(quizPrompt);
        const quizText = await quizResult.response.text();
        const jsonStr = quizText.replace(/```json/g, '').replace(/```/g, '').trim();
        let questions = [];

        try {
            questions = JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse quiz JSON:', quizText);
            return NextResponse.json({ error: 'Failed to generate valid quiz' }, { status: 500 });
        }

        // Add unique IDs
        questions = questions.map((q: any, i: number) => ({
            ...q,
            id: `daily-${today}-${i}`
        }));

        // 4. Insert into DB
        // owner_id is null (requires migration_v3)
        const newDeck = {
            owner_id: null,
            title: `Desafio do Dia: ${topic}`,
            subject: 'Desafio Diário',
            grade: 'Geral',
            questions: questions,
            is_daily: true,
            daily_date: today,
            cost: 0
        };

        const { data, error: insertError } = await supabase
            .from('decks')
            .insert(newDeck)
            .select()
            .single();

        if (insertError) {
            // Handle race condition: if 2 requests came at once, one might adhere to unique constraint
            // We verify if it was a unique violation
            if (insertError.code === '23505') { // unique_violation
                const { data: retryDeck } = await supabase
                    .from('decks')
                    .select('*')
                    .eq('is_daily', true)
                    .eq('daily_date', today)
                    .maybeSingle();
                return NextResponse.json(retryDeck);
            }
            throw new Error(`DB Insert Error: ${insertError.message}`);
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Daily Deck API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
