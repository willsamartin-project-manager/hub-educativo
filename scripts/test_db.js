const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function runDiagnostics() {
    const testEmail = `debug_${Date.now()}@hub-edu.com`;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: 'TestPassword123!',
        email_confirm: true,
        user_metadata: { full_name: 'Bot', grade: 'Ensino Médio', referral_code: '' }
    });

    if (authError) {
        console.error("❌ ERRO NO AUTH:", JSON.stringify(authError, null, 2));
    } else {
        const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', authData.user.id).single();
        if (error) {
            console.error("❌ O TRIGGER FALHOU!", JSON.stringify(error, null, 2));
        } else {
            console.log("✅ TRIGGER FUNCIONOU!");
        }
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    }
}

runDiagnostics();
