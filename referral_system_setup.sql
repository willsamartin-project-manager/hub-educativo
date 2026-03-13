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

-- Atualizar handle_new_user para gerar código e processar indicação
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger as $$
DECLARE
  referrer_id UUID;
  ref_code TEXT;
BEGIN
  -- Gerar código unico para o novo usuario
  ref_code := generate_referral_code();
  
  -- Verificar se foi indicado por alguém
  IF new.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    SELECT id INTO referrer_id FROM public.profiles 
    WHERE referral_code = (new.raw_user_meta_data->>'referral_code');
    
    -- Se o indicador existe
    IF referrer_id IS NOT NULL THEN
      -- Dar 50 moedas para o indicador
      UPDATE public.profiles SET coins = coins + 50 WHERE id = referrer_id;
      
      -- Inserir perfil com bônus de 50 moedas (500 base + 50 bônus)
      INSERT INTO public.profiles (id, full_name, grade, coins, referral_code, referred_by)
      VALUES (
        new.id, 
        new.raw_user_meta_data->>'full_name', 
        'Ensino Médio', 
        550, 
        ref_code,
        referrer_id
      );
      RETURN new;
    END IF;
  END IF;

  -- Inserção padrão se não houver indicação válida
  INSERT INTO public.profiles (id, full_name, grade, coins, referral_code)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    'Ensino Médio', 
    500,
    ref_code
  );
  
  return new;
END;
$$ language plpgsql security definer;

-- Gerar códigos para usuários atuais que ainda não tem
UPDATE public.profiles SET referral_code = generate_referral_code() WHERE referral_code IS NULL;
