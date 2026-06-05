---
name: Object storage setup
description: GCS-backed presigned URL upload flow wired into the Ghana shop API server
---

## Rule
Object storage uses a presigned GCS URL flow. The server returns `objectPath` (e.g. `uploads/some-uuid`). Images are served at `/api/storage/objects/{objectPath}`.

**Why:** Replit object storage uses Google Cloud Storage with a sidecar auth proxy. Direct uploads go to GCS, not through the Express server.

**How to apply:**
- Admin product form uses a hidden `<input type="file">` that calls POST `/api/storage/uploads/request-url` to get `{ uploadURL, objectPath }`, then PUTs the file directly to `uploadURL`, then sets `imageUrl` to `/api/storage/objects/${objectPath}`.
- The `imageUrl` field validation uses `z.string().min(1)` (not `.url()`) since the path is relative.
- imageUrl schema in openapi.yaml does NOT use format:uri for this reason.
- `lib/object-storage-web` is a composite lib added to root tsconfig.json references and ghana-shop tsconfig.json references.
- Hook: `useRequestUploadUrl` from `@workspace/api-client-react`.
