# Product Image Contract

## Product image contract: LINK or UPLOAD

The Seller chooses one mode for each product image. A product may mix modes; one image is designated primary. Metadata includes alt text and sort order in both modes.

| Mode | Seller input | Stored in PostgreSQL | Display |
| --- | --- | --- | --- |
| LINK | Approved HTTPS image URL, source page and license reference | URL, provenance/license and metadata; **no image bytes** | Browser requests the approved source live; a local placeholder appears on failure |
| UPLOAD | JPEG, PNG or WebP file through authenticated multipart API | Validated bytes in `BYTEA`, MIME, dimensions, size and metadata; **no remote URL** | Same-origin API streams PostgreSQL bytes with correct content type and cache headers; a placeholder appears on failure |

For LINK, validate URL syntax and approved public host, then set a restrictive `img-src` allowlist. Do not use Next.js image optimization for LINK, which would create a separate cache. The browser/source may apply ordinary network caching outside application control. For UPLOAD, enforce a documented size limit (proposed 5 MiB per image), maximum dimensions and per-product count; inspect actual file signature and decode it rather than trusting extension or browser MIME. Reject SVG and executable formats. A Seller can edit/remove only images of their own products. Tests assert mutually exclusive URL/bytes fields.

Future **development product seed data** may use LINK images from approved sources; this document does not create seed data. Production supports both LINK and UPLOAD. The source site is a live dependency only for LINK display; UPLOAD display depends on PostgreSQL.

“Free to use” does not mean copyright-free. The approved-source policy may include [Unsplash](https://unsplash.com/license) and [Pexels](https://www.pexels.com/license/) after review of current terms; record source/license for LINK and any imported image. Seller must ensure the particular image and depicted people/brands fit the product use. If server-side fetching of arbitrary URLs is ever introduced, review [OWASP's SSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) first. This specification uses browser requests for LINK and file upload for UPLOAD; neither path makes the backend fetch a Seller URL.
