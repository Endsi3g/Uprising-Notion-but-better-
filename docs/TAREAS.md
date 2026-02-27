# 📋 Tareas de Evolución - Uprising Studio

## Fase 1: Saneamiento y Estabilidad (Prioridad Alta)
- [ ] Verificar la eliminación completa de `twenty-main/twenty-main`.
- [ ] Ejecutar `yarn nx reset` para limpiar el grafo de dependencias.
- [ ] Corregir etiquetas SEO en `index.html`.

## Fase 2: Refactorización y Calidad
- [x] Migrar estilos inline en `VoiceAgentsPage.tsx` a componentes estilizados.
- [ ] Revisar otros módulos en busca de deuda técnica visual.
- [ ] Asegurar que el token `TWENTY_INFRA_TOKEN` sea opcional en todos los flujos de CI.

## Fase 3: Despliegue y Productividad
- [ ] Validar el pipeline de Vercel con el nuevo bypass del script de automatización.
- [ ] Probar la inyección de IDs de Notion usando el nuevo script `setup_notion_config.js`.
