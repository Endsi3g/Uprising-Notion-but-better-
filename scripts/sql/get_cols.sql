-- ============================================================
-- Project: Uprising CRM
-- Author: Uprising Studio
-- Description: get_cols.sql
-- Last Modified: 2026-03-04
-- ============================================================
SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'core' AND table_name = 'viewField' ORDER BY ordinal_position;
