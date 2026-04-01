-- ─────────────────────────────────────────────────────────────────────────────
-- Set up GDC Product Features workspace, fix passwords, assign roles
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Update ALL user passwords to P@ssword!123
UPDATE auth.users
SET encrypted_password = crypt('P@ssword!123', gen_salt('bf'));

-- 2. Create the GDC Product Features workspace (if not exists)
INSERT INTO workspaces (id, name, slug, created_at)
VALUES (
  'ws-gdc-product-features',
  'GDC Product Features',
  'gdc-product-features',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Set created_by to Mike Pett's auth user ID
UPDATE workspaces
SET created_by = (SELECT id::text FROM auth.users WHERE email = 'michael.pett@gdcgroup.com')
WHERE id = 'ws-gdc-product-features';

-- 4. Add all users as workspace members with correct roles
-- Mike Pett → Owner
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT 'ws-gdc-product-features', id::text, 'owner'::workspace_role
FROM auth.users WHERE email = 'michael.pett@gdcgroup.com'
ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'owner';

-- Gabriel Cornoiu → Admin
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT 'ws-gdc-product-features', id::text, 'admin'::workspace_role
FROM auth.users WHERE email = 'gabriel.cornoiu@gdcgroup.com'
ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'admin';

-- Chloe Christie → Admin
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT 'ws-gdc-product-features', id::text, 'admin'::workspace_role
FROM auth.users WHERE email = 'chloe.christie@gdcgroup.com'
ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'admin';

-- Dean Ryan → Member
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT 'ws-gdc-product-features', id::text, 'member'::workspace_role
FROM auth.users WHERE email = 'dean.ryan@gdcgroup.com'
ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'member';

-- Colin Brannigan → Member
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT 'ws-gdc-product-features', id::text, 'member'::workspace_role
FROM auth.users WHERE email = 'colin.brannigan@gdcgroup.com'
ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'member';

-- Jessica Dordevic Cioffi → Member
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT 'ws-gdc-product-features', id::text, 'member'::workspace_role
FROM auth.users WHERE email = 'jessica.dordevic@gdcgroup.com'
ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'member';

-- Miguel Migneco → Member
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT 'ws-gdc-product-features', id::text, 'member'::workspace_role
FROM auth.users WHERE email = 'miguel.migneco@gdcgroup.com'
ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'member';

-- Ciara Carroll → Member
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT 'ws-gdc-product-features', id::text, 'member'::workspace_role
FROM auth.users WHERE email = 'ciara.carroll@gdcgroup.com'
ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'member';

-- Vic Dadson → Member
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT 'ws-gdc-product-features', id::text, 'member'::workspace_role
FROM auth.users WHERE email = 'victoria.dadson@gdcgroup.com'
ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'member';

-- 5. Verify
SELECT u.email, wm.role, w.name as workspace
FROM workspace_members wm
JOIN auth.users u ON u.id::text = wm.user_id
JOIN workspaces w ON w.id = wm.workspace_id
ORDER BY
  CASE wm.role WHEN 'owner' THEN 1 WHEN 'admin' THEN 2 WHEN 'member' THEN 3 ELSE 4 END,
  u.email;
