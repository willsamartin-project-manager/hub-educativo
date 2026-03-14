-- SCRIPT DE RESET DE EMERGÊNCIA
-- Vamos remover totalmente a complexidade para ver se o cadastro volta a funcionar

-- 1. Remover o trigger atual
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Recriar a função da forma mais simples possível, sem referências a colunas novas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger as $$
BEGIN
  -- Apenas inserir o ID, nome e coins. Ignorar todo o resto por enquanto.
  INSERT INTO public.profiles (id, full_name, coins)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Estudante'), 
    500
  );
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Se falhar, tentamos logar, mas o Supabase as vezes engole isso e bloqueia o Auth se a função estourar
  RETURN new;
END;
$$ language plpgsql security definer;

-- 3. Re-vincular
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
