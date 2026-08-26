# Project Rules

- Keep this uni-app Vue 3 project front-end only; do not add server code or environment switching without an explicit requirement.
- There is no tabbar. Register pages in `pages.json` and navigate with uni-app APIs.
- Keep wedding copy and media replaceable through `src/config/invitation.js` and `static/invitation/`.
- Keep page lifecycle capabilities in `src/composables/` and external integrations in `src/services/`.
- Visitor tracking must remain optional and fail-safe when cloud development is unavailable.
