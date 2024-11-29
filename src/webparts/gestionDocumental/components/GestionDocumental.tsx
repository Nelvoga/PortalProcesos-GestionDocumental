import * as React from 'react';
import '../assets/CSS/Styless.css';
import { IGestionDocumentalProps } from './IGestionDocumentalProps';
import {PNP} from '../Utilidad/Util'



import AdminDocumentos from './Admin_Documentos/Admin_Documentos';

import 'DataTables.net'; 
import 'DataTables.net-bs5';



interface IGestionDocumentalWebPartProps{
  context:any
}

export default class GestionDocumental extends React.Component<IGestionDocumentalWebPartProps,any> {
  public pnp :PNP;
  constructor(props:any){
    super(props);
    this.pnp = new PNP(props.context);
   
  }
  
  public render(): React.ReactElement<IGestionDocumentalProps> {
    return (
      <section>
        <div className='container'> 
        
        <AdminDocumentos pnp={this.pnp} context={this.props.context}></AdminDocumentos>  
          
        </div> 
      </section>
    );
  }
}