import * as React from 'react';
import { sp } from '@pnp/sp/presets/all';

// Definición de las interfaces para Props y State
interface IActualizacionMasivaProps {
  massiveUpdateDev: {
    gettingItemsList: (listName: string, select: string, expand: string, filter: string, orderby: string, top: string, siteUrl: string) => Promise<any[]>;
  };
  viewActualizacion: any; // Ajusta este tipo si tienes una definición más específica
}

interface State {
  itemsRegistrosAll: any[];
  macroprocesos: any[];
  procesos: any[];
  selectedItems: number[];
  massUpdateMacro: number | null;
  massUpdateProceso: number | null;
  individualUpdates: { [key: number]: { macro?: number; proceso?: number } };
  filterMacro: string | null;
  filterProceso: string | null;
  searchText: string;
  currentPage: number;
  itemsPerPage: number;
}

interface IRegistroSigItem {
  ID: number;
  Title: string;
  Macroproceso: string; // O el tipo de dato real si es un lookup o similar
  Proceso: string;     // O el tipo de dato real
  CodigoDocumento: string;
  // Añade otras propiedades si existen en tus ítems de SharePoint
}


class MassEditRegistroSig extends React.Component<IActualizacionMasivaProps, State> {
  constructor(props: IActualizacionMasivaProps) {
    super(props);
    this.state = {
      itemsRegistrosAll: [],
      macroprocesos: [],
      procesos: [],
      selectedItems: [],
      massUpdateMacro: null,
      massUpdateProceso: null,
      individualUpdates: {},
      filterMacro: null,
      filterProceso: null,
      searchText: '',
      currentPage: 1,
      itemsPerPage: 10,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  public loadData = async () => {
    try {
      const [registros, macros, procesos] = await Promise.all([
        this.props.massiveUpdateDev.gettingItemsList('RegistroSig', 'ID,Title,Macroproceso,Proceso,CodigoDocumento', '', '', '', '', 'https://claromovilco.sharepoint.com/sites/PortaldeProcesosyMejoracontinua/DesarrolloProcesos'),
        this.props.massiveUpdateDev.gettingItemsList('Macroproceso', 'ID,Title,TituloSinNumeral,CodigoMacroproceso', '', '', '', '', 'https://claromovilco.sharepoint.com/sites/PortaldeProcesosyMejoracontinua/DesarrolloProcesos'),
        this.props.massiveUpdateDev.gettingItemsList('Proceso', 'ID,Title,Macroproceso/Id,Macroproceso/TituloSinNumeral,CodigoProceso', '', 'Macroproceso', '', '', 'https://claromovilco.sharepoint.com/sites/PortaldeProcesosyMejoracontinua/DesarrolloProcesos')
      ]);

      this.setState({
        itemsRegistrosAll: registros,
        macroprocesos: macros,
        procesos: procesos
      });
    } catch (err) {
      console.error("Error al cargar datos: ", err);
    }
  };

  public handleCheckboxChange = (id: number) => {
    this.setState(prev => ({
      selectedItems: prev.selectedItems.includes(id)
        ? prev.selectedItems.filter(i => i !== id)
        : [...prev.selectedItems, id]
    }));
  };

  public handleIndividualChange = (id: number, type: 'macro' | 'proceso', value: number) => {
    this.setState(prev => ({
      individualUpdates: {
        ...prev.individualUpdates,
        [id]: {
          ...prev.individualUpdates[id],
          [type]: value
        }
      }
    }));
  };

  public handleMassUpdate = async () => {
    const { massUpdateMacro, massUpdateProceso, selectedItems, macroprocesos, procesos, itemsRegistrosAll } = this.state;

    if (massUpdateMacro === null || massUpdateProceso === null) {
      alert("Selecciona Macroproceso y Proceso para la edición masiva.");
      return;
    }

    const selectedMacro = macroprocesos.find(m => m.Id === massUpdateMacro);
    const selectedProceso = procesos.find(p => p.Id === massUpdateProceso);

    if (!selectedMacro || !selectedProceso) {
      alert("No se pudo encontrar el texto o código para el Macroproceso o Proceso seleccionado.");
      return;
    }

    try {
      await Promise.all(selectedItems.map(id => {
        const currentItem = itemsRegistrosAll.find(item => item.Id === id);
        if (!currentItem) {
          console.warn(`Ítem con ID ${id} no encontrado para actualización masiva.`);
          return Promise.resolve();
        }

        // ***** LÓGICA REVISADA PARA CONSTRUIR EL NUEVO CODIGO DOCUMENTO (MASIVO) *****
        let newCodigoDocumento = '';
        const currentCodigoDocumento = currentItem.CodigoDocumento || '';

        // Buscar la posición del ÚNICO guion que separa el prefijo del sufijo
        const dashIndex = currentCodigoDocumento.indexOf('-');

        let suffix = '';
        if (dashIndex !== -1) {
          // Si hay un guion, el sufijo es desde ahí hasta el final
          suffix = currentCodigoDocumento.substring(dashIndex); // Esto incluye el guion
        }

        // Construir el nuevo código: CodigoMacroproceso + CodigoProceso (sin guion intermedio) + Sufijo Original
        newCodigoDocumento = `${selectedMacro.CodigoMacroproceso}${selectedProceso.CodigoProceso}${suffix}`;

        return sp.web.getList('/sites/PortaldeProcesosyMejoracontinua/DesarrolloProcesos/Lists/RegistroSig')
          .items.getById(id).update({
            Macroproceso: selectedMacro.TituloSinNumeral,
            Proceso: selectedProceso.Title,
            CodigoDocumento: newCodigoDocumento // Actualizar el campo CodigoDocumento
          });
      }));
      alert("Actualización masiva completada.");
      await this.loadData();
      this.setState({ selectedItems: [], massUpdateMacro: null, massUpdateProceso: null });
    } catch (err) {
      console.error("Error en actualización masiva:", err);
    }
  };

  public handleIndividualUpdate = async (id: number) => {
    const { individualUpdates, macroprocesos, procesos, itemsRegistrosAll } = this.state;
    const update = individualUpdates[id];

    if (!update?.macro || !update?.proceso) {
      alert("Selecciona ambos valores para actualizar.");
      return;
    }

    const selectedMacro = macroprocesos.find(m => m.Id === update.macro);
    const selectedProceso = procesos.find(p => p.Id === update.proceso);

    if (!selectedMacro || !selectedProceso) {
      alert("No se pudo encontrar el texto o código para el Macroproceso o Proceso seleccionado individualmente.");
      return;
    }

    const currentItem = itemsRegistrosAll.find(item => item.Id === id);
    if (!currentItem) {
      alert("Ítem no encontrado para actualización.");
      return;
    }

    // ***** LÓGICA REVISADA PARA CONSTRUIR EL NUEVO CODIGO DOCUMENTO (INDIVIDUAL) *****
    let newCodigoDocumento = '';
    const currentCodigoDocumento = currentItem.CodigoDocumento || '';

    // Buscar la posición del ÚNICO guion que separa el prefijo del sufijo
    const dashIndex = currentCodigoDocumento.indexOf('-');

    let suffix = '';
    if (dashIndex !== -1) {
      // Si hay un guion, el sufijo es desde ahí hasta el final
      suffix = currentCodigoDocumento.substring(dashIndex); // Esto incluye el guion
    }

    // Construir el nuevo código: CodigoMacroproceso + CodigoProceso (sin guion intermedio) + Sufijo Original
    newCodigoDocumento = `${selectedMacro.CodigoMacroproceso}${selectedProceso.CodigoProceso}${suffix}`;

    try {
      await sp.web.getList('/sites/PortaldeProcesosyMejoracontinua/DesarrolloProcesos/Lists/RegistroSig')
        .items.getById(id).update({
          Macroproceso: selectedMacro.TituloSinNumeral,
          Proceso: selectedProceso.Title,
          CodigoDocumento: newCodigoDocumento
        });
      alert(`Registro ${id} actualizado.`);
      await this.loadData();
    } catch (err) {
      console.error(`Error al actualizar ${id}:`, err);
    }
  };

  public handleFilterMacroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ filterMacro: e.target.value || null, filterProceso: null });
  };

  public handleFilterProcesoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ filterProceso: e.target.value || null });
  };

  public handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchText: e.target.value, currentPage: 1 });
  };

  public handlePageChange = (direction: 'next' | 'prev') => {
    this.setState(prev => {
      // Recalculamos los ítems filtrados basándonos en el estado 'prev'
      const currentFilteredItems = this.state.itemsRegistrosAll.filter(item => {
        const macroMatch = !prev.filterMacro || item.Macroproceso === prev.filterMacro;
        const procesoMatch = !prev.filterProceso || item.Proceso === prev.filterProceso;
        const searchMatch =
          !prev.searchText ||
          (item.Title?.toLowerCase().includes(prev.searchText.toLowerCase()) ||
            item.Macroproceso?.toLowerCase().includes(prev.searchText.toLowerCase()) ||
            item.Proceso?.toLowerCase().includes(prev.searchText.toLowerCase()) ||
            item.CodigoDocumento?.toLowerCase().includes(prev.searchText.toLowerCase()));
        return macroMatch && procesoMatch && searchMatch;
      });

      // Calculamos el total de páginas con los ítems filtrados actuales
      const totalPages = Math.ceil(currentFilteredItems.length / prev.itemsPerPage);

      const newPage =
        direction === 'next'
          ? Math.min(prev.currentPage + 1, totalPages)
          : Math.max(prev.currentPage - 1, 1);
      return { currentPage: newPage };
    });
  };

  render() {
    const {
      itemsRegistrosAll, macroprocesos, procesos,
      selectedItems, massUpdateMacro, massUpdateProceso,
      individualUpdates, filterMacro, filterProceso,
      searchText, currentPage, itemsPerPage
    } = this.state;

    const uniqueFilterMacroprocesos = Array.from(new Set(itemsRegistrosAll.map(item => item.Macroproceso).filter(Boolean)));
    const uniqueFilterProcesos = Array.from(new Set(
      itemsRegistrosAll
        .filter(item => !filterMacro || item.Macroproceso === filterMacro)
        .map(item => item.Proceso)
        .filter(Boolean)
    ));

    // Aplicar filtros y búsqueda
    const filteredItems = itemsRegistrosAll.filter(item => {
      const macroMatch = !filterMacro || item.Macroproceso === filterMacro;
      const procesoMatch = !filterProceso || item.Proceso === filterProceso;
      const searchMatch =
        !searchText ||
        (item.Title?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.Macroproceso?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.Proceso?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.CodigoDocumento?.toLowerCase().includes(searchText.toLowerCase()));
      return macroMatch && procesoMatch && searchMatch;
    });

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    return (
      <div className="container mt-4">
        <div className="card">
          <div className="card-header">
            <div className="form-group row">
              <div className="tituloFront">
                <h4 className="tituloF">
                  Actualización Individual o Filtros
                </h4>
              </div>
            </div>
          </div>
          {/* Sección de Filtros de Macroproceso y Proceso */}
          <div className="card-body">
            <div className="row mb-3">
              <div className="col">
                <label>Filtrar Macroproceso</label>
                <select className="form-control" value={filterMacro || ''} onChange={this.handleFilterMacroChange}>
                  <option value="">Seleccione</option>
                  {uniqueFilterMacroprocesos.map((macroText: string, index: number) => (
                    <option key={index} value={macroText}>{macroText}</option>
                  ))}
                </select>
              </div>
              <div className="col">
                <label>Filtrar Proceso</label>
                <select className="form-control" value={filterProceso || ''} onChange={this.handleFilterProcesoChange}>
                  <option value="">Seleccione</option>
                  {uniqueFilterProcesos.map((procesoText: string, index: number) => (
                    <option key={index} value={procesoText}>{procesoText}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <hr />
            </div>
            {/* Sección de Actualización Masiva */}
            <div className="row mb-3">
              <div className="col">
                <label>Macroproceso (masivo)</label>
                <select className="form-control" value={massUpdateMacro || ''} onChange={e => this.setState({ massUpdateMacro: Number(e.target.value) })}>
                  <option value="">Seleccione</option>
                  {macroprocesos.map(m => (
                    <option key={m.Id} value={m.Id}>{m.TituloSinNumeral}</option>
                  ))}
                </select>
              </div>
              <div className="col">
                <label>Proceso (masivo)</label>
                <select className="form-control" value={massUpdateProceso || ''} onChange={e => this.setState({ massUpdateProceso: Number(e.target.value) })}>
                  <option value="">Seleccione</option>
                  {procesos.filter(p => p.Macroproceso?.Id === massUpdateMacro).map(p => (
                    <option key={p.Id} value={p.Id}>{p.Title}</option>
                  ))}
                </select>
              </div>
              <div className="col d-flex align-items-end">
                <button className="btn btn-outline-danger" onClick={this.handleMassUpdate}>Actualizar seleccionados</button>
              </div>
            </div>

            <div className="col">
              <label>Buscar</label>
              <input type="text" className="form-control" value={searchText} onChange={this.handleSearchChange} placeholder="Buscar por título o código..." />
            </div>
          </div>

          {/* Tabla de Registros SIG */}
          <table className="table table-bordered">
            <thead>
              <tr>
                <th></th>
                <th>Título</th>
                <th>Macroproceso</th>
                <th>Proceso</th>
                <th>Código Documento</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item: IRegistroSigItem) => ( // Tipamos explícitamente 'item'
                <tr key={item.ID}> {/* Usamos item.ID para la clave, asumiendo que es único */}
                  <td><input type="checkbox" checked={selectedItems.includes(item.ID)} onChange={() => this.handleCheckboxChange(item.ID)} /></td>
                  <td>{item.Title}</td>
                  <td>
                    {item.Macroproceso || 'N/A'}<br />
                    <select
                      className="form-control"
                      value={individualUpdates[item.ID]?.macro || ''}
                      onChange={e => this.handleIndividualChange(item.ID, 'macro', Number(e.target.value))}
                    >
                      <option value="">Seleccione</option>
                      {macroprocesos.map(m => <option key={m.Id} value={m.Id}>{m.TituloSinNumeral}</option>)}
                    </select>
                  </td>
                  <td>
                    {item.Proceso || 'N/A'}<br />
                    <select
                      className="form-control"
                      value={individualUpdates[item.ID]?.proceso || ''}
                      onChange={e => this.handleIndividualChange(item.ID, 'proceso', Number(e.target.value))}
                    >
                      <option value="">Seleccione</option>
                      {procesos.filter(p =>
                        p.Macroproceso?.Id === (individualUpdates[item.ID]?.macro || macroprocesos.find(m => m.TituloSinNumeral === item.Macroproceso)?.Id)
                      ).map(p => (
                        <option key={p.Id} value={p.Id}>{p.Title}</option>
                      ))}
                    </select>
                  </td>
                  <td>{item.CodigoDocumento || 'N/A'}</td>
                  <td><button className="btn btn-outline-success" onClick={() => this.handleIndividualUpdate(item.ID)}>Actualizar</button></td>
                </tr>
              ))}

            </tbody>
          </table>
          {/* Paginación */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button className="btn btn-secondary" disabled={currentPage === 1} onClick={() => this.handlePageChange('prev')}>Anterior</button>
            <span>Página {currentPage} de {totalPages}</span>
            <button className="btn btn-secondary" disabled={currentPage === totalPages} onClick={() => this.handlePageChange('next')}>Siguiente</button>
          </div>
        </div>
      </div>


    );
  }
}

export default MassEditRegistroSig;