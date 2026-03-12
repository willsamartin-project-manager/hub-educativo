const { MercadoPagoConfig, Payment } = require('mercadopago');

// NEW Account: Vendedor Novo (APP_USR)
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-2036468037985758-031121-b1194d9b3f0b9a2b0a3e10a39ed39c2a-3260785361' });

async function testPayment() {
    try {
        console.log("Attempting to create PIX with Brand New Sandbox Vendedor + Old Sandbox Comprador...");
        const payment = new Payment(client);

        const paymentData = {
            body: {
                transaction_amount: 1.00,
                description: 'Sandbox Verification PIX - New Account',
                payment_method_id: 'pix',
                payer: {
                    // EXACT email of the Comprador Sandbox account
                    email: 'TESTUSER2898912127727008163@testuser.com',
                    first_name: 'Comprador',
                    last_name: 'Teste',
                    identification: {
                        type: 'CPF',
                        number: '19119119100' // Generic valid CPF
                    }
                }
            },
            requestOptions: { idempotencyKey: 'verify3_' + Date.now() }
        };

        const response = await payment.create(paymentData);
        console.log('✅ SUCCESS! PIX Generated.');
        console.log('QR Code:', response.point_of_interaction?.transaction_data?.qr_code);
    } catch (error) {
        console.error('❌ FAILED:');
        console.error(error.message);
        if (error.cause) {
            console.error(JSON.stringify(error.cause, null, 2));
        }
    }
}

testPayment();
