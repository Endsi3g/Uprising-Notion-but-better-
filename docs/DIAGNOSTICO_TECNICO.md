# 🩺 Diagnóstico Técnico - Uprising Studio CRM

## 1. Análisis de Entorno
- **Estado**: Proyecto Existente (Evolución).
- **Stack Detectado**:
  - Frontend: React (Vite) + Emotion (Styled Components).
  - Backend: NestJS + PostgreSQL.
  - Gestión: NX Monorepo + Yarn Berry.
  - Infraestructura: Vercel (FE), Railway/Oracle (BE).

## 2. Puntos de Dolor Identificados
- **Corrupción de Estructura**: Existencia de un subdirectorio redundante `twenty-main/twenty-main` con un doble repositorio Git, causando fallos críticos en el grafo de dependencias de NX y lentitud extrema.
- **Deuda Técnica UI**: Uso de estilos inline en componentes críticos como `VoiceAgentsPage.tsx`.
- **Incompatibilidad SEO**: Etiquetas `meta` no soportadas en `index.html`.
- **Lentitud de Automatización**: Los scripts de verificación NX cuelgan el proceso en entornos Windows.

## 3. Prescripción Técnica
1.  **Saneamiento de Raíz**: Eliminación forzada de la carpeta redundante y reseteo de la caché de NX.
2.  **Refactorización Estética**: Migrar estilos inline a `styled-components` para cumplir con el estándar de calidad.
3.  **Optimización de Pipeline**: Mantener el bypass de verificaciones pesadas en local para asegurar fluidez.

## 4. Squad de Expertos Propuesto
- `@ui-ux-pro-max`: Para la limpieza estética y consistencia de marca.
- `@clean-code`: Para la refactorización de los componentes de voz.
- `@nx-workspace-patterns`: Para la reparación definitiva del monorepo.
