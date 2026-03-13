-- Adicionar coluna de administrador
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Definir um administrador (Substitua pelo seu email se souber o ID, ou rode o comando abaixo após o login)
-- UPDATE public.profiles SET is_admin = TRUE WHERE full_name = 'Wilkinson dos Santos Martins';

-- Criar política para que apenas admins vejam todos os perfis (opcional, mas recomendado)
-- CREATE POLICY "Admins can view all profiles" ON public.profiles
-- FOR SELECT USING (
--   (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
-- );
