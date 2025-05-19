import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker"
import Swal from 'sweetalert2';
import Select from 'react-select';
const jQuery = require("jquery");



interface IComunicadosProps {
    Comunica: any;
    context: WebPartContext;
    viewComunicados: any
}

const siteBase = `${window.location.origin}/sites/PortaldeProcesosyMejoracontinua`;

interface IComunicadosState {
  ArrayRegistersSigTitle: { label: string }[];
  arrayRegisterAll: any[];
  itemSearch: string;
  arrayTableCommunication: any[];
  TipoProcesoMacro: string;
  resPeoplePick: any[];
  defaultSelectedUsers: any[];
  clearPickerKey: number;
  [key: string]: any;
  selectedRegister:{ value: string; label: string };
}

export default class ComunicadosDocumentos extends React.Component<IComunicadosProps, IComunicadosState> {

    constructor(props: IComunicadosProps) {
        super(props);

        this.state = {
            ArrayRegistersSigTitle: [],
            arrayRegisterAll: [],
            itemSearch: '',
            arrayTableCommunication: [],
            TipoProcesoMacro: '',
            resPeoplePick: [],
            defaultSelectedUsers: [],
            clearPickerKey: 0,
            selectedRegister: { value: 'Digite o seleccione un documento', label: 'Digite o seleccione un documento' }
        };

    }

    componentDidMount(): void {
        this.getItemsRegisterSig();

    }

    public getItemsRegisterSig() {
        var arraySelect = new Array();

        this.props.Comunica.getItemsList('RegistroSig')
            .then((resRegisterSig: any) => {
                if (resRegisterSig.length > 0) {
                    resRegisterSig.map((Register: any) => (
                        arraySelect.push({ label: Register.Title })
                    ))
                }
                this.setState({ ArrayRegistersSigTitle: arraySelect, arrayRegisterAll: resRegisterSig });

            })
    }

    public textareaChange(target: any) {
        var value = target.value;
        var name = target.name;
        this.setState({
            [name]: value,

        });
    }

    public saveCommunication() {
        var tagTable = jQuery('#DivContent').html()
        var idDestinatarios = new Array();
        var areaDestinatarios = '';


        if (this.state.resPeoplePick.length > 0) {
            this.state.resPeoplePick.forEach((Dest: any) => {
                idDestinatarios.push(Dest.id)
            });

        }

        if (this.state.arrayTableCommunication.length > 0) {
            var direcciones = this.state.arrayTableCommunication.map((A: any) => A.Direcciones).join(" ")
            var gerencias = this.state.arrayTableCommunication.map((B: any) => B.Gerencias).join(" ")
            areaDestinatarios = direcciones.concat(gerencias)
        }
        var metadata = {
            Title: 'Comunicado',
            DestinatariosId: { "results": idDestinatarios },
            Area: areaDestinatarios,
            TablaRegistros: tagTable
        };

        Swal.fire({
            title: "Esta seguro de enviar este comunicado?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Enviar!"
        }).then((result) => {
            if (result.isConfirmed) {
                this.props.Comunica.insertItemList('Comunicados', metadata)
                    .then((res: any) => {
                        this.setState((prev:any) => ({
                            selectedRegister: { value: 'Digite o seleccione un documento', label: 'Digite o seleccione un documento' },
                            resPeoplePick: [] as any[],
                             clearPickerKey: prev.clearPickerKey + 1
                        }), () => {
                            jQuery('#tableComunicado tbody').empty();
                            Swal.fire("Información!", "Registro Enviado", "success"); 
                        });
                    });
            }
        });
    }

    public inputChangeSelect = (selectedOption: any) => {
        this.setState({ itemSearch: selectedOption.label, selectedRegister: selectedOption }); 
    };


    public divChangeTable(eventTag: any) {
        this.setState({ tagTable: eventTag }, () => { console.log(this.state.tagTable); })
    }

    public async searchDocument() {
        const { arrayRegisterAll, itemSearch } = this.state;
        const newArrayResponse = new Array();

        const foundItem = arrayRegisterAll.find((item: any) => item.Title === itemSearch);

        if (foundItem) {
            try {
                //lista, campos, filtro, expand, orden, cantidad registros, url
                const resMacro = await this.props.Comunica.gettingItemsList(
                    'Macroproceso', 'ID,TituloSinNumeral,ImagenMapaProceso,TipoProceso', `TituloSinNumeral eq '${foundItem.Macroproceso}'`, '', '', '', 'https://claromovilco.sharepoint.com/sites/PortaldeProcesosyMejoracontinua'
                );
                foundItem.imagenMacroproceso = '';
                foundItem.imagenMacroprocesoBase64 = ''; // Campo para almacenar Base64

                if (resMacro.length > 0) {
                    const imageUrl = resMacro[0].ImagenMapaProceso?.Url; // Obtén la URL directamente
                    foundItem.TipoProceso = resMacro[0].TipoProceso;

                    if (imageUrl) {
                        foundItem.imagenMacroproceso = imageUrl; // Guarda la URL
                    } else {
                        foundItem.imagenMacroproceso = null;
                    }
                } else {
                    foundItem.imagenMacroproceso = null;
                }

                newArrayResponse.push(foundItem);

                this.setState((prevState: any) => ({
                    arrayTableCommunication: [...prevState.arrayTableCommunication, ...newArrayResponse],
                    TipoProcesoMacro: foundItem.TipoProceso
                }));

            } catch (error) {
                console.error("Error obteniendo macroproceso o convirtiendo imagen:", error);
            }
        }
    }

