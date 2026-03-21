# STACK — Choix techniques (simple)

Tu maîtrises déjà **Rails 8 + SQLite + Hotwire + Tailwind** : c’est exactement la stack cible.

---

## Pourquoi cette stack

| Technologie | Rôle |
|---|---|
| **Rails 8** | Une app, un langage, conventions claires — CRUD admin rapide |
| **SQLite** | Un fichier, backups faciles, suffisant pour un portfolio + une admin |
| **Hotwire** | Turbo + Stimulus — interactivité sans écrire une SPA React |
| **Tailwind** | Utility-first, cohérent avec une refonte UI progressive |
| **importmap** | Pas de bundler JS obligatoire |

---

## Ce qu’on ne met pas dans la v1 admin

- Pas de multi-tenant, pas de API publique complexe.
- Pas d’obligation MinIO / Docker / Dokploy pour **commencer** : Active Storage sur disque suffit en dev et sur beaucoup d’hébergeurs Rails.

---

*Mars 2026*
