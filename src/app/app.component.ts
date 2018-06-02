import { Component, Input, HostBinding, HostListener,  ElementRef,ViewChild,NgZone,OnInit,OnDestroy  } from '@angular/core';
import {AppSettings} from './app.settings';
import { Version } from '@microsoft/sp-core-library';
import { SPFxService } from './services/spfx.service';
import { ModalService } from './services/modal.service';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
declare var google;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [`
  #map {
    width: 100%;
    height: 500px;
  }

  .ms-Label {
    font-size: 12px;
    font-weight: 400;
    box-sizing: border-box;
    box-shadow: none;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    display: block;
    padding: 5px 0;
    font-weight: 600;
    font-size: 14px;
}
  input[type=text], select, textarea {
    width: 100%;
    border: 0;
    border-bottom: 1px solid #a6a6a6;
    outline: 0;
    font-size: 14px;
    padding: 6px 12px;
    min-width: 170px;
    min-height: 32px;
    transition: background-color .2s ease,padding-left .2s ease;
  }
  label {
    padding: 12px 12px 12px 0;
    display: inline-block;
  }
  
  .container {
    border-radius: 5px;
   
    padding: 20px;
  }
  .col-25 {
    padding-top:10px;
    float: left;
    width: 25%;
    margin-top: 6px;
  }
  .col-100
  {
    padding-top:10px;
   
  }
  .col-75 {
    padding-top:10px;
    float: left;
    width: 75%;
    margin-top: 6px;
  }
  /* Clear floats after the columns */
  .row:after {
    content: "";
    display: table;
    clear: both;
  }

  .row-button
  {
    padding-top:100px;
    
  }
  /* Responsive layout - when the screen is less than 600px wide, make the two columns stack on top of each other instead of next to each other */
  @media screen and (max-width: 600px) {
    .col-25, .col-75, input[type=submit] {
      padding-top:10px;
        width: 100%;
        margin-top: 0;
    }
  }

  .spButton
  {
    position: relative;
    font-family: "Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    font-size: 14px;
    font-weight: 400;
    box-sizing: border-box;
    display: inline-block;
    text-align: center;
    cursor: pointer;
    vertical-align: top;
    padding-top: 0px;
    padding-right: 16px;
    padding-bottom: 0px;
    padding-left: 16px;
    min-width: 80px;
    height: 32px;
    background-color: rgb(117, 117, 117);
    color: rgb(255, 255, 255);
    user-select: none;
    outline: transparent;
    border-width: 1px;
    border-style: solid;
    border-color: transparent;
    border-image: initial;
    text-decoration: none;
    border-radius: 0px;
  }

  .spButtonOffline
  {
    position: relative;
    font-family: "Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    font-size: 14px;
    font-weight: 400;
    box-sizing: border-box;
    display: inline-block;
    text-align: center;
    cursor: pointer;
    vertical-align: top;
    padding-top: 0px;
    padding-right: 16px;
    padding-bottom: 0px;
    padding-left: 16px;
    min-width: 80px;
    height: 32px;
    background-color: rgb(244, 244, 244);
    color: rgb(51, 51, 51);
    user-select: none;
    outline: transparent;
    border-width: 1px;
    border-style: solid;
    border-color: transparent;
    border-image: initial;
    text-decoration: none;
    border-radius: 0px;
  }

  .modal {
    /* modal container fixed across whole screen */
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    /* z-index must be higher than .modal-background */
    z-index: 1000;
    
    /* enables scrolling for tall modals */
    overflow: auto;
    
    box-shadow: 10px 10px grey;
    
}

.alert-danger {
  color: #a94442;
  background-color: #f2dede;
  border-color: #ebccd1;
}

.alert {
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid transparent;
  border-radius: 4px;
}

.modal-body {
  padding: 20px;
  background: #fff;
  font-family: "Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
  /* margin exposes part of the modal background */
  margin: 40px;
}

.modal-background {
  /* modal background fixed across whole screen */
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  /* semi-transparent black  */
  background-color: #FFF;
  opacity: 0.75;
  
  /* z-index must be below .modal and above everything else  */
  z-index: 900;
}

  modal {
    /* modals are hidden by default */
    display: none;

    

    
}

body.modal-open {
    /* body overflow is hidden to hide main scrollbar when modal window is open */
    overflow: hidden;
}
  
  `]
})
export class AppComponent {
  @Input() description = 'Angular';
  spfullname:string = '';
  @ViewChild('map') mapElement: ElementRef;
  map: any;  
  lat:number;
  lng:number;
  markerArray:Array<any>;
  mylatLng:any;
  formdata:any;
  isFormValid:boolean=false;
  currentLocId:number=-1;

  
  @Input() latitude = '24.723787';
  @Input() longitude = '46.682979';

