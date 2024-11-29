import * as React from 'react';
const moment = require('moment');
const jQuery = require("jquery");
import Swal from 'sweetalert2';
import { Modal } from 'react-bootstrap';
import Select from 'react-select';
import ComunicadosDocumentos from '../Comunicados/Comunicados'
import ActualizacionMasiva from '../Actualizacion_Masiva/ActualizacionMasiva';

export interface IAdminDocumentosProps {
  pnp: any;
  context:any;

}



export default class GDocumental extends React.Component<IAdminDocumentosProps, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      ModalTitle: '',
      handleShow: false,
      arraySelectResolutors: [],
      isCheckedL: false,
      isCheckedA: false,
      FilterGerenceSelect: [],
      arraySegment: [],
      arrayNorma: [],
      arrayAddress: [],
      arrayGerence: [],
      arrayLeader: [],
      filterGerenciasFull: [],
      codeDocumentType: '',
      codeDocumentMacroproceso: '',
      codeProcessFinal: '',
      codeDocument: '',
      flagPolitica: false,
      flagProcedimiento: false,
      flagManual: false,
      idProcess: 0,
      codeConsecutive: '',
      editSegment: [],
      idEditRegister: 0,
      save: 'Guardar',
      idEliminar: 0,
      viewTable: true
    }
  }




  async componentDidMount() {
    await this.getItems();
    await this.getItemsSelect()
  }

  async getItems() {
    try {
      jQuery('#tableRegisters').DataTable().destroy();
      this.props.pnp.getItemsList('RegistroSig')
        .then((res: any) => {
          this.setState({ tableRegisterSig: res }, () => { this.IniciaTable('tableRegisters') })
        })
    } catch (error) {
      console.error('Error fetching data:', error);
    }

  }

  async getItemsSelect() {
    try {
      const arraySelect = new Array();
      const arrayDireccion = new Array();;
      const arrayNorma = new Array();;

      const resResolutor = await this.props.pnp.getItemsList('Resolutores', 'ID,Title,Analista/Id,Analista/Title,*', '', 'Analista');
      const filterResolutor = resResolutor.filter((x: any) => x.Rol.includes('Documentos'));
      if (filterResolutor.length > 0) {
        this.setState({ arraySelectResolutors: filterResolutor });
      }

      const resTypeDocument = await this.props.pnp.getItemsList('TipoDocumento', 'ID,Title,Codigo,*', '', '');
      this.setState({ arraySelectTypeDocument: resTypeDocument });

      const resMacroprocess = await this.props.pnp.getItemsList('Macroproceso', 'ID,Title,*', '', '');
      this.setState({ arraySelectMacroprocess: resMacroprocess });

      const resTypeSolution = await this.props.pnp.getItemsList('TipoSolucion', 'ID,Title,*', '', '');
      this.setState({ arraySelectTypeSolution: resTypeSolution });

      const resTypeProcessSox = await this.props.pnp.getItemsList('ProcesoSOX', 'ID,Title,*', '', '');
      this.setState({ arraySelectProcessSox: resTypeProcessSox });

      const resSegment = await this.props.pnp.getItemsList('Segmento', 'ID,Title,*', '', '');
      if (resSegment.length > 0) {
        resSegment.forEach((Segment: any) => {
          arraySelect.push({ value: Segment.Title, label: Segment.Title });
        });
        this.setState({ arraySelectSegmento: arraySelect });
      }

      const resEstado = await this.props.pnp.getItemsList('EstadoDocumento', 'ID,Title,*', '', '');
      this.setState({ arraySelectEstado: resEstado });

      const resNorma = await this.props.pnp.getItemsList('Normas', 'ID,Title,*', '', '');
      if (resNorma.length > 0) {
        resNorma.forEach((Norma: any) => {
          arrayNorma.push({ value: Norma.Title, label: Norma.Title });
        });
        this.setState({ arraySelectNorma: arrayNorma });
      }

      const resDireccion = await this.props.pnp.getItemsList('Direcciones', 'ID,Title,*', '', '');
      if (resDireccion.length > 0) {
        resDireccion.forEach((Direccion: any) => {
          arrayDireccion.push({ value: Direccion.Title, label: Direccion.Title });
        });
        this.setState({ arraySelectDireccion: arrayDireccion });
      }

      const resGerencia = await this.props.pnp.getItemsList('Gerencias', 'ID,Title,Direccion/Title,Direccion/Id,*', '', 'Direccion');
      const arrayGerencia = resGerencia.filter((gerencia: any) => gerencia.DireccionId);
      this.setState({ arraySelectGerencia: arrayGerencia });

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }


  public completeProcess(targetProcess: any) {

    this.props.pnp.getItemsList(`Proceso`, `ID,Title,Macroproceso/Id,Macroproceso/TituloSinNumeral,*`, `Macroproceso/TituloSinNumeral eq '${targetProcess}'`, `Macroproceso`)
      .then((resProcess: any) => {

        this.setState({ arraySelectProcess: resProcess })
      });

  }

  public inputChange(targetInput: any) {
    var value = targetInput.value;
    var name = targetInput.name;
    this.setState({
      [name]: value
    })

  }

  public inputChangeSelect(targetSelectMultiple: any, flagActive: any) {
    var arraySelectFront = new Array();
    targetSelectMultiple.forEach((option: any) => {
      var value = option.value;
      arraySelectFront.push(value)
    })
    if (flagActive.name == 'segmentSelect') {
      this.setState({ arraySegment: arraySelectFront })
    }
    if (flagActive.name == 'direccionesSelect') {
      this.setState({ arrayAddress: arraySelectFront })
    }
    if (flagActive.name == 'gerenciasSelect') {
      this.setState({ arrayGerence: arraySelectFront })
    }
    if (flagActive.name == 'liderSelect') {
      this.setState({ arrayLeader: arraySelectFront })
    }
    if (flagActive.name == 'Norma') {
      this.setState({ arrayNorma: arraySelectFront })
    }
  }

  public inputChangeFile(e: any) {
    var file: File = e.target.files[0];
    this.setState({
      archivo: file
    })

  }

  public handleCheckboxChange = (event: any) => {
    if (event.target.name == 'Link') {
      this.setState({ isCheckedL: event.target.checked, isCheckedA: false });

    } else if (event.target.name == 'Archivo') {
      this.setState({ isCheckedA: event.target.checked, isCheckedL: false });
    }
  }

  public filterGerenceSelect() {
    var filterDirecciones = new Array()
    var auxiliar = new Array()
    var arrayGerenciaFilter = new Array()
    this.state.arrayAddress.forEach((val: any) => {
      filterDirecciones = this.state.arraySelectGerencia.filter((d: any) => d.Direccion.Title == val)
      if (auxiliar.length > 0) {
        filterDirecciones.forEach((value: any) => {
          auxiliar.push(value)
        })
      } else {
        auxiliar = filterDirecciones
      }
    })
    auxiliar.map((Gerencia: any) => (
      arrayGerenciaFilter.push({ value: Gerencia.Title, label: Gerencia.Title })
    ))
    this.setState({ FilterGerenceSelect: arrayGerenciaFilter })

  }

  public filterLiderSelect() {
    var arrayLiderFilter = new Array()
    this.state.arrayGerence.map((lider: any) => (
      arrayLiderFilter.push({ value: lider, label: lider })
    ))
    this.setState({ arrayLiderSelect: arrayLiderFilter })
  }

  public getTypeDocumentCode(evTd: any) {
    var codeTypeDocument = this.state.arraySelectTypeDocument.filter((cTD: any) => cTD.Title == evTd.value);
    this.setState({ codeDocumentType: '-' + codeTypeDocument[0].Codigo }, () => { this.completeCodeDocument() })

  }

  public searchFirtsPartCode(ev: any) {

    var codeSelected = this.state.arraySelectMacroprocess.filter((cS: any) => cS.TituloSinNumeral == ev.value);
    this.setState({ codeDocumentMacroproceso: codeSelected[0].CodigoMacroproceso }, () => { this.completeCodeDocument() })

  }

  public searchCodeProcessComplete(even: any) {
    var codeSelectedProcess = this.state.arraySelectProcess.filter((cSP: any) => cSP.Title == even.value)
    this.setState({ idProcess: codeSelectedProcess[0].ID })
    var codeProcess = codeSelectedProcess[0].CodigoProceso;
    if (this.state.TypeDocumentSelect == 'Politicas') {
      this.setState({ codeConsecutive: codeSelectedProcess[0].contPoliticas + 1 })
      this.setState({ flagPolitica: true })
    }

    if (this.state.TypeDocumentSelect == 'Procedimiento') {
      this.setState({ codeConsecutive: codeSelectedProcess[0].contProcedimiento + 1 });
      this.setState({ flagProcedimiento: true })
    }

    if (this.state.TypeDocumentSelect == 'Manual') {
      this.setState({ codeConsecutive: codeSelectedProcess[0].contManual + 1 });
      this.setState({ flagManual: true })
    }

    this.setState({ codeProcessFinal: codeProcess }, () => { this.completeCodeDocument() })

  }

  public completeCodeDocument() {
    this.setState({ codeDocument: this.state.codeDocumentMacroproceso + this.state.codeProcessFinal + this.state.codeDocumentType + this.state.codeConsecutive })
  }

  public validateInput() {
    var validate = new Array();

    if (this.state.titleDocument == '') validate.push({ campo: 'Titulo del documento', descripcion: "Digite el titulo del documento" });
    if (this.state.resolutorDocument == 'Seleccione...' || this.state.resolutorDocument == null) validate.push({ campo: "Analista", descripcion: "Seleccione el analista" });
    if (this.state.TypeDocumentSelect == 'Seleccione...' || this.state.TypeDocumentSelect == null) validate.push({ campo: "Tipo de Documento", descripcion: "Seleccione el tipo de documento" });
    if (this.state.macroprocessSelect == 'Seleccione...' || this.state.macroprocessSelect == null) validate.push({ campo: "Macroproceso", descripcion: "Seleccione el macroproceso" });
    if (this.state.processSelect == 'Seleccione...' || this.state.processSelect == null) validate.push({ campo: "Proceso", descripcion: "Seleccione el proceso" });
    if (this.state.typeSolutionSelect == 'Seleccione...' || this.state.typeSolutionSelect == null) validate.push({ campo: "Tipo de Solución", descripcion: "Seleccione el tipo de solución" });
    if (this.state.Version == '') validate.push({ campo: "Versión", descripcion: "Digite la version del documento" });
    if (this.state.processSOXSelect == 'Seleccione...' || this.state.processSOXSelect == null) validate.push({ campo: "Proceso SOX", descripcion: "Seleccione el proceso SOX" });
    if (this.state.arraySegment.length == 0) validate.push({ campo: "Segmento", descripcion: "Seleccione los segmento(s)" });
    if (this.state.Estado == 'Seleccione...' || this.state.Estado == null) validate.push({ campo: "Estado", descripcion: "Seleccione el estado del documento" });
    if (this.state.datePublication == 'dd/mm/YYYY' || this.state.datePublication == null) validate.push({ campo: "Fecha de Publicación", descripcion: "Digite la fecha de publicación del documento" });
    if (this.state.arrayNorma.length == 0) validate.push({ campo: "Norma!", descripcion: "Seleccione la(s) norma(s)" });
    if (this.state.isCheckedL == true && this.state.Url == '') validate.push({ campo: "Url del documento", descripcion: "Digite la url del documento" });
    if (this.state.isCheckedA == true && !this.state.archivo) validate.push({ campo: "Archivo", descripcion: "Agregue el archivo a guardar" });
    if (this.state.CasoBPM == '') validate.push({ campo: "Número de caso BMP", descripcion: "Digite el número de caso BPM" });
    if (this.state.arrayAddress.length == 0) validate.push({ campo: "Direcciones", descripcion: "Seleccione la(s) direccione(s)" });
    if (this.state.arrayGerence.length == 0) validate.push({ campo: "Gerencias", descripcion: "Seleccione la(s) gerencia(s)" });
    if (this.state.arrayLeader.length == 0) validate.push({ campo: "Lider", descripcion: "Seleccione la(s) gerencia(s)" });

    if (validate.length > 0) {
      Swal.fire({
        title: "Información!",
        html: "Los siguientes campos no contienen información:<br><br>" +
          validate.map(item => `<span>${item.campo}: ${item.descripcion}</span>`).join('<br>'),
        icon: "success"
      });
    } else {
      this.saveRegister();
    }
  }

  public saveRegister() {
    jQuery('#tableRegisters').DataTable().destroy();
    var TypeDocument = '';
    var urlFile = '';
    if (this.state.isCheckedL == true) {
      TypeDocument = 'Link';
      urlFile = this.state.Url;
    }

    if (this.state.isCheckedA == true) {
      TypeDocument = 'Link';
      urlFile = `https://claromovilco.sharepoint.com/sites/PortaldeProcesosyMejoracontinua/DesarrolloProcesos/Gestion%20Documental/${this.state.archivo.name}`;
    }

    var metadata = {
      Title: this.state.titleDocument,
      Analista: this.state.resolutorDocument,
      TipoDocumento: this.state.TypeDocumentSelect,
      Macroproceso: this.state.macroprocessSelect,
      Proceso: this.state.processSelect,
      TipoSolucion: this.state.typeSolutionSelect,
      CodigoDocumento: this.state.codeDocument,
      Version: this.state.Version,
      ProcesoSOX: this.state.processSOXSelect,
      SegmentoRegistro: this.state.arraySegment.join(';'),
      EstadoRegistro: this.state.Estado,
      Observaciones: this.state.Observaciones,
      FechaPublicacion: this.state.datePublication,
      Norma: this.state.arrayNorma.join(';'),
      TipoDocumentoRegistro: TypeDocument,
      UrlDocumento: urlFile,
      CasoBPM: this.state.caseBMP,
      Direcciones: this.state.arrayAddress.join(';'),
      Gerencias: this.state.arrayGerence.join(';'),
      Lider: this.state.arrayLeader.join(';')
    };

    if (this.state.idEditRegister > 0) {
      Swal.fire({
        title: "¿Está seguro de modificar este registro?",
        text: "Click para confirmar!",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, Modificar"
      }).then((result) => {
        if (result.isConfirmed) {
          this.props.pnp.updateItemList('RegistroSig', this.state.idEditRegister, metadata)
            .then((res: any) => {
              if (this.state.isCheckedA == true && this.state.archivo != '') {
                this.saveFile(this.state.idEditRegister)
              } else {
                Swal.fire("Información!", "Registro Modificado exitosamente!", "success");
              }
              this.setState({
                idEditRegister: 0,
                handleShow: false
              }, () => {
                this.getItems();

                this.formClear();
              });
            });
        }
      });
    } else {
      Swal.fire({
        title: "¿Está seguro de crear este registro?",
        text: "Crear nuevo registro!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, Crear registro!"
      }).then((result) => {
        if (result.isConfirmed) {
          this.props.pnp.insertItemList('RegistroSig', metadata)
            .then((res: any) => {
              this.setState({
                handleShow: false,
                idEditRegister: 0
              })
              if (this.state.isCheckedA == true && this.state.archivo != '') {
                console.log(res);
                this.saveFile(res.ID)
              } else {
                Swal.fire("Información!", "Registro Creado", "success");
              }
              this.saveCounterRegister();
              this.formClear();
              this.getItems();
            });
        }
      });
    }
  }

  public saveFile(IdRegistro: any) {
    let nameFile = this.state.archivo.name;
    this.props.pnp.uploadFile('GestionDocumental/', this.state.archivo, nameFile)
      .then((res: any) => {
        this.props.pnp.updateFieldByUniqueId(res.data.TimeCreated, 'IdRegistroDocumento', IdRegistro, 'GestionDocumental');
        Swal.fire("Información!", "Registro Creado", "success");
      })
  }

  public formClear() {
    this.setState({
      titleDocument: '',
      resolutorDocument: 'Seleccione...',
      TypeDocumentSelect: 'Seleccione...',
      macroprocessSelect: 'Seleccione...',
      processSelect: 'Seleccione...',
      typeSolutionSelect: 'Seleccione...',
      codeDocument: '',
      Version: 0,
      processSOXSelect: 'Seleccione...',
      editSegment: [],
      arraySegment: [],
      Estado: 'Seleccione...',
      Observaciones: '',
      datePublication: '',
      editNorma: [],
      arrayNorma: [],
      isCheckedL: false,
      isCheckedA: false,
      Url: '',
      caseBMP: 0,
      editAdress: [],
      arrayAddress: [],
      editGerence: [],
      arrayGerence: [],
      editLeader: [],
      arrayLeader: []

    })
  }

  public saveCounterRegister() {
    var MedatacounterTypeDocument = {};
    this.state.idProcess //id de proceso
    if (this.state.flagPolitica == true) {
      MedatacounterTypeDocument = {
        contPoliticas: this.state.codeconsecutive
      }
    }

    if (this.state.flagProcedimiento == true) {
      MedatacounterTypeDocument = {
        contProcedimiento: this.state.codeConsecutive
      }
    }

    if (this.state.flagManual == true) {
      MedatacounterTypeDocument = {
        contManual: this.state.codeConsecutive
      }
    }
    this.props.pnp.updateItemList('Proceso', this.state.idProcess, MedatacounterTypeDocument)
      .then((res: any) => {
        console.log(res);
      })
  }


  public editRegister(item: any) {
    this.formClear();
    this.completeProcess(item.Macroproceso);
    //editar seleccion multiple "segmento,direcciones,gerencias,Lider"
    var segmentRegistro = this.fractionateSelectMultiple(item.SegmentoRegistro);
    var standard = this.fractionateSelectMultiple(item.Norma);
    var addresses = this.fractionateSelectMultiple(item.Direcciones);
    var Gerence = this.fractionateSelectMultiple(item.Gerencias);
    var Leader = this.fractionateSelectMultiple(item.Lider);
    var Segments = item.SegmentoRegistro ? item.SegmentoRegistro.split(';') : [];
    var Adress = item.Direcciones ? item.Direcciones.split(';') : [];
    var NormaEdit = item.Norma ? item.Norma.split(';') : [];
    var Gerences = item.Gerencias ? item.Gerencias.split(';') : [];
    var LeaderEdit = item.Lider ? item.Lider.split(';') : [];


    //Editar si es link o archivo
    if (item.TipoDocumentoRegistro == "Link") {
      this.setState({
        isCheckedL: true,
        isCheckedA: false,
      })
    }
    if (item.TipoDocumentoRegistro == "Archivo") {
      this.setState({
        isCheckedL: true,
        isCheckedA: false
      })
    }


    this.setState({
      titleDocument: item.Title,
      resolutorDocument: item.Analista,
      TypeDocumentSelect: item.TipoDocumento,
      macroprocessSelect: item.Macroproceso,
      processSelect: item.Proceso,
      typeSolutionSelect: item.TipoSolucion,
      codeDocument: item.CodigoDocumento,
      Version: item.Version,
      processSOXSelect: item.ProcesoSOX,
      editSegment: segmentRegistro,
      arraySegment: Segments,
      Estado: item.EstadoRegistro,
      Observaciones: item.Observaciones,
      datePublication: item.FechaPublicacion.split("T")[0],
      editNorma: standard,
      arrayNorma: NormaEdit,
      Url: item.UrlDocumento,
      caseBMP: item.CasoBPM,
      editAdress: addresses,
      arrayAddress: Adress,
      editGerence: Gerence,
      arrayGerence: Gerences,
      editLeader: Leader,
      arrayLeader: LeaderEdit,
      idEditRegister: item.ID,

    })
  }

  public fractionateSelectMultiple(ItemFraction: any) {
    var itemRegistro = ItemFraction.split(";");
    var segmentRegistro = new Array()
    for (let i in itemRegistro) {
      if (itemRegistro[i] != '') {
        segmentRegistro.push({ value: itemRegistro[i], label: itemRegistro[i] })
      }
    }
    return segmentRegistro;
  }

  public eliminateRegister(idEliminar: any) {
    jQuery('#tableRegisters').DataTable().destroy();
    Swal.fire({
      title: "Seguro que quieres eliminar?",
      text: "Eliminar registro!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.props.pnp.deleteItemList('RegistroSig', idEliminar)
          .then((res: any) => {
            Swal.fire({
              title: "Eliminado!",
              text: "El registro ha sido Eliminado!.",
              icon: "success"
            });
            this.getItems();
          })
      }
    });
  }



  private IniciaTable(tableName: string) {

    jQuery('#' + tableName).DataTable({

      destroy: true,
      language: {
        "decimal": "",
        "emptyTable": "No hay información",
        "info": "Mostrando _START_ a _END_ de _TOTAL_ Entradas",
        "infoEmpty": "Mostrando 0 to 0 of 0 Entradas",
        "infoFiltered": "(Filtrado de _MAX_ total entradas)",
        "infoPostFix": "",
        "thousands": ",",
        "lengthMenu": "Mostrar _MENU_ Entradas",
        "loadingRecords": "Cargando...",
        "processing": "Procesando...",
        "search": "Buscar:",
        "zeroRecords": "Sin resultados encontrados",
        "paginate": {
          "first": "Primero",
          "last": "Ultimo",
          "next": "Siguiente",
          "previous": "Anterior"
        }
      }
    });
  }

  public viewComunicados() {
    this.setState({
      viewComunicados:!this.state.viewComunicados,
      viewActualizacion: false,
      viewTable: !this.state.viewTable
    },()=>{this.IniciaTable('tableRegisters')})

  }

  public viewActualizacion() {
    this.setState({
      viewComunicados: false,
      viewActualizacion: !this.state.viewActualizacion,
      viewTable: !this.state.viewTable
    },()=>{this.IniciaTable('tableRegisters')})
    
  }

  public render(): React.ReactElement<IAdminDocumentosProps> {
    return (
      <section>
        {this.state.viewTable == true ?
          <div>
            <div className="container-fluid">
              <div className="form-group row">
                <div className="tituloFront">
                  <h4 className="tituloF">
                    Gestión Documental
                  </h4>
                </div>
              </div>
              <br />
              <br />
              <div className="row">
                <div className='row'>
                  <div className='col'><button type="button" className="btn btn-outline-danger" onClick={() => this.setState({ handleShow: true, ModalTitle: "Nuevo Registro", save: 'Guardar' }, () => this.formClear())}>Nuevo Registro</button></div>
                  <div className='col'><button type="button" className="btn btn-outline-danger" onClick={() =>this.viewComunicados()} >Comunicados</button></div>
                  <div className='col'><button type="button" className="btn btn-outline-danger" onClick={() =>this.viewActualizacion()}>Actualizacion Masiva</button></div>
                </div>
                <div className="d-flex flex-column justify-content-start table-responsive">
                  <table className="table table-striped table-sm table-hover" id="tableRegisters">
                    <thead className="table-secondary">
                      <tr>
                        <th scope="col">Nombre del Documento</th>
                        <th scope="col">Tipo de Documento</th>
                        <th scope="col">Analista</th>
                        <th scope="col">Proceso</th>
                        <th scope="col">Código del Documento</th>
                        <th scope="col">Fecha de Publicación</th>
                        <th scope="col">Opciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.tableRegisterSig && this.state.tableRegisterSig.length > 0 ?
                        this.state.tableRegisterSig.map((items: any) => (

                          <tr id={items.ID}>
                            <td>{items.Title}</td>
                            <td>{items.TipoDocumento}</td>
                            <td>{items.Analista}</td>
                            <td>{items.Proceso}</td>
                            <td>{items.CodigoDocumento}</td>
                            <td>{moment(items.FechaPublicacion).format('DD/MM/YYYY')}</td>
                            <td className='optionField'><div onClick={() => { this.editRegister(items), this.setState({ handleShow: true, ModalTitle: 'Modificar Registro', save: 'Modificar' }) }} >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
                              </svg>
                            </div>
                              <div onClick={() => { this.eliminateRegister(items.ID) }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                                  <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                                </svg>
                              </div>
                            </td>
                          </tr>
                        ))
                        : null
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {this.state.handleShow ?
              <div>
                <Modal className="modal-xl" show={true}>
                  <Modal.Header closeButton onClick={() => this.setState({ handleShow: false })}>
                    <Modal.Title>
                      <div className='tituloFront'>
                        <h5 className='tituloFModal'>{this.state.ModalTitle}</h5>
                      </div>
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="form-group">
                      <label >Titulo del documento<span className="inputRequired">*</span></label>
                      <input type="text" name="titleDocument" className="form-control" value={this.state.titleDocument} onChange={(e) => { this.inputChange(e.target) }} placeholder="Ingrese el titulo del documento" />
                    </div>
                    <div className="form-group">
                      <label >Analista<span className="inputRequired">*</span></label>
                      <select className="form-select NewRequired" name="resolutorDocument" value={this.state.resolutorDocument} onChange={(e) => { this.inputChange(e.target) }}>
                        <option value="Seleccione..." disabled selected>Seleccione..</option>
                        {this.state.arraySelectResolutors && this.state.arraySelectResolutors.length > 0 ?
                          this.state.arraySelectResolutors.map((Resolutor: any) => (
                            <option value={Resolutor.Analista.Title}>
                              {Resolutor.Analista.Title}
                            </option>
                          )) : null
                        }
                      </select>
                    </div>
                    <div className="form-group">
                      <label >Tipo de Documento<span className="inputRequired">*</span></label>
                      <select className="form-select NewRequired" name="TypeDocumentSelect" value={this.state.TypeDocumentSelect} onChange={(e) => { this.inputChange(e.target), this.getTypeDocumentCode(e.target) }}>
                        <option value="Seleccione..." disabled selected>Seleccione..</option>
                        {this.state.arraySelectTypeDocument && this.state.arraySelectTypeDocument.length > 0 ?
                          this.state.arraySelectTypeDocument.map((TypeDocument: any) => (
                            <option value={TypeDocument.Title}>
                              {TypeDocument.Title}
                            </option>
                          )) : null
                        }
                      </select>
                    </div>
                    <div className="form-group">
                      <label >Macroproceso<span className="inputRequired">*</span></label>
                      <select className="form-select NewRequired" name="macroprocessSelect" value={this.state.macroprocessSelect} onChange={(e) => { this.inputChange(e.target), this.completeProcess(e.target.value), this.searchFirtsPartCode(e.target) }}>
                        <option value="Seleccione..." disabled selected>Seleccione..</option>
                        {this.state.arraySelectMacroprocess && this.state.arraySelectMacroprocess.length > 0 ?
                          this.state.arraySelectMacroprocess.map((Macroprocess: any) => (
                            <option value={Macroprocess.TituloSinNumeral}>
                              {Macroprocess.TituloSinNumeral}
                            </option>
                          )) : null
                        }
                      </select>
                    </div>
                    <div className="form-group">
                      <label >Proceso<span className="inputRequired">*</span></label>
                      <select className="form-select NewRequired" name="processSelect" value={this.state.processSelect} onChange={(e) => { this.inputChange(e.target), this.searchCodeProcessComplete(e.target) }}>
                        <option value="Seleccione..." disabled selected>Seleccione..</option>
                        {this.state.arraySelectProcess && this.state.arraySelectProcess.length > 0 ?
                          this.state.arraySelectProcess.map((Process: any) => (
                            <option value={Process.Title}>
                              {Process.Title}
                            </option>
                          )) : null
                        }
                      </select>
                    </div>
                    <div className="form-group">
                      <label >Tipo de Solución<span className="inputRequired">*</span></label>
                      <select className="form-select NewRequired" name="typeSolutionSelect" value={this.state.typeSolutionSelect} onChange={(e) => { this.inputChange(e.target) }} required>
                        <option value="Seleccione..." disabled selected>Seleccione..</option>
                        {this.state.arraySelectTypeSolution && this.state.arraySelectTypeSolution.length > 0 ?
                          this.state.arraySelectTypeSolution.map((typeSolution: any) => (
                            <option value={typeSolution.Title}>
                              {typeSolution.Title}
                            </option>
                          )) : null
                        }
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Código del Documento<span className="inputRequired">*</span></label>
                      <p className="detail">{this.state.codeDocument}</p>
                    </div>
                    <div className="form-group">
                      <label>Versión<span className="inputRequired">*</span></label>
                      <input type="number" className="form-control NewRequired" name="Version" value={this.state.Version} onChange={(e) => { this.inputChange(e.target) }} />
                    </div>
                    <div className="form-group">
                      <label >Proceso SOX<span className="inputRequired">*</span></label>
                      <select className="form-select NewRequired" name="processSOXSelect" value={this.state.processSOXSelect} onChange={(e) => { this.inputChange(e.target) }}>
                        <option value="Seleccione..." disabled selected>Seleccione..</option>
                        {this.state.arraySelectProcessSox && this.state.arraySelectProcessSox.length > 0 ?
                          this.state.arraySelectProcessSox.map((processSOX: any) => (
                            <option value={processSOX.Title}>
                              {processSOX.Title}
                            </option>
                          )) : null
                        }
                      </select>
                    </div>
                    <div className="form-group">
                      <label >Segmento<span className="inputRequired">*</span></label>
                      <Select
                        defaultValue={this.state.editSegment}
                        isMulti
                        name="segmentSelect"
                        options={this.state.arraySelectSegmento}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={(e, Active) => { this.inputChangeSelect(e, Active) }}
                        placeholder='Seleccione...'
                        required
                      />

                    </div>
                    <div className="form-group">
                      <label >Estado<span className="inputRequired">*</span></label>
                      <select className="form-select NewRequired" name="Estado" value={this.state.Estado} onChange={(e) => { this.inputChange(e.target) }}>
                        <option value="Seleccione..." disabled selected>Seleccione..</option>
                        {this.state.arraySelectEstado && this.state.arraySelectEstado.length > 0 ?
                          this.state.arraySelectEstado.map((itemEstado: any) => (
                            <option value={itemEstado.Title}>
                              {itemEstado.Title}
                            </option>
                          )) : null
                        }
                      </select>
                    </div>
                    {this.state.Estado == 'Obsoleto' ?
                      <div className="form-group">
                        <label className="col-sm-2">Observaciones<span className="inputRequired">*</span></label>
                        <textarea cols={30} rows={5} className="form-control NewRequired" name="Observaciones" value={this.state.Observaciones} onChange={(e) => { this.inputChange(e.target) }} placeholder="Ingrese la observación" ></textarea>
                      </div>
                      : null
                    }
                    <div className="form-group">
                      <label>Fecha de Publicación<span className="inputRequired">*</span></label>
                      <input type="date" name="datePublication" className="form-control" value={this.state.datePublication} onChange={(e) => { this.inputChange(e.target) }} />
                    </div>
                    <div className="form-group">
                      <label >Norma<span className="inputRequired">*</span></label>
                      <Select
                        name="Norma"
                        defaultValue={this.state.editNorma}
                        isMulti
                        options={this.state.arraySelectNorma}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={(e, Active) => { this.inputChangeSelect(e, Active) }}
                        placeholder='Seleccione...'
                        required
                      />
                    </div>
                    <br />
                    <br />
                    <div className="form-group">
                      <label className="col-sm-3">Link </label>
                      <div className="col-sm-2">
                        <input type="checkbox" className="form-check NewRequired" name="Link" checked={this.state.isCheckedL} onChange={this.handleCheckboxChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-3">Archivo </label>
                      <div className="col-sm-2">
                        <input type="checkbox" className="form-check NewRequired" name="Archivo" checked={this.state.isCheckedA} onChange={this.handleCheckboxChange} />
                      </div>
                    </div>
                    <br />
                    {this.state.isCheckedL == true ?
                      <div className="form-group">
                        <label>Url del documento<span className="inputRequired">*</span></label>
                        <br />
                        <input type="url" className="form-control NewRequired" name="Url" placeholder="https://example.com" value={this.state.Url} onChange={(e) => { this.inputChange(e.target) }} />
                      </div>
                      : null
                    }

                    {this.state.isCheckedA == true ?
                      <div className="form-group">
                        <label>Documento<span className="inputRequired">*</span></label>
                        <input type="file" className="form-control NewRequired" name='archivo' onChange={(e) => { this.inputChangeFile(e) }} multiple accept="application/pdf,application/vnd.ms-excel" />
                      </div>
                      : null
                    }
                    <br />
                    <div className="form-group">
                      <label>Número de caso BMP<span className="inputRequired">*</span></label>
                      <input type="number" className="form-control NewRequired" name="caseBMP" value={this.state.caseBMP} onChange={(e) => { this.inputChange(e.target) }} />
                    </div>
                    <br />
                    <div className="form-group">
                      <label >Direcciones<span className="inputRequired">*</span></label>
                      <Select
                        defaultValue={this.state.editAdress}
                        isMulti
                        name="direccionesSelect"
                        options={this.state.arraySelectDireccion}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder='Seleccione...'
                        onChange={(e, Active) => { this.inputChangeSelect(e, Active) }}
                        onBlur={() => { this.filterGerenceSelect() }}
                      />
                    </div>
                    <br />
                    <div className="form-group">
                      <label >Gerencias<span className="inputRequired">*</span></label>
                      <Select
                        name="gerenciasSelect"
                        defaultValue={this.state.editGerence}
                        isMulti
                        options={this.state.FilterGerenceSelect}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder='Seleccione...'
                        onChange={(e, Active) => { this.inputChangeSelect(e, Active) }}
                        onBlur={() => { this.filterLiderSelect() }}
                      />

                    </div>
                    <br />
                    <br />
                    <div className="form-group">
                      <label >Lider<span className="inputRequired">*</span></label>
                      <Select
                        name="liderSelect"
                        defaultValue={this.state.editLeader}
                        isMulti
                        options={this.state.arrayLiderSelect}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder='Seleccione...'
                        onChange={(e, Active) => { this.inputChangeSelect(e, Active) }}

                      />

                    </div>
                    <br />


                  </Modal.Body>
                  <Modal.Footer>
                    <button className='btn btn-outline-secondary' onClick={() => this.setState({ handleShow: false })}>
                      Cerrar
                    </button>
                    <button className='btn btn-outline-danger' value={this.state.save} onClick={() => { this.validateInput() }}>
                      {this.state.save}
                    </button>
                  </Modal.Footer>
                </Modal>
              </div>
              : null}
          </div>
          : null
        }
        {this.state.viewComunicados ?
          <ComunicadosDocumentos Comunica={this.props.pnp} context={this.props.context} viewComunicados={() => this.viewComunicados()}></ComunicadosDocumentos>
          : null}
        {this.state.viewActualizacion ?
          <ActualizacionMasiva massiveUpdate={this.props.pnp} viewActualizacion={() => this.viewActualizacion()}></ActualizacionMasiva>
          : null}
      </section>
    );
  }
}
