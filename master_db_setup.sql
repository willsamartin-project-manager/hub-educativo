-- MASTER DB SETUP - HUB EDUCATIVO
-- Execute este script no SQL Editor do seu Supabase para garantir que tudo esteja configurado corretamente.

-- 1. Garantir que todas as colunas necessárias existam na tabela profiles
DO $$
BEGIN
    -- Coluna is_admin
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;

    -- Coluna referral_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referral_code') THEN
        ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;
    END IF;

    -- Coluna referred_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referred_by') THEN
        ALTER TABLE public.profiles ADD COLUMN referred_by UUID REFERENCES auth.users(id);
    END IF;

    -- Garantir que a coluna grade existe (base do schema original)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'grade') THEN
        ALTER TABLE public.profiles ADD COLUMN grade TEXT;
    END IF;
END $$;

-- 2. Função para gerar um código de indicação aleatório
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

-- 3. Função ultra-robusta para criação de perfil ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger as $$
DECLARE
  v_referrer_id UUID;
  v_ref_code TEXT;
  v_full_name TEXT;
  v_grade TEXT;
  v_raw_referral TEXT;
BEGIN
  -- A. Gerar um novo código de indicação único
  LOOP
    v_ref_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = v_ref_code);
  END LOOP;

  -- B. Extrair metadados com segurança máxima
  BEGIN
    v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', 'Estudante');
    v_grade := COALESCE(new.raw_user_meta_data->>'grade', 'Ensino Médio');
    v_raw_referral := NULLIF(TRIM(new.raw_user_meta_data->>'referral_code'), '');
  EXCEPTION WHEN OTHERS THEN
    v_full_name := 'Estudante';
    v_grade := 'Ensino Médio';
    v_raw_referral := NULL;
  END;

  -- C. Tentar processar a indicação com bônus
  IF v_raw_referral IS NOT NULL THEN
    BEGIN
      SELECT id INTO v_referrer_id FROM public.profiles 
      WHERE referral_code = v_raw_referral;
      
      IF v_referrer_id IS NOT NULL THEN
        -- Bônus para o indicador
        BEGIN
          UPDATE public.profiles SET coins = coins + 50 WHERE id = v_referrer_id;
        EXCEPTION WHEN OTHERS THEN
          -- Se falhar o bônus, apenas ignoramos
          RAISE WARNING 'Falha ao dar bônus para o indicador %', v_referrer_id;
        END;

        -- Inserir o novo perfil com bônus (500 + 50)
        BEGIN
          INSERT INTO public.profiles (id, full_name, grade, coins, referral_code, referred_by)
          VALUES (new.id, v_full_name, v_grade, 550, v_ref_code, v_referrer_id);
          RETURN new;
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Falha ao inserir perfil com bônus para %: %', new.id, SQLERRM;
        END;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erro geral no processamento de referral para %: %', new.id, SQLERRM;
    END;
  END IF;

  -- D. Inserção de Fallback (Padrão)
  BEGIN
    INSERT INTO public.profiles (id, full_name, grade, coins, referral_code)
    VALUES (new.id, v_full_name, v_grade, 500, v_ref_code)
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      grade = EXCLUDED.grade;
  EXCEPTION WHEN OTHERS THEN
    -- Última instância: não quebramos o Auth se o perfil falhar
    RAISE WARNING 'CRITICAL: Falha total ao criar perfil para %: %', new.id, SQLERRM;
  END;

  RETURN new;
END;
$$ language plpgsql security definer;

-- 4. Re-vincular o trigger (Garantir que ele exista e aponte para a função correta)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Gerar códigos para usuários atuais que ainda não tem (Limpeza)
UPDATE public.profiles SET referral_code = generate_referral_code() WHERE referral_code IS NULL;
