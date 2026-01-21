---
"@tractorbeam/eslint-config": minor
---

Add ui config with custom ESLint rules:
- `no-button-height-class`: warns when Button components use Tailwind sizing classes (h-\*, w-\*, size-\*, min-h-\*, max-h-\*, min-w-\*, max-w-\*) instead of the size prop. Allowed: \*-full, min-\*-0, max-\*-none.
- `no-icon-class-in-button`: warns when Icon components nested inside Button have className attributes. Detects icons by name (\*Icon, Icons.\*) and by type (LucideIcon from lucide-react) when type info is available.
