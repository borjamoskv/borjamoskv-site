Original prompt: El gambitero...desaroolale jueghop

- 2026-03-25: El Gambitero ya tiene encaminado el loop 8-bit en modo locrio, una capa de música propia sin fuentes simultáneas y ajustes de HUD/estado; falta pasar verificación visual final y sincronizarlo con la copia real.
- 2026-03-25: Se añadió una portada sorpresa/HERO para el acceso al Gambitero en negro mate, YInMn Blue y amarillo, con copy más críptico y layout responsive; falta validar el resultado en navegador y ajustar cualquier desalineación.
- 2026-03-18: Audit inicial hecho. `gambitero.js` ya tiene una aventura textual/visual con ranking y una tragaperras, pero le faltan bucle meta, continuidad entre partidas, estado visible y testing hooks.
- Bug detectado: el renderer usa `c.requires`, pero escenas como la 13 declaran `req`, así que algunos bloqueos no funcionan como deberían.
- Bug detectado: la tragaperras vuelve de forma incoherente y no recuerda bien desde qué escena se entró.
- Objetivo de esta pasada: convertirlo en una experiencia más completa con menú, continuar partida, meta-progreso, mejor HUD/cronología y hooks de prueba (`render_game_to_text`, `advanceTime`).
