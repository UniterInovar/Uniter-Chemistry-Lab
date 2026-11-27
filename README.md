# UNITER Chemistry Lab

An interactive chemistry learning application for exploring VSEPR molecular geometry. The initial release includes a searchable simulation library, student dashboard, interactive Three.js molecular models, guided learning, a custom shape builder, and a locally saved challenge score.

## Run locally

1. Install Node.js (LTS) and npm.
2. Open this folder in VS Code and open a terminal at the project root.
3. Run `npm install`.
4. Run `npm run dev`, then open the local address printed by Vite.
5. Create a production build with `npm run build`.

## Molecular Geometry Explorer

- Presets: BeCl₂, CO₂, BF₃, SO₂, CH₄, NH₃, H₂O, PCl₅, SF₄, ClF₃, XeF₂ and SF₆.
- Drag to rotate and scroll/pinch to zoom. Choose ball-and-stick, electron-pair, or space-filling views; toggle labels, angles, lone pairs, bonds and electron regions; select atoms and bonds; reset or fullscreen the view.
- Guided learning steps through central atom, bonding regions, lone pairs, total regions, electron geometry, molecular shape and approximate angle.
- Challenge mode provides immediate feedback and saves personal-best points locally.
- Build mode supports neutral molecules and polyatomic ions, idealized VSEPR configurations up to six electron domains, and Lewis-based bond-order and lone-pair inference from total valence electrons. Each atom’s local shape is determined from its inferred bonding domains and lone pairs; multiple bonds count as one VSEPR domain. Learners can assemble a connected multi-center graph by choosing atoms and connecting pairs; the model infers single/double/triple bonds, lone pairs, formal charges, and duet/octet/expanded-shell status. Electron-deficient Be/B/Al and expanded shells for period 3 and heavier main-group atoms are included. Starter structures include ethanol, ethene, carbon dioxide, nitrogen, and nitronium ([NO₂]⁺); quick ion examples include [NH₄]⁺, [H₃O]⁺, [NO₂]⁺, [NO₂]⁻, [CO₃]²⁻ and [SO₄]²⁻. Charged formulas are displayed in square brackets with the net charge outside. Resonance is shown as one valid Lewis contributor; odd-electron radicals and transition-metal bonding are not currently solved.

Geometry templates use idealized VSEPR coordinates. Approximate bond angles are shown where lone-pair repulsion distorts ideal angles. Real structures can vary with chemical context. Multiple bonds are treated as one electron region. Polarity labels are qualitative for the listed idealized shapes.

## Library status

Molecular Geometry Explorer is interactive and available. Other library entries are labeled “In development” and are topic previews, not completed simulations.

## Technology

React, Vite, Three.js, React Three Fiber, Drei, Lucide React, and browser local storage. Rendering uses low-power settings and reduced device pixel ratio for moderate hardware.
