import { useDispatch, useSelector } from 'react-redux';
import { setPlanoActual } from '../features/blueprints/blueprintsSlice';

export default function BlueprintList({ items = [], onSelect }) {
  const dispatch = useDispatch();
  const nombrePlano = useSelector(state => state.blueprints.planoActual);
  const status = useSelector(state => state.blueprints.status);
  const error = useSelector(state => state.blueprints.error);

  // Mostrar loading
  if (status === 'loading') {
    return <p>Cargando blueprints...</p>;
  }

  // Mostrar error
  if (error) {
    return <p style={{ color: '#f87171' }}>Error: {error}</p>;
  }

  if (!items.length) return <p>No hay blueprints para este autor.</p>;

  // Función para seleccionar plano y actualizar el estado global
  const seleccionarPlano = (bp) => {
    dispatch(setPlanoActual(bp.name));
    if (onSelect) onSelect(bp);
  };

  return (
    <div>
      <h2>
        Plano actual: {nombrePlano ? nombrePlano : 'Ninguno seleccionado'}
      </h2>
      <div className="grid">
        {items.map((bp) => (
          <div key={bp.name} className="card">
            <h3 style={{ marginTop: 0 }}>{bp.name}</h3>
            <p>
              <strong>Autor:</strong> {bp.author}
            </p>
            <p>
              <strong>Puntos:</strong> {bp.points ? bp.points.length : 0}
            </p>
            <button className="btn primary" onClick={() => seleccionarPlano(bp)}>
              Ver detalle
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
