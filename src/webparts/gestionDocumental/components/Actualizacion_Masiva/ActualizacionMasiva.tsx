import * as React from 'react';
import { Atom } from 'react-loading-indicators';

import Swal from 'sweetalert2';


interface IActualizacionMasivaProps {
  massiveUpdate: any;
  viewActualizacion: any;
}



export default class Actualizacion extends React.Component<IActualizacionMasivaProps, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      dataRegisterSig: [],
      dataMacroproceso: [],
      dataProceso: [],
      arraySelectMacroprocesoOld: [],
      arraySelectMacroNew: [],
      arraySelectProcesoOld: [],
      arraySelectProcessNew: [],
      NumberRegister: 0,
      flagLoanding: false
    };
  }

  public componentDidMount() {
    this.getItemsMain()
    this.getItemsDataStart();
  }

  public getItemsMain() {
    //lista, campos, filtro, expand, orden, cantidad registros, url
    this.props.massiveUpdate.gettingItemsList('RegistroSig', '', '', '', '', '', '') 
      .then((resRegister: any) => {
        this.setState({ dataRegisterSig: resRegister })
      })
  }

  public getItemsDataStart() {
    this.props.massiveUpdate.gettingItemsList('Macroproceso', '', '', '', '', '', '')
      .then((resMacro: any) => {
        this.setState({ dataMacroproceso: resMacro })
      })
    this.props.massiveUpdate.gettingItemsList('Proceso', '', '', '', '', '', '')
      .then((resProcess: any) => {
        this.setState({ dataProceso: resProcess })
      })
  }

  public filterInputSelect(event: any) {
    if (event.value === 'Macroproceso') {
      this.setState({ arraySelectMacroprocesoOld: this.state.dataRegisterSig, arraySelectMacroNew: this.state.dataMacroproceso })
    } else if (event.value === 'Proceso') {
      this.setState({ arraySelectProcesoOld: this.state.dataRegisterSig, arraySelectProcessNew: this.state.dataProceso })
    }

  }

  public removeDuplicates(array: any) {
    return array.filter((item: any, index: any) => array.indexOf(item) === index);
  }

  public changeItemsUpdate() {
    var idRegistersMacro = new Array();
    var idRegisterProcess = new Array();
    var newCodesMacro = new Array();
    var newCodesProcess = new Array();
    var Elementos = 0;
    var Items = 0;
    var count = 0;

    if (this.state.macroProcesoSelect == 'Macroproceso') {
      var arrayfilterMacroProcessOld = this.state.dataRegisterSig.filter((itm: any) => itm.Macroproceso == this.state.ItemMacroUpdateOld)
      var codeMacroProcess = this.state.dataMacroproceso.filter((x: any) => x.TituloSinNumeral == this.state.newMacroProcessSelect)
      Elementos = arrayfilterMacroProcessOld.length;
      this.setState({ NumberRegister: Elementos })
      for (let i in arrayfilterMacroProcessOld) {
        idRegistersMacro.push(arrayfilterMacroProcessOld[i].ID)
        newCodesMacro.push(this.changeFirstThreeChars(arrayfilterMacroProcessOld[i].CodigoDocumento, codeMacroProcess[0].CodigoMacroproceso))
      }

      for (var j in idRegistersMacro) {
        var mtDataCode = {
          Macroproceso: this.state.newMacroProcessSelect,
          CodigoDocumento: newCodesMacro[j]
        }
        this.setState({ flagLoanding: true })
        this.props.massiveUpdate.updateItemList('RegistroSig', idRegistersMacro[j], mtDataCode)
          .then((res: any) => {

            if (res && count >= Elementos - 1) {
              this.setState({ flagLoanding: false })
              Swal.fire("Información!", "Registro(s) Modificado exitosamente!", "success");
              this.props.viewActualizacion()
            }
            count++;

          })

      }


    } else if (this.state.macroProcesoSelect == 'Proceso') {
      var arrayFilterProcessOld = this.state.dataRegisterSig.filter((it: any) => it.Proceso == this.state.ItemProcessUpdateOld)
      var codeProcess = this.state.dataProceso.filter((y: any) => y.Title == this.state.newProcessSelect)
      Items = arrayFilterProcessOld.length;
      this.setState({ NumberRegister: Items })
      for (let a in arrayFilterProcessOld) {
        idRegisterProcess.push(arrayFilterProcessOld[a].ID)
        newCodesProcess.push(this.updateStringCodeDocument(arrayFilterProcessOld[a].CodigoDocumento, codeProcess[0].CodigoProceso))
      }

      for (var b = 0; b <= idRegisterProcess.length; b++) {
        var dataCodeP = {
          Proceso: this.state.newProcessSelect,
          CodigoDocumento: newCodesProcess[b]
        }
        this.setState({ flagLoanding: true })
        this.props.massiveUpdate.updateItemList('RegistroSig', idRegisterProcess[b], dataCodeP)
          .then((res: any) => {

            if (res && count >= Items - 1) {
              this.setState({ flagLoanding: false })
              Swal.fire("Información!", "Registro(s) Modificado exitosamente!", "success");
              this.props.viewActualizacion()
            }
            count++;
          })

      }

    }

  }

  public changeFirstThreeChars(str: string, newChars: string) {
    if (str.length < 3) {
      return newChars + str.slice(str.length);
    }
    return newChars + str.slice(3);
  }

  public updateStringCodeDocument(codeOld: any, codeProce: any) {
    const starString = codeOld.slice(0, 3);
    const middleString = codeProce;
    const endString = codeOld.slice(codeOld.indexOf('-'));
    return starString + middleString + endString;
  }


  public inputChange(targetInput: any) {
    var value = targetInput.value;
    var name = targetInput.name;
    this.setState({
      [name]: value
    })

  }

  public render(): React.ReactElement<IActualizacionMasivaProps> {
    return (
      <section>
        <div>
          {this.state.flagLoanding ?
            <div className='row' >
              <div className='d-flex justify-content-center'>
                <Atom color="#b91c19" size="large" text="Procesando..." textColor="#b91c19" />
              </div>

            </div>
            :
            <div className='container'>
              <div className="card">
                <div className="card-header">
                  <div className="form-group row">
                    <div className="tituloFront">
                      <h4 className="tituloF">
                        Actualización Masiva
                      </h4>
                    </div>
                  </div>
                  <br />
                  <div className='row'>
                    <div className='d-flex justify-content-center'><span className='nota'>  Nota: Seleccione el tipo de cambio a realizar! </span> </div>
                  </div>
                </div>
                <br />
                <div className="card-body">
                  <div className="form-group">
                    <label >Tipo de Cambio<span className="inputRequired">*</span></label>
                    <select className="form-select NewRequired" name="macroProcesoSelect" value={this.state.macroProcesoSelect} onChange={(e) => { this.inputChange(e.target), this.filterInputSelect(e.target) }}>
                      <option value="Seleccione..." disabled selected>Seleccione..</option>
                      <option value="Macroproceso">Macroproceso</option>
                      <option value="Proceso">Proceso</option>
                    </select>
                  </div>
                  <br />
                  {this.state.macroProcesoSelect ?

                    <div>
                      {this.state.macroProcesoSelect == 'Macroproceso' ?
                        <div className="form-group">
                          <p>Anterior Macroproceso<span className="inputRequired">*</span></p>
                          <select className="form-select NewRequired" name="ItemMacroUpdateOld" value={this.state.ItemMacroUpdateOld} onChange={(e) => { this.inputChange(e.target) }}>
                            <option value="Seleccione..." disabled selected>Seleccione..</option>
                            {this.state.arraySelectMacroprocesoOld && this.state.arraySelectMacroprocesoOld.length > 0 ?
                              this.removeDuplicates(this.state.arraySelectMacroprocesoOld.map((M: any) => M.Macroproceso)).map((titulo: any) => (
                                <option value={titulo}>
                                  {titulo}
                                </option>
                              )) : null
                            }
                          </select>
                        </div>
                        : null}
                      {this.state.macroProcesoSelect == 'Proceso' ?
                        <div className="form-group">
                          <p>Anterior Proceso<span className="inputRequired">*</span></p>
                          <select className="form-select NewRequired" name="ItemProcessUpdateOld" value={this.state.ItemProcessUpdateOld} onChange={(e) => { this.inputChange(e.target) }}>
                            <option value="Seleccione..." disabled selected>Seleccione..</option>
                            {this.state.arraySelectProcesoOld && this.state.arraySelectProcesoOld.length > 0 ?
                              this.removeDuplicates(this.state.arraySelectProcesoOld.map((T: any) => T.Proceso)).map((titulo: any) => (
                                <option value={titulo}>
                                  {titulo}
                                </option>
                              )) : null
                            }
                          </select>
                        </div>
                        : null
                      }
                      <br />
                      <div>
                        <hr />
                      </div>
                      <br />
                      {this.state.macroProcesoSelect == 'Macroproceso' ?
                        <div className="form-group">
                          <label >Nuevo Macroproceso<span className="inputRequired">*</span></label>
                          <select className="form-select NewRequired" name="newMacroProcessSelect" value={this.state.newMacroProcessSelect} onChange={(e) => { this.inputChange(e.target) }}>
                            <option value="Seleccione..." disabled selected>Seleccione..</option>
                            {this.state.arraySelectMacroNew && this.state.arraySelectMacroNew.length > 0 ?
                              this.state.arraySelectMacroNew.map((M: any) => (
                                <option value={M.TituloSinNumeral}>
                                  {M.TituloSinNumeral}
                                </option>
                              )) : null
                            }
                          </select>
                        </div>
                        : null
                      }

                      {this.state.macroProcesoSelect == 'Proceso' ?
                        <div className="form-group">
                          <label >Nuevo Proceso<span className="inputRequired">*</span></label>
                          <select className="form-select NewRequired" name="newProcessSelect" value={this.state.newProcessSelect} onChange={(e) => { this.inputChange(e.target) }}>
                            <option value="Seleccione..." disabled selected>Seleccione..</option>
                            {this.state.arraySelectProcessNew && this.state.arraySelectProcessNew.length > 0 ?
                              this.state.arraySelectProcessNew.map((M: any) => (
                                <option value={M.Title}>
                                  {M.Title}
                                </option>
                              )) : null
                            }
                          </select>
                        </div>
                        : null
                      }
                      <br />
                      <div>
                        <button className='btn btn-outline-danger' value={this.state.save} onClick={() => { this.changeItemsUpdate() }}>
                          Actualizar
                        </button>
                      </div>
                      <br />


                      <div className='row'>
                        <table className='d-flex justify-content-center tabInform'>
                          <tbody>
                            <tr>
                              <td>Registros Encontrados</td>
                              <td>{this.state.NumberRegister}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    : null
                  }
                  <br />
                  <div>
                    <button className='btn btn-outline-secondary' onClick={() => { this.props.viewActualizacion()}}>
                      Regresar
                    </button>

                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </section>
    );
  }
}

