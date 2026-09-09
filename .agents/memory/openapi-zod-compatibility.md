---
name: OpenAPI integer compatibility
description: A codegen compatibility constraint between the repository's Orval output and installed Zod runtime.
---

When an OpenAPI integer schema causes generated code to call `zod.int()`, represent the API value as a number with `multipleOf: 1` and enforce integer semantics at the server boundary.

**Why:** The installed Zod runtime in this workspace does not expose the generated `zod.int()` helper, so codegen's chained library typecheck fails even though Orval itself succeeds.

**How to apply:** Use this for new numeric request or response fields in `lib/api-spec/openapi.yaml`; regenerate immediately and keep explicit server-side integer validation.