import pnp,{Web,Item} from 'sp-pnp-js';
import { IWebPartContext } from '@microsoft/sp-webpart-base';
import '@pnp/sp/folders';
import { sp } from "@pnp/sp";
import '@pnp/sp/webs';
import "@pnp/sp/site-users/web";
import "@pnp/sp/lists"; 
import "@pnp/sp/items";
import "@pnp/sp/files";

import "@pnp/sp/profiles";

export class PNP {
  public context:IWebPartContext;
  public siteRelativeUrl: string;
  public web: Web;
  public rootWeb:Web;
  

  constructor(context: IWebPartContext){
    this.context = context;
    this.siteRelativeUrl = this.context.pageContext.web.serverRelativeUrl;
    this.web = new Web(this.context.pageContext.web.absoluteUrl);
    this.rootWeb = new Web(this.context.pageContext.site.absoluteUrl);

    this.setupPnP();
  }

  public sendEmail(emailProps: any): Promise<any>{
    return pnp.sp.utility.sendEmail(emailProps);
  }
  public generatorConsole(){
    console.log('Prueba');
  }

  private setupPnP(): void {
    sp.setup({
      spfxContext: this.context
    });
  }

     public getItemsList(
        listName: string,
        fieldsItem?: string,
        filtersItem?: string,
        expandItem?: string,
        sortid?: any,
        topItem?: number
      ): Promise<any> {
  
        let top = topItem ? topItem : 5000;
        let sort = sortid ? sortid :{property : "ID", asc:true}
        let fields = fieldsItem ? fieldsItem : ''
        let filters = filtersItem ? filtersItem : ''
        let expand = expandItem ? expandItem : ''
        
        return new Promise((resolve, reject) => {
          let list = this.web.lists.getByTitle(listName);
          if (list) {
            list.items
              .filter(filters)
              .select(fields)
              .expand(expand)
              .orderBy(sort.property, sort.asc)
              .top(top)
              .get()
              .then((items: any[]) => {
                resolve(items);
              })
              .catch(err => {
                reject(null);
              });
          }
        });
    }

    public insertItemList(
      listName: string,
      properties: any,
      attachment?: File
    ): Promise<any> {
      return new Promise((resolve, reject) => {
        let list = this.web.lists.getByTitle(listName);
        list.items
          .add(properties)
          .then(res => {
            if (attachment) {
              res.item.attachmentFiles
                .add(attachment.name, attachment)
                .then(_ => {
                  resolve(res.data);
                  
                });
            } else {
              resolve(res.data);
              
            }
          })
          .catch(err => {
            reject(err);
          });
      });
    }
      
    public updateItemList(
      listname: string,
      id: number,
      properties: any,
      attachment?: File
    ): Promise<any> {
      
      let list = this.web.lists.getByTitle(listname);
      return list.items
        .getById(id)
        .update(properties)
        .then(res => {
          if (attachment) {
            return this.finishSave(res.item, attachment, attachment.name).then(item => {
              return item;
            });
          }else{
            return res;
          }
        });
    }

    public deleteItemList(
      listName: string, 
      id: number
      ): Promise<any> {
      let list = this.web.lists.getByTitle(listName);
      return list.items.getById(id).delete();
    }

    async finishSave(item: Item, attachment: File, attachmentName:string) {
      if (attachment) {
        await item.attachmentFiles.add(attachmentName, attachment);
        const itemUpdated = await item
          .get();
        return itemUpdated;
      } else {
        const itemUpdated = await item
          .get();
        return itemUpdated;
      }
    }

    public getCurrentUser(): Promise<any> {
      return this.web.currentUser.get();
    }

    public getByTitleUser(Title: string): Promise<any> {
      return this.web.siteUsers.filter(`Title eq '${Title}'`).get();
    }

    public getUserProfile():Promise<any> {
      return sp.profiles.myProperties.get();
    }

    public getUserProfileEspecific(loginName:any):Promise<any> {
      console.log(loginName);
     return  sp.profiles.getPropertiesFor(loginName)
    }

    public async crearCarpeta(biblioteca: string, nombreCarpeta: string): Promise<void> {
      try {
        // Crear la carpeta en la biblioteca especificada
        await this.web.lists.getByTitle(biblioteca).rootFolder.folders.add(nombreCarpeta);
        console.log(`Carpeta ${nombreCarpeta} creada en la biblioteca ${biblioteca} ahora`);
      } catch (error) {
        console.error("Error al crear la carpeta", error);
      }
    }
  

    public uploadFile(
      repository: string,
      file: File,
      name: string
    ): Promise<any> {
       return new Promise((resolve, reject) => {
        const fileobject = this.web.getFolderByServerRelativeUrl(this.siteRelativeUrl+'/'+repository+'/');
            fileobject.files
            .add(name, file, true)
            .then(res =>{
              resolve(res)
            })
            .catch(err => {
              reject(err);
            });
 
      })
    }

    public updateFieldByUniqueId = async (
      TimeCreated:string, 
      fieldName:string, 
      fieldValue:any,
      directoryLibrary:string
    ) => {
      try {
        const item = await sp.web.lists.getByTitle(directoryLibrary).items.filter(`Created eq '${TimeCreated}'`).get();
        if (item.length > 0) {
          await sp.web.lists.getByTitle(directoryLibrary).items.getById(item[0].Id).update({
            [fieldName]: fieldValue,
          });
          console.log('Campo actualizado exitosamente');
        } else {
          console.error('No se encontró el archivo con el UniqueId proporcionado');
        }
      } catch (error) {
        console.error('Error al actualizar el campo:', error);
      }
    };
    
  





/*export class Helpers {

    public web: Web;
    public webExternal: Web;

    constructor(context: any) {
      this.web = new Web(context.pageContext.web.absoluteUrl);
    }

    public getCurrentUser(): Promise<any> {
      return this.web.currentUser.get();
    }

    public readFile = async (e: any, funcionSuccess:any) => {

        //  npm i xlsx

        console.log('reading input file:');
        const file = e.target.files[0];
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
        });

        if(funcionSuccess){
            funcionSuccess(jsonData)
        }else{
            console.log(jsonData);
        }
        
    }

    public exportDataToExcel = async (apiData:any,fileName:any,  funcionSuccess:any) => {

        //  npm i xlsx
        //  npm install file-saver
        //  npm i --save-dev @types/file-saver

        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";

        const ws = XLSX.utils.json_to_sheet(apiData);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);

        if(funcionSuccess){
            funcionSuccess('Success')
        }else{
            console.log('Success');
        }
    }

    public getItemsListExternal(
        urlExternal?:string,
        listName?: string,
        fieldsItem?: string,
        filtersItem?: string,
        expandItem?: string,
        sortid?: any,
      ): Promise<any> {
  
        this.webExternal = new Web(urlExternal);

        let sort = sortid ? sortid :{property : "ID", asc:true}
        let fields = fieldsItem ? fieldsItem : '*'
        let filters = filtersItem ? filtersItem : ''
        let expand = expandItem ? expandItem : ''
        
        return new Promise((resolve, reject) => {
          let list = this.webExternal.lists.getByTitle(listName);
          if (list) {
            list.items
              .filter(filters)
              .select(fields)
              .expand(expand)
              .orderBy(sort.property, sort.asc)
              .getAll()
              .then((items: any[]) => {
                resolve(items);
              })
              .catch(err => {
                reject(null);
              });
          }
        });
    }*/
}