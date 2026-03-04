-- ============================================================
-- Project: Uprising CRM
-- Author: Uprising Studio
-- Description: insert_view.sql
-- Last Modified: 2026-03-04
-- ============================================================
INSERT INTO core.view (
  id, "universalIdentifier", name, "objectMetadataId", type, icon, position,
  "isCompact", "isCustom", "openRecordIn", "workspaceId",
  "applicationId", visibility, "mainGroupByFieldMetadataId"
) VALUES (
  '940f0162-3cf5-4f2b-8eb2-6f6e2409aaa6', '55c6f31c-ffb4-4b59-810e-75d278cf93b4', 'Pipeline de Projets', 'dda569f1-74da-44e2-91c6-36ff3498a634',
  'KANBAN', 'IconKanban', 0, false, true, 'SIDE_PANEL',
  '87aba936-be81-479f-b6ae-c7054173ee7d', '83fc4c5f-416c-4ec4-bcdb-8819ebb3d957', 'WORKSPACE', 'ecaea3f7-6233-47f1-95dc-3086ea5fe645'
);
