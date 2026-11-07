# Product Image Contract

UC-06 owns image writes; UC-01 owns public display. A product may mix LINK and UPLOAD, up to 10 images. Metadata contains alt text, sort order and primary flag. The first image becomes primary; setting a new primary clears the old flag atomically. If the primary is deleted, promote the remaining image with lowest `(sortOrder,id)`; no image means no primary. These bounds and selection rules are revision 0.2.0 implementation defaults.

| Mode | Input | PostgreSQL storage | Public response |
| --- | --- | --- | --- |
| LINK | Approved HTTPS URL, source page, license URL, metadata | URL/provenance; no image bytes | `LinkedImage`: URL; no contentPath |
| UPLOAD | Authenticated JPEG/PNG/WebP multipart file and metadata | Validated BYTEA, MIME, dimensions, byte count; no remote URL | `UploadedImage`: same-origin contentPath; no remote URL |

The schema uses `oneOf` and a mode discriminator, so an image cannot be both branches. Product version guards add/remove; creation returns updated `productVersion`. Metadata changes use remove/add in this minimal contract. Seller can mutate only owned product images while their shop is active. Every image lookup verifies the image belongs to the requested product.

LINK is fetched directly by the browser. The backend neither downloads nor proxies Seller URLs. Validate HTTPS, approved public hostname and provenance against deployment configuration; reject credentials, internal/IP-literal targets and unapproved hosts as 400 `UNSAFE_IMAGE`. Approved hosts and license terms must be selected before enabling LINK in a deployment. Do not add an optimizer cache or persistent external storage. Display failures use the application's placeholder.

UPLOAD allows at most 5 MiB per file, 8192 pixels per side and 32 million decoded pixels. Validate actual signature, decode successfully, and reject SVG/executable/mismatched content. Oversized payload is 413; unsupported media is 415; unsafe/undecodable image is 400. More than 10 product images is 409. Reject before allocating an unbounded decoded bitmap. Multipart parser limits must produce the same problem envelope.

`GET /products/{productId}/images/{imageId}/content` serves only UPLOAD bytes for a published product of an active Seller. LINK ID, mismatched product/image, unpublished product and inactive Seller return 404. Send actual Content-Type, `X-Content-Type-Options: nosniff` and `Cache-Control: no-store` so a removed/suspended product is not served from a stale public cache. Error JSON never uses an image MIME type.
