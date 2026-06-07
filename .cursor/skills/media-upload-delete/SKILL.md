---
name: media-upload-delete
description: Wires media upload and delete using FileUpload, fileUploadService, companyWebMediaService, SelectMediaDialog, folder paths, and correct delete semantics. Use when adding image upload, gallery, media library integration, or file deletion.
---

# Media Upload & Delete

Full rule: [media-upload-delete.mdc](../../rules/media-upload-delete.mdc).

## Choose the flow

```
Entity field / gallery / avatar?
  └─ Yes → fileUploadService + FileUpload
Website media library / bulk / folders?
  └─ Yes → companyWebMediaService (+ MediaUploadDialog on library pages)
Pick existing library image in editor/form?
  └─ Yes → SelectMediaDialog → store path → getMediaFileUrl for display
```

## Workflow A — Single image on an entity

Example: avatar, product cover, wizard step image.

### 1. Folder path

- Company-scoped: `companies/{companyId}/<domain>/{entityId}/...`
- User profile: `users/{userId}/profile`
- System catalog: `products`, `system/services`
- Copy the nearest feature (see rule table).

### 2. UI

```tsx
import FileUpload from "@/components/ui/file-upload";

<FileUpload
  folderPath={folderPath}
  currentImagePath={entity.imagePath}
  onFileUploaded={(filePath) => persistPath(filePath)}
  onFileDeleted={() => clearPathAndDeleteRecord()}
  maxSize={10}
  cropAspectPresets={[{ label: "Square 1:1", value: 1 }]} // optional
/>
```

### 3. Persist

- Save **`filePath`** (relative) on create/update — not `fileUrl`.
- Display with `formatAvatarUrl(filePath)`.

### 4. Delete / replace

- **Replace:** new upload → save new path (consider deleting old file if no other references).
- **Remove:** `FileUpload` deletes disk file when user clicks X; parent `onFileDeleted` must clear the DB field (see `ProfileHeaderCard`).

## Workflow B — Multi-image gallery

Example: `ServiceGalleryTab`, `SpaceGalleryTab`.

### 1. Upload

- One `FileUpload` per add; `onFileUploaded` appends `filePath` to entity array and PATCHes entity.
- `onFileDeleted={() => {}}` — gallery uses separate grid delete, not FileUpload preview delete.

### 2. Display grid

- `formatAvatarUrl(imagePath)` for each tile.
- Destructive icon button on hover to remove from gallery.

### 3. Remove from gallery

- Filter path out of array → update entity → toast.
- **Does not** call `fileUploadService.deleteFile` today — file may remain on disk.

### 4. Optional reorder

- Persist reordered array (see `ServiceGalleryTab` dnd-kit pattern).

## Workflow C — Company web media library

Example: `MediaPage`, `MediaUploadDialog`.

### 1. Browse

```tsx
const { folders, files } = await companyWebMediaService.list(companyId, currentPath);
```

### 2. Upload

- **Single + crop:** `MediaUploadDialog` → `FileUpload` with `folderPath={`companies/${companyId}/web/media${subPath}`}`.
- **Multi, no crop:** `companyWebMediaService.upload(companyId, currentPath, files)`.

### 3. Delete

- Set `deleteTarget` `{ path, name, type: 'file' | 'folder' }`.
- Confirm via `DeleteConfirmationDialog` or destructive `CustomDialog` footer.
- `await companyWebMediaService.delete(companyId, path, type)` → refresh list.

### 4. URLs

```tsx
import { getMediaFileUrl } from "@/features/website/services/companyWebMedia";
const url = getMediaFileUrl(companyId, file.path);
```

## Workflow D — Select from library

Example: `ImageAddon`, `SelectMediaDialog`.

1. Open `SelectMediaDialog` with `companyId`, `selectedPath`, `onSelect(path)`.
2. Store relative path on entity/addon data.
3. Render with `getMediaFileUrl(companyId, path)`.
4. Optional inline upload opens nested `MediaUploadDialog` → reload list on complete.

## Back-end (only when adding new upload surfaces)

| Task | Location |
|------|----------|
| General entity upload | Extend `back-end/routes/uploads.js` (images, 5 MB) |
| Media library | Extend `back-end/routes/companyWebMedia.js` |
| Register router | `back-end/server.js` |

Follow [backend-api-routes.mdc](../../rules/backend-api-routes.mdc): `authenticateToken`, Joi validation, `{ success, data }` envelope.

## Checklist

```
- [ ] Correct API chosen (uploads vs company-web-media)
- [ ] folderPath matches domain convention
- [ ] DB stores relative filePath, not full URL
- [ ] Display uses formatAvatarUrl or getMediaFileUrl
- [ ] Upload: toast + refresh entity/list
- [ ] Delete: confirm for library; inline or grid for entity
- [ ] Single-image delete clears DB + disk; gallery unlink documented
- [ ] Destructive UI per delete-destructive-actions.mdc
- [ ] type-check + lint pass
```

## Reference implementations

| File | Pattern |
|------|---------|
| `components/ui/file-upload.tsx` | Shared upload UI |
| `shared/services/fileUploadService.ts` | Upload/delete API client |
| `features/website/services/companyWebMedia.ts` | Library API |
| `MediaPage.tsx` | Library CRUD + delete confirm |
| `MediaUploadDialog.tsx` | Crop + multi-upload |
| `SelectMediaDialog.tsx` | Library picker |
| `ProfileHeaderCard.tsx` | Avatar upload/delete |
| `ServiceGalleryTab.tsx` | Gallery append + unlink |
| `WebpageEditor/addons/image/ImageAddon.tsx` | Library path on addon |

## Verification

```bash
cd front-end && npm run type-check && npm run lint
```

Manual: upload → verify preview and persisted path → delete or replace → confirm entity/list state and toasts.
