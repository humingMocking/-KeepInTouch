# Wedding Album Gallery Design

## Context

The invitation app already has a paper-textured wedding invitation page and an album page route. The invitation page has an `openAlbum` action, but the button is commented out. The album page currently shows only placeholder copy. The only wedding photo asset available in the project is `/static/invitation/wedding-photo.jpg`, so the first implementation will reuse it as 38 placeholder album items.

## Goals

- Restore and restyle the bottom album entry on the invitation page so it feels like part of the paper invitation design.
- Build the album page in the same visual language: warm paper background, red-brown accents, refined typography, and photo-card framing.
- Show album photos in two columns.
- Lazy load the placeholder list in batches with progressive loading feedback.
- Support full-size preview for every album photo.
- Support full-size preview for the main wedding photo on the invitation page.

## Visual Design

The invitation page album entry will become a light sticker-like call-to-action below the closing blessing. It will use a soft ivory fill, red-brown border, subtle shadow, compact label text, and a small arrow cue. This keeps it more polished than the current plain outline button while matching the handmade paper mood of the invitation.

The album page will use the same paper-toned background and red-brown color accents as the invitation. The top area will include a small English label, the album title, and a simple count. Photos will render as two balanced columns with slim ivory frames, soft shadows, and slight alternating offsets so the grid feels curated rather than mechanical.

## Interaction

The album will create 38 placeholder records that all point to `/static/invitation/wedding-photo.jpg`. The page will initially render the first batch, then append more items as the user scrolls near the bottom. Each newly visible card will fade in and move upward slightly. While images are loading, each card shows a subtle shimmer placeholder.

Tapping an album photo calls `uni.previewImage` with the full 38-item URL list and the tapped photo as `current`. Tapping the invitation page wedding photo calls the same preview API for `/static/invitation/wedding-photo.jpg`.

## Implementation Notes

- Keep the implementation local to `pages/index/index.vue`, `pages/album/album.vue`, and, if useful, `src/config/invitation.js`.
- Avoid adding new dependencies.
- Prefer uni-app primitives and WeChat-compatible APIs.
- Preserve existing invitation layout, map interactions, sharing behavior, and background audio behavior.

## Verification

- Check that the invitation page still opens normally and the album button navigates to `/pages/album/album`.
- Check that the invitation wedding photo opens preview.
- Check that the album page renders two columns, progressively appends items, and every photo opens preview.
- Run any available local build or syntax check if the project provides one.