    public deleteRowTable(rowItem: any) {
        this.setState((prevState: any) => ({
            arrayTableCommunication: prevState.arrayTableCommunication.filter((item: any) => item.ID !== rowItem)
        }));
    }


    private _getPeoplePickerItems(items: any[]) {
        if (items.length > 0) {
            this.setState({ resPeoplePick: items });
        }
    }

    public render(): React.ReactElement<IComunicadosProps> {
        const peoplePickerContext: IPeoplePickerContext = {
                    absoluteUrl: this.props.context.pageContext.web.absoluteUrl,
                    spHttpClient: this.props.context.spHttpClient,
                    msGraphClientFactory: this.props.context.msGraphClientFactory
};
        return (
            <section>
                <div>
                    <div className='container'>
                        <div className="card">
                            <div className="card-header">
                                <div className="tituloFront">
                                    <h4 className="tituloF">Comunicados</h4>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label>Destinatarios</label>
                                    <br />
                                    <div>
                                        <div>
                                            <PeoplePicker
                                                key={this.state.clearPickerKey}
                                                context={peoplePickerContext}
                                                personSelectionLimit={500}
                                                groupName={""} // Leave this blank in case you want to filter from all users
                                                showtooltip={true}
                                                disabled={false}
                                                ensureUser={true}
                                                onChange={(el: any) => { this._getPeoplePickerItems(el) }}
                                                defaultSelectedUsers={this.state.resPeoplePick}
                                                required={true}
                                                searchTextLimit={3}
                                                showHiddenInUI={false}
                                                principalTypes={[PrincipalType.User]}
                                                resolveDelay={1000} />

                                        </div>
                                    </div>
                                </div>
                                <br />
                                <div className="form-group">
                                    <label>Buscar Documentos</label>
                                    <br />
                                    <Select
                                         value={this.state.selectedRegister}
                                        defaultValue={[]}
                                        name="segmentSelect"
                                        options={this.state.ArrayRegistersSigTitle}
                                        className="basic-single-select"
                                        classNamePrefix="select"
                                        onChange={(e:any) => this.inputChangeSelect(e)}
                                        placeholder="Digite el nombre del documento"

                                    />
                                </div>
                                <br />

                                <div className='d-flex justify-content-end'>
                                    <button className='btn btn-outline-danger' onClick={() => { this.searchDocument() }}> Cargar </button>
                                </div>
                                <br />
                                {this.state.arrayTableCommunication.length > 0 ?
                                    <div className="tableComunicado" id='DivContent' >
                                        <table id="tableComunicado">
                                            <thead style={this.state.TipoProcesoMacro === 'Valor' ? { backgroundColor: '#006E83', color: 'aliceblue' } : { backgroundColor: '#FF810F', color: 'aliceblue' }}>
                                                <tr>
                                                    <th scope="col" >Macroproceso</th>
                                                    <th scope="col" >Nombre del Documento</th>
                                                    <th scope="col" >Objetivo</th>
                                                    <th scope="col" >Versión</th>
                                                    <th scope="col" >Cambio realizado </th>
                                                    <th scope="col" >Dueño</th>
                                                    <th scope="col" >Link</th>
                                                    <th scope="col" ></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.arrayTableCommunication && this.state.arrayTableCommunication.length > 0 ?
                                                    this.state.arrayTableCommunication.map((items: any, index: any) => (

                                                        <tr id={items.ID}>
                                                            <td style={{ textAlign: "center" }}>
                                                                <img src={items.imagenMacroproceso} alt="Imagen Macroproceso" width="80" />
                                                            </td>
                                                            <td style={this.state.TipoProcesoMacro === 'Valor' ? { backgroundColor: '#006E83', color: 'aliceblue' } : { backgroundColor: '#FF810F', color: 'aliceblue' }}>{items.Title}</td>
                                                            <td>{<textarea cols={30} rows={5} className="form-control NewRequired" name={`Objetivo${index + 1}`} value={this.state[`Objetivo${index + 1}`]} onChange={(e) => { this.textareaChange(e.target) }} placeholder="Ingrese el objetivo" ></textarea>}</td>
                                                            <td style={{textAlign: "center"}}>{items.Version}</td>
                                                            <td>{<textarea cols={30} rows={5} className="form-control NewRequired" name={`Cambio${index + 1}`} value={this.state[`Cambio${index + 1}`]} onChange={(e) => { this.textareaChange(e.target) }} placeholder="Ingrese el cambio realizado" ></textarea>}</td>
                                                            <td>{items.Lider}</td>
                                                            <td><div>{<a href={decodeURIComponent(items.UrlDocumento)}><img src={`${siteBase}/Imagenes/claro-ico.png`} width="17px" /></a>}</div></td>
                                                            <td style={{ textAlign: "center" }}><div onClick={() => { this.deleteRowTable(items.ID) }}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                                                                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                                                                </svg>
                                                            </div></td> 
                                                        </tr>
                                                    ))
                                                    : null
                                                }
                                            </tbody>
                                        </table>

                                    </div>
                                    : null
                                }

                                <br />
                                <br />
                                <hr />
                                <div>
                                    <button className='btn btn-outline-secondary' onClick={() => { this.props.viewComunicados() }}>
                                        Regresar
                                    </button>
                                    <button className='btn btn-outline-danger' value={this.state.save} onClick={() => { this.saveCommunication() }}>
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}


