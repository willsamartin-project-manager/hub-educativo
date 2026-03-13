-- Script para criar o bucket 'avatars' e configurar RLS
-- Execute este comando no SQL Editor do seu projeto Supabase

-- 1. Criar o bucket de armazenamento se ele não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para permitir que qualquer pessoa veja as fotos (Leitura Pública)
CREATE POLICY "Avatares são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 3. Política para permitir que usuários autenticados façam upload de suas próprias fotos
CREATE POLICY "Usuários podem subir seus próprios avatares"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

-- 4. Política para permitir que usuários atualizem seus próprios avatares
CREATE POLICY "Usuários podem atualizar seus próprios avatares"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.uid() = owner
);
