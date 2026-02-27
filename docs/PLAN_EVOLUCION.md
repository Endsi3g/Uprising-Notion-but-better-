# 💎 Plan de Evolución - Estándar Diamante

## Contexto
Este plan detalla la hoja de ruta para elevar a **Uprising Studio CRM** a un estándar de calidad profesional, eliminando redundancias en el monorepo y optimizando la experiencia del desarrollador y del usuario final.

## 1. Arquitectura y Monorepo
Se restaurará la integridad de NX eliminando los proyectos duplicados causados por la carpeta anidada. Esto permitirá que el comando `yarn nx graph` funcione correctamente y desbloqueará las herramientas de productividad de Twenty.

## 2. Refactorización Estética
Siguiendo los principios de `@ui-ux-pro-max`, todos los componentes React se migrarán fuera de los estilos inline. Se utilizará el sistema de temas de Twenty para asegurar consistencia visual entre el modo claro y oscuro.

## 3. Integración Notion
Se estandarizará el proceso de sincronización. Las empresas se vincularán exclusivamente por su dominio y las personas por su correo electrónico, garantizando una base de datos limpia tanto en Twenty como en Notion.

## 4. Squad de Expertos
- **Arquitecto**: Lidera la evolución.
- **Frontend Master**: Asegura la UI premium.
- **DevOps Gen**: Optimiza los tiempos de despliegue en Windows y CI.
