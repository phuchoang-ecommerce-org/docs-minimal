# Documentation reader and diagram build

This folder owns the Astro documentation reader and all build scripts. npm uses the existing `package.json` and `package-lock.json`.

- `npm run diagrams:build`: `toSvg.js` generates sibling SVG files from all committed `.puml` and `.bpmn` sources. PlantUML runs headless; the BPMN 2.0 XML is rendered from its BPMN-DI geometry by the same JavaScript file.
- `npm run validate:sequences`: checks Mermaid sequence-diagram syntax.
- `npm run build`: generates diagrams, validates sequences, copies assets and builds the Astro reader.

Generated SVGs, copied assets and build output are ignored by Git. Commit the PlantUML/BPMN sources and `toSvg.js`; SVGs are recreated during the npm build.
