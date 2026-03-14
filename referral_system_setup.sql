-- Adicionar colunas para o sistema de indicação
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

-- Função para gerar um código de indicação aleatório
CREATE OR REPLACE FUNCTION generate_referral_code() 
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função ultra-robusta para criação de perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger as $$
DECLARE
  v_referrer_id UUID;
  v_ref_code TEXT;
  v_full_name TEXT;
  v_grade TEXT;
  v_raw_referral TEXT;
BEGIN
  -- 1. Gerar um novo código de indicação (com loop simples para evitar colisão rara)
  LOOP
    v_ref_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = v_ref_code);
  END LOOP;

  -- 2. Extrair metadados com segurança máxima
  BEGIN
    v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', 'Estudante');
    v_grade := COALESCE(new.raw_user_meta_data->>'grade', 'Ensino Médio');
    v_raw_referral := NULLIF(TRIM(new.raw_user_meta_data->>'referral_code'), '');
  EXCEPTION WHEN OTHERS THEN
    v_full_name := 'Estudante';
    v_grade := 'Ensino Médio';
    v_raw_referral := NULL;
  END;

  -- 3. Tentar processar a indicação (se houver)
  IF v_raw_referral IS NOT NULL THEN
    BEGIN
      SELECT id INTO v_referrer_id FROM public.profiles 
      WHERE referral_code = v_raw_referral;
      
      IF v_referrer_id IS NOT NULL THEN
        -- Tentar dar o bônus para o indicador (em bloco separado para não quebrar o cadastro se falhar)
        BEGIN
          UPDATE public.profiles SET coins = coins + 50 WHERE id = v_referrer_id;
        EXCEPTION WHEN OTHERS THEN
          -- Se falhar o bônus, apenas ignoramos e prosseguimos
          RAISE WARNING 'Falha ao dar bônus para o indicador %', v_referrer_id;
        END;

        -- Tentar inserir o novo perfil com bônus
        BEGIN
          INSERT INTO public.profiles (id, full_name, grade, coins, referral_code, referred_by)
          VALUES (new.id, v_full_name, v_grade, 550, v_ref_code, v_referrer_id);
          RETURN new;
        EXCEPTION WHEN OTHERS THEN
          -- Se falhar a inserção com bônus, deixamos cair no fallback abaixo
          RAISE WARNING 'Falha ao inserir perfil com bônus para %: %', new.id, SQLERRM;
        END;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erro geral no processamento de referral para %: %', new.id, SQLERRM;
    END;
  END IF;

  -- 4. Inserção de Fallback (Sempre tentamos esta se nada acima retornou)
  BEGIN
    INSERT INTO public.profiles (id, full_name, grade, coins, referral_code)
    VALUES (new.id, v_full_name, v_grade, 500, v_ref_code)
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      grade = EXCLUDED.grade;
  EXCEPTION WHEN OTHERS THEN
    -- Última instância: se nem o fallback funcionar, pelo menos não quebramos o Auth
    -- Assim o usuário é criado no Auth.users mas fica sem profile (corrigível via backfill)
    RAISE WARNING 'CRITICAL: Falha total ao criar perfil para %: %', new.id, SQLERRM;
  END;

  RETURN new;
END;
$$ language plpgsql security definer;

-- Gerar códigos para usuários atuais que ainda não tem
UPDATE public.profiles SET referral_code = generate_referral_code() WHERE referral_code IS NULL;
