import * as React from 'react';
import '../assets/CSS/Styless.css';
import { IGestionDocumentalProps } from './IGestionDocumentalProps';
import {PNP} from '../../Utilidad/Util'



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
    this.state = {
      idInto:'',
      intoName:''
    }
  }

  componentDidMount() {
    this.getUserInto();
    
}

public getUserInto(){
    this.pnp.getUserProfile() 
    .then((User:any)=>{
        this.setState({idInto:User.Email, intoName:User.DisplayName});
    })  
}
  
  public render(): React.ReactElement<IGestionDocumentalProps> {
    if (!this.state.idInto || !this.state.intoName) {
      return (
        <section>
          <div className="container">
            <p>Cargando información del usuario...</p>
          </div>
        </section>
      );
    }
    return (
      <section>
        <div className='container'> 
            <AdminDocumentos EmailIntoTas={this.state.idInto} idNameDisplay={this.state.intoName} pnp={this.pnp} context={this.props.context}></AdminDocumentos>  
        </div> 
      </section>
    );
  }
}