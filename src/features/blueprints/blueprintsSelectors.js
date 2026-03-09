// Selector memoizado para el top-5 de blueprints por cantidad de puntos
import { createSelector } from 'reselect';

// Suponemos que los blueprints están en state.blueprints.byAuthor (por autor)
// Si tienes todos los blueprints en otro campo, ajusta la fuente

export const selectAllBlueprints = (state) => {
  // Junta todos los blueprints de todos los autores en un solo array
  return Object.values(state.blueprints.byAuthor).flat();
};

export const selectTop5Blueprints = createSelector(
  [selectAllBlueprints],
  (blueprints) => {
    // Ordena por cantidad de puntos (descendente) y toma los primeros 5
    return blueprints
      .slice() // copia para no mutar
      .sort((a, b) => (b.points?.length || 0) - (a.points?.length || 0))
      .slice(0, 5);
  }
);
