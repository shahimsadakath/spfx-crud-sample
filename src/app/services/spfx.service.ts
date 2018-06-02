import { Injectable } from '@angular/core';
import { HttpClient,HttpParams,HttpHeaders } from '@angular/common/http'
import { AppSettings } from '../app.settings';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise'
import { observableToBeFn } from 'rxjs/testing/TestScheduler';
import {IRequestDigest,IListItemEntityType,IHttpPromiseCallbackArg} from '../app.common';




@Injectable()
export class SPFxService {
  public currentItem:any;
  listItemEntityTypeName: string = '';
  formDigestValue:string = '';
  
 
     constructor(private http: HttpClient) { 
       
   }

   public readItems(): Observable<any> {
   
    
    const headers = new HttpHeaders().set('accept','application/json;odata=nometadata');
    const requestOptions = {
      headers: headers
    };
    
    

    

    return this.http.get(`${AppSettings.SP_URL}/_api/web/lists/getbytitle('${AppSettings.SP_LISTNAME}')/items`, requestOptions
      );
    
    
   
  }

  private getRequestDigest() : Promise<IRequestDigest> {
    
let promise = new Promise<IRequestDigest>((resolve,reject)=>{

  const headers = new HttpHeaders().set('accept','application/json;odata=nometadata');
  const requestOptions = {
    headers: headers
  };

   this.http.post(AppSettings.SP_URL + '/_api/contextinfo','',requestOptions)
  .toPromise().then((res:IRequestDigest) => { this.formDigestValue = res.FormDigestValue; resolve(); });

});

   
      return promise;

   
  }

  public getListItemEntityTypeName() : Promise<IListItemEntityType> {
    
    
    let promise = new Promise<IListItemEntityType>((resolve,reject)=>{

      const headers = new HttpHeaders().set('accept','application/json;odata=nometadata');
      const requestOptions = {
        headers: headers
      };
      
      
   
     this.http.get(`${AppSettings.SP_URL}/_api/web/lists/getbytitle('${AppSettings.SP_LISTNAME}')?$select=ListItemEntityTypeFullName`
      ,requestOptions
    ).toPromise().then((res : IListItemEntityType)=>{ this.listItemEntityTypeName = res.ListItemEntityTypeFullName; resolve(); } );

    
    });

    return promise;
   
  }

public createItem(title: string, description: string, latitude: string,longitude:string) : Promise<any> {
    

   
  let promise = new Promise<IRequestDigest>((resolve,reject)=>{
    
    this.getListItemEntityTypeName()
    .then((res) => {
      
      return this.getRequestDigest();
    })    
      .then((res)  => {
        
        let headers = new HttpHeaders().set('accept','application/json;odata=nometadata');
        headers = headers.set('Content-type','application/json;odata=verbose');
        headers = headers.set('X-RequestDigest',this.formDigestValue);
    const requestOptions = {
      headers: headers
    };
  
        const body: string = JSON.stringify({
          '__metadata': {
            'type': this.listItemEntityTypeName
          },
          'Title': title,
          'Description' : description,
          'Latitude' : latitude,
          'Longitude':longitude
        });
        
       this.http.post(`${AppSettings.SP_URL}/_api/web/lists/getbytitle('${AppSettings.SP_LISTNAME}')/items`,  
        body,requestOptions).toPromise().then(res=>{ resolve();});
      });
    });

    return promise;
      
  }

  public readItem(id: number): Promise<any> {

    let promise = new Promise<IRequestDigest>((resolve,reject)=> {
    let headers = new HttpHeaders().set('accept','application/json');
    
const requestOptions = {
  headers: headers
};

    this.http.get(`${AppSettings.SP_URL}/_api/web/lists/getbytitle('${AppSettings.SP_LISTNAME}')/items(${id})`,requestOptions
     
    ).toPromise()
      .then((response) => {
        this.currentItem = response;
        
        resolve();
      }, (error: any): void => {
        reject(error);
      });
    });

    return promise;
  }

  public updateItem(id: number, title: string, description: string, latitude: string,longitude:string): Promise<any> {
    
    let promise = new Promise<IRequestDigest>((resolve,reject)=>{
    let listItemEntityTypeName: string = undefined;
    this.getListItemEntityTypeName()
      .then((res) => {
       
        return this.getRequestDigest();
      })
     
      .then((res) => {
        let headers = new HttpHeaders().set('accept','application/json;odata=nometadata');
        headers = headers.set('Content-type','application/json;odata=verbose');
        headers = headers.set('X-RequestDigest',this.formDigestValue);
        headers = headers.set('X-HTTP-Method', 'MERGE');
        headers = headers.set('IF-MATCH', this.currentItem["odata.etag"]);
    const requestOptions = {
      headers: headers
    };
  
        const body: string = JSON.stringify({
          '__metadata': {
            'type': this.listItemEntityTypeName
          },
          'Title': title,
          'Description' : description,
          'Latitude' : latitude,
          'Longitude':longitude
        });
        

       this.http.post(`${AppSettings.SP_URL}/_api/web/lists/getbytitle('${AppSettings.SP_LISTNAME}')/items(${id})?@target='${AppSettings.SP_URL}'`,  
        body,requestOptions).toPromise().then(res=>{ this.currentItem = null; resolve();});


       
        
      });
    });

    return promise;
  }

  public deleteItem(id:number): Promise<any> {
    
    
        let promise = new Promise<any>((resolve,reject)=>{
    this.getRequestDigest()
  
      .then((res) => {
        console.log(this.formDigestValue);
        let headers = new HttpHeaders().set('accept','application/json;odata=nometadata');
        headers = headers.set('Content-type','application/json;odata=verbose');
        headers = headers.set('X-RequestDigest',this.formDigestValue);
        headers = headers.set('X-HTTP-Method', 'DELETE');
        headers = headers.set('IF-MATCH', this.currentItem["odata.etag"]);
    const requestOptions = {
      headers: headers
    };

    const body: string = JSON.stringify({
      
      'Id': id
    });

        return this.http.post(`${AppSettings.SP_URL}/_api/web/lists/getbytitle('${AppSettings.SP_LISTNAME}')/items(${id})`,body,
        requestOptions).toPromise().then(res=>{ this.currentItem = null; resolve();});
      });
     
    });

    return promise;
  }
  

  


   

}