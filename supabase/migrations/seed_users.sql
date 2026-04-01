-- ─────────────────────────────────────────────────────────────────────────────
-- Create all GDC team users in Supabase Auth
-- Paste this into the SQL Editor at:
-- https://supabase.com/dashboard/project/wupzqgxdfaqsbtodjssm/sql
-- ─────────────────────────────────────────────────────────────────────────────

-- First, confirm the two users already created via API
UPDATE auth.users
SET email_confirmed_at = now(),
    raw_user_meta_data = raw_user_meta_data || '{"email_verified": true}'::jsonb
WHERE email IN ('dean.ryan@gdcgroup.com', 'gabriel.cornoiu@gdcgroup.com')
  AND email_confirmed_at IS NULL;

-- Now create the remaining users directly in auth.users
-- Password: P3ssword!123 (bcrypt hash generated for this password)
-- Using crypt() from pgcrypto extension

DO $$
DECLARE
  hashed_pw text;
  new_uid uuid;
BEGIN
  -- Generate bcrypt hash for the password
  hashed_pw := crypt('P3ssword!123', gen_salt('bf'));

  -- Chloe Christie
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'chloe.christie@gdcgroup.com') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated',
      'chloe.christie@gdcgroup.com', hashed_pw, now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Chloe Christie", "email_verified": true}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_uid, new_uid::text,
      json_build_object('sub', new_uid::text, 'email', 'chloe.christie@gdcgroup.com', 'full_name', 'Chloe Christie', 'email_verified', true)::jsonb,
      'email', now(), now(), now());
  END IF;

  -- Colin Brannigan
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'colin.brannigan@gdcgroup.com') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated',
      'colin.brannigan@gdcgroup.com', hashed_pw, now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Colin Brannigan", "email_verified": true}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_uid, new_uid::text,
      json_build_object('sub', new_uid::text, 'email', 'colin.brannigan@gdcgroup.com', 'full_name', 'Colin Brannigan', 'email_verified', true)::jsonb,
      'email', now(), now(), now());
  END IF;

  -- Jessica Dordevic Cioffi
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jessica.dordevic@gdcgroup.com') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated',
      'jessica.dordevic@gdcgroup.com', hashed_pw, now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Jessica Dordevic Cioffi", "email_verified": true}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_uid, new_uid::text,
      json_build_object('sub', new_uid::text, 'email', 'jessica.dordevic@gdcgroup.com', 'full_name', 'Jessica Dordevic Cioffi', 'email_verified', true)::jsonb,
      'email', now(), now(), now());
  END IF;

  -- Miguel Migneco
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'miguel.migneco@gdcgroup.com') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated',
      'miguel.migneco@gdcgroup.com', hashed_pw, now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Miguel Migneco", "email_verified": true}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_uid, new_uid::text,
      json_build_object('sub', new_uid::text, 'email', 'miguel.migneco@gdcgroup.com', 'full_name', 'Miguel Migneco', 'email_verified', true)::jsonb,
      'email', now(), now(), now());
  END IF;

  -- Mike Pett
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'michael.pett@gdcgroup.com') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated',
      'michael.pett@gdcgroup.com', hashed_pw, now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Mike Pett", "email_verified": true}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_uid, new_uid::text,
      json_build_object('sub', new_uid::text, 'email', 'michael.pett@gdcgroup.com', 'full_name', 'Mike Pett', 'email_verified', true)::jsonb,
      'email', now(), now(), now());
  END IF;

  -- Ciara Carroll
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ciara.carroll@gdcgroup.com') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated',
      'ciara.carroll@gdcgroup.com', hashed_pw, now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Ciara Carroll", "email_verified": true}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_uid, new_uid::text,
      json_build_object('sub', new_uid::text, 'email', 'ciara.carroll@gdcgroup.com', 'full_name', 'Ciara Carroll', 'email_verified', true)::jsonb,
      'email', now(), now(), now());
  END IF;

  -- Vic Dadson
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'victoria.dadson@gdcgroup.com') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated',
      'victoria.dadson@gdcgroup.com', hashed_pw, now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Vic Dadson", "email_verified": true}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_uid, new_uid::text,
      json_build_object('sub', new_uid::text, 'email', 'victoria.dadson@gdcgroup.com', 'full_name', 'Vic Dadson', 'email_verified', true)::jsonb,
      'email', now(), now(), now());
  END IF;
END $$;

-- Verify all users exist and are confirmed
SELECT email, email_confirmed_at IS NOT NULL as confirmed, raw_user_meta_data->>'full_name' as name
FROM auth.users
ORDER BY email;
