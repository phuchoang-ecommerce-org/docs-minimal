# Documentation reader and diagram build

This folder owns the Astro documentation reader and all build scripts. npm uses the existing `package.json` and `package-lock.json`.

- `npm run diagrams:build`: `toSvg.js` generates sibling SVG files from all committed `.puml` and `.bpmn` sources. PlantUML runs headless; the BPMN 2.0 XML is rendered from its BPMN-DI geometry by the same JavaScript file.
- `npm run validate:mermaid`: checks every Mermaid block (flowchart, class, ER, sequence and other supported types) using the real parser with a DOM environment. Invalid diagrams fail the command. `validate:sequences` remains a compatibility alias; no diagram type is skipped.
- `npm run build`: copies assets and builds the Astro reader. Run `diagrams:build` and `validate:mermaid` first.

Generated SVGs, copied assets and build output are ignored by Git. Commit the PlantUML/BPMN sources and `toSvg.js`; SVGs are recreated during the npm build.

## API reference

From `util/`, run `npm ci`, then `npm run dev`. Open the reader URL shown in the terminal (normally `http://localhost:4321`) and select [API Contract](../SolutionArchitecture/api-contract/index.md), then **Open ReDoc**. The direct web route is `/redoc.html`. ReDoc uses the same OpenAPI file as the contract index.

- `npm run validate:api`: Redocly OpenAPI lint plus UC inventory, references, schema reachability, cursor and edit-precondition checks. Localhost is the intentional development server; no project license has been assigned, so those two metadata warnings are disabled.
- `npm run docs:api`: regenerate `public/redoc.html` after editing OpenAPI. ReDocly is pinned in the lockfile; the HTML embeds the spec and renderer with telemetry off. It needs no running marketplace backend. Redoc branding assets may still use its CDN.
- `npm run docs:prepare`: copy raw documentation assets and rebuild ReDoc. `dev` runs this at startup; after changing OpenAPI during a dev session, run it again and reload the page.
- `npm run build`: validate the API, prepare assets, then build the static reader. `npm run preview` serves the generated `dist/`, including `/redoc.html` and the downloadable YAML under `/docs/SolutionArchitecture/api-contract/openapi.yaml`.

Generated `public/redoc.html` is ignored. Commit the source contract, scripts, configuration and lockfile. `DOCS_ROOT` can select another documentation root for the reader/asset/ReDoc scripts; the npm lint command intentionally validates this repository's contract.

ReDoc generation follows the official [Redocly build-docs interface](https://redocly.com/docs/cli/commands/build-docs), using `--inlineBundle` and `telemetry: off`.
