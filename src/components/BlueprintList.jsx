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
    <div className="container mt-4">
      <h2 className="mb-4">
        Plano actual: {nombrePlano ? nombrePlano : 'Ninguno seleccionado'}
      </h2>
      <div className="row">
        {items.map((bp) => (
          <div key={bp.name} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{bp.name}</h5>
                <p className="card-text">
                  <strong>Autor:</strong> {bp.author}
                </p>
                <p className="card-text">
                  <strong>Puntos:</strong> {bp.points ? bp.points.length : 0}
                </p>
                <button className="btn btn-success btn-lg shadow" onClick={() => seleccionarPlano(bp)}>
                  Ver detalle
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