  // title = 'Angular';
  constructor(elm: ElementRef,
    private spfxService:SPFxService,
    private modalService:ModalService,
    public _ngZone: NgZone) {
    this.description = elm.nativeElement.getAttribute('description');
    console.log('******COMPONENT******');
    
    this.lat = parseFloat(this.latitude);
    this.lng = parseFloat(this.longitude);         
    
    this.addMapsScript();
    
    
    
  }

  addMapsScript() {
    if (!document.querySelectorAll(`[src="${AppSettings.GMAP_URL}"]`).length) { 
      document.body.appendChild(Object.assign(
        document.createElement('script'), {
          type: 'text/javascript',
          src: AppSettings.GMAP_URL,
          onload: () => this.doMapInitLogic()
        }));
    } else {
      this.doMapInitLogic();
    }
  }

  

  onClickSubmit(data) {

    this.isFormValid = data.title != '' && 
    data.description != '' &&
    data.latitude != '' &&
    data.longitude != '';

    if (this.isFormValid)
    {
      if (this.currentLocId == -1)
      {
        this.spfxService.createItem(data.title,
          data.description,
          data.latitude,
          data.longitude).then((res)=>{
          this.closeModal('custom-modal-1');
          this.search();
        });
      }
      else
      {
        this.spfxService.updateItem(this.currentLocId,data.title,
          data.description,
          data.latitude,
          data.longitude).then((res)=>{
          this.closeModal('custom-modal-1');
          this.currentLocId = -1;
          this.formdata.setValue({
            title: "",
            description:"",
            latitude:"",
            longitude:""
          });
          this.search();
        });
      }
    }
    
    
 }

 

  doMapInitLogic()
  {
    
    
    this.loadMap();

  }

  ngOnInit()
  {
    window["angularComponentRef"] = { component: this, zone: this._ngZone };
    this.formdata = new FormGroup({
      title: new FormControl("", Validators.compose([
         Validators.required
      ])),
      description: new FormControl("", Validators.compose([
        Validators.required
     ])),
     latitude: new FormControl("", Validators.compose([
      Validators.required
   ])),
   longitude: new FormControl("", Validators.compose([
    Validators.required
 ]))
   });
  }

  ngOnDestroy()
  {
    window["angularComponentRef"] = null;
  }

  setMapOnAll(map) {
    for (var i = 0; i < this.markerArray.length; i++) {
      this.markerArray[i].setMap(map);
    }
  }

  // Removes the markers from the map, but keeps them in the array.
  clearMarkers() {
    this.setMapOnAll(null);
    
  }

loadMap(){
this.markerArray = Array<any>();
 
   this.mylatLng = new google.maps.LatLng(this.lat, this.lng);

let mapOptions = {
  center: this.mylatLng,
  zoom: 13,
  mapTypeId: google.maps.MapTypeId.ROADMAP
}

this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
this.search();
}

updateItem(id: number){
  this.currentLocId = id;
  this.spfxService.readItem(id).then((res)=>{
   

    this.formdata.setValue({
      title: this.spfxService.currentItem['Title'],
      description:this.spfxService.currentItem['Description'],
      latitude:this.spfxService.currentItem['Latitude'],
      longitude:this.spfxService.currentItem['Longitude']
    });
   
    this.openModal('custom-modal-1');
  }
    
 );
 
}

removeItem(id: number){
  this.currentLocId = id;
  this.spfxService.readItem(id).then((res)=>{
  this.spfxService.deleteItem(id).then((res)=>{
   
    this.currentLocId = -1;
   this.search();
   
    
  
});
    
});
 
}

openModal(id: string){
  this.modalService.open(id);
}

closeModal(id: string){
  this.currentLocId = -1;
  this.formdata.setValue({
    title: '',
    description:'',
    latitude:'',
    longitude:''
  });

  this.modalService.close(id);
}

search()
{
this.clearMarkers();


this.spfxService.readItems()
 .subscribe(res=> {
    
    
    
    if (res.value != undefined)
      {
    res.value.forEach(element => {
       let latLng = new google.maps.LatLng(element.Latitude, element.Longitude);
    let marker = new google.maps.Marker({
map: this.map,
animation: google.maps.Animation.DROP,
position: latLng
});

this.markerArray.push(marker);

let content = "<h2>"+element.Title+"</h2> <h5>"+element.Description+"</h5>"+
 '<button  class="spButton"  onclick="window.angularComponentRef.zone.run(() => {window.angularComponentRef.component.updateItem(' + element.Id + ');})">Edit</button>'
+'<button  class="spButton" onclick="window.angularComponentRef.zone.run(() => {window.angularComponentRef.component.removeItem(' + element.Id + ');})">Delete</button>';
  

this.addInfoWindow(marker, content);
    });
      }

   

 },
  err=>{  console.log('error:'+err);});
}

addInfoWindow(marker, content){

  let infoWindow = new google.maps.InfoWindow({
  content: content
  });
  
  google.maps.event.addListener(marker, 'click', () => {
  infoWindow.open(this.map, marker);
  });
  
  }
  

}
