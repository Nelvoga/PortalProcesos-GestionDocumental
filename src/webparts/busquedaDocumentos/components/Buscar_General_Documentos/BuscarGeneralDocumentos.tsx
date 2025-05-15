import * as React from 'react';
import Select from 'react-select';

export interface IBusquedaGeneralDocumentosProps {
    Search: any;
    context: any;
}

export default class BDocumentos extends React.Component<IBusquedaGeneralDocumentosProps, any> {
    constructor(props: IBusquedaGeneralDocumentosProps) {
        super(props);
        this.state = {
            ArrayRegistersSig: [],
            itemSearch: '',
            ArrayRegisterSigAll: [],
            resultTableView: [],

        };
    }

    componentDidMount(): void {
        this.getItemsRegisterSig();

    }

    public getItemsRegisterSig() {
        var arraySelect = new Array();

        this.props.Search.gettingItemsList('RegistroSig', '', `EstadoRegistro eq 'Publicado'`, '')
            .then((resRegisterSig: any) => {
                if (resRegisterSig.length > 0) {
                    resRegisterSig.map((Register: any) => (
                        arraySelect.push({ label: Register.Title }) 
                    ))
                }
                this.setState({ ArrayRegistersSig: arraySelect, ArrayRegisterSigAll: resRegisterSig });

            })
    }

    public inputChangeSelect = (selectedOption: any) => {
        this.setState({ itemSearch: selectedOption.label }, () => {
            this.getItemSelect(this.state.itemSearch);
        });
    };

    public getItemSelect = (itemSelect: any) => {
        const items = this.state.ArrayRegisterSigAll.filter((item: any) => item.Title == itemSelect);
        this.setState({ resultTableView: items });
    };

    public render(): React.ReactElement<IBusquedaGeneralDocumentosProps> {
        return (
            <div className="container">
                <div className="row">
                    <img src={`${this.props.context.pageContext.web.absoluteUrl}/Imagenes_Busqueda/Grupo-12.jpg`} alt="" className="responsive-image" />
                </div>
                <div className="row">
                    <div className="tituloFront">
                        <h4 className="tituloF">Busqueda de Documentos</h4>
                    </div>
                </div>
                <div className="form-group">
                    <br />
                    <Select
                        defaultValue={[]}
                        name="segmentSelect"
                        options={this.state.ArrayRegistersSig}
                        className="basic-single-select"
                        classNamePrefix="select"
                        onChange={(e: any) => this.inputChangeSelect(e)}
                        placeholder="Digite el nombre del documento"
                        isClearable
                        styles={{
                            control: (base: any) => ({ ...base, borderRadius: '0.5rem', padding: '2px' }),
                        }}
                    />
                </div>
                <br />
                <br />

                <div className="row">
                    {this.state.resultTableView.length > 0 ? ( 
                        <table id="tableSearch" className="table table-striped table-bordered table-hover uniform-table">

                            <tbody>
                                <tr className="custom-row">
                                    <th colSpan={2} className="custom-header">Resultados de la Busqueda</th>
                                </tr>
                                <br />
                                {this.state.resultTableView && this.state.resultTableView.length > 0 ? (
                                    this.state.resultTableView.map((item: any) => (

                                        <tr key={item.ID} className="custom-row">
                                            <tr className="custom-row">
                                                <td className='row'>
                                                    <a href={decodeURIComponent(item.UrlDocumento)} target="_blank" rel="noreferrer">{item.Title}</a>
                                                </td>
                                            </tr>  
                                            <tr className="custom-row">
                                                <td className='row'>
                                                    <strong>Tipo de Documento: </strong> {item.TipoDocumento}
                                                </td>
                                                <td className='row'>
                                                    <strong> Fecha de Publicación: </strong> {new Date(item.FechaPublicacion).toLocaleDateString()}
                                                </td>

                                            </tr>
                                            <tr className="custom-row">
                                                <td className='row'>
                                                    <strong> Macroproceso: </strong>{item.Macroproceso}

                                                </td>
                                                <td className='row'>
                                                    <strong>Proceso: </strong> {item.Proceso}
                                                </td>

                                            </tr>

                                        </tr>

                                    ))  
                                ) : (
                                    <tr className='custom-row-result'><td colSpan={4}>No se encontraron resultados</td></tr>
                                )}
                            </tbody>
                        </table>
                    ) : null}
                </div>

            </div>
        );
    }
}