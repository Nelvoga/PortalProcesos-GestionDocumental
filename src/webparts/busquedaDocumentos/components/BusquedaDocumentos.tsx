import * as React from 'react';
import '../assets/CSS/Styless.css';
import type { IBusquedaDocumentosProps } from './IBusquedaDocumentosProps';
import {PNP} from '../../Utilidad/Util';
import BuscarDocumentos from './Buscar_General_Documentos/BuscarGeneralDocumentos';

interface IBusquedaDocumentosPartProps{
  context:any
}

export default class BusquedaDocumentos extends React.Component<IBusquedaDocumentosPartProps, any> {
public pnp :PNP;
  constructor(props:any){
  super(props);
  this.pnp = new PNP(props.context);
 
}


  public render(): React.ReactElement<IBusquedaDocumentosProps> {
    return (
      <section >
        <div className='container'> 
            <BuscarDocumentos Search={this.pnp} context={this.props.context}></BuscarDocumentos>  
        </div> 
      </section>
    );
  }
}
