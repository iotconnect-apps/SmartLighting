import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { NotificationService, Notification, LookupService } from '../../../services';
import { NgxSpinnerService } from 'ngx-spinner'
import { AppConstant, MessageAlertDataModel } from "../../../app.constants";
import { MessageDialogComponent } from '../../../components/common/message-dialog/message-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-light-add',
  templateUrl: './light-add.component.html',
  styleUrls: ['./light-add.component.css']
})
export class LightAddComponent implements OnInit {
  @ViewChild('myFile', { static: false }) myFile: ElementRef;
  validstatus = false;
  MessageAlertDataModel: MessageAlertDataModel;
  hasZone = true;
  addZoneMsg: any = 'Add a zone first when you create the building';
  selectZone: string = "Select Zone";
  unique = false;
  currentUser: any;
  fileUrl: any;
  fileName = '';
  fileToUpload: any = null;
  moduleName = "Add Light";
  isEdit = false;
  lightForm: FormGroup;
  checkSubmitStatus = false;
  templateList: any = [];
  typeList: any = [];
  zoneList: any = [];
  buildingList = [];
  lightObject: any = {};
  lightGuid: any;
  templateguid: any;
  selectedBuilding: any;
  selectedZoneType: any;

  constructor(
    private router: Router,
    private _notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private lookupService: LookupService,
    public _appConstant: AppConstant,
    public dialog: MatDialog,
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.activatedRoute.params.subscribe(params => {
      if (params.lightGuid != null) {
        this.lightGuid = params.lightGuid;
        this.moduleName = "Edit Light";
        this.isEdit = true;
      } else {
        this.lightObject = { lightGuid: '', capacity: '', entityGuid: '', name: '', templateGuid: '', uniqueId: '' }
      }
    });
  }

  // before view init
  ngOnInit() {
    this.createFormGroup();
    this.getBuildingLookup();
    this.getTemplateLookup();
  }

  /**
   * Load  formgroup Fields
   * */

  createFormGroup() {
    this.lightForm = new FormGroup({
      templateGuid: new FormControl(''),
      imageFile: new FormControl(''),
      guid: new FormControl(''),
      companyGuid: new FormControl(null),
      name: new FormControl('', [Validators.required]),
      lightGuid: new FormControl('', [Validators.required]),
      entityGuid: new FormControl('', [Validators.required]),
      uniqueId: new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]),
      tag: new FormControl(''),
      note: new FormControl(''),
      isProvisioned: new FormControl(false),
      isActive: new FormControl(true),
      specification: new FormControl(''),
      description: new FormControl(''),
      capacity: new FormControl('', [Validators.required, Validators.pattern('^[0-9 _]*$')]),
      zoneType: new FormControl('', [Validators.required]),
    });
  }

  get entityGuid(): any { return this.lightForm.get('entityGuid'); }

  /**
  * Get Building Lookup by companyId
  * */
  getBuildingLookup() {
    this.spinner.show();
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.lookupService.getsensor(currentUser.userDetail.companyId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.buildingList = response.data;
          this.buildingList = this.buildingList.filter(word => word.isActive == true);
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })

  }
  /**
   * Get Template Lookup
   * */
  getTemplateLookup() {
    this.lookupService.gettemplatelookup().
      subscribe(response => {
        if (response.isSuccess === true && response.data != '') {
          this.templateguid = response.data[0].value
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })

  }

  /**
   * Add Light
   * */
  addLight() {
    this.checkSubmitStatus = true;
    this.lightForm.get('guid').setValue(null);
    this.lightForm.get('templateGuid').setValue(this.templateguid);
    if (this.lightForm.status === "VALID") {
      if (this.validstatus == true || !this.lightForm.value.imageFile) {
        if (this.fileToUpload) {
          this.lightForm.get('imageFile').setValue(this.fileToUpload);
        }
        if (this.isEdit) {
          this.lightForm.registerControl("guid", new FormControl(''));
          this.lightForm.patchValue({ "guid": this.lightGuid });
        }
        this.spinner.show();
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.lightForm.get('companyGuid').setValue(currentUser.userDetail.companyId);
        this.lookupService.addUpdateSensor(this.lightForm.value).subscribe(response => {
          if (response.isSuccess === true) {
            this.spinner.hide();
            if (response.data.updatedBy != null) {
              this._notificationService.add(new Notification('success', "Light updated successfully."));
            } else {
              this._notificationService.add(new Notification('success', "Light created successfully."));
            }
            this.router.navigate(['lights']);
          } else {
            this.spinner.hide();
            this._notificationService.add(new Notification('error', response.message));
          }
        });
      } else {
        this.MessageAlertDataModel = {
          title: "Light Image",
          message: "Invalid Image Type.",
          message2: "Upload .jpg, .jpeg, .png Image Only.",
          okButtonName: "OK",
        };
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          width: '400px',
          height: 'auto',
          data: this.MessageAlertDataModel,
          disableClose: false
        });
      }
    }
  }
  /**
   * Covert value in Lowercase
   * @param val
   * */
  getdata(val) {
    if (val) {
      return val = val.toLowerCase();
    }
  }

  /**
   * Get Zone Lookup by EntityId
   * @param EntityId
   * @param zoneType
   */
  getZone(EntityId, zoneType) {
    if (zoneType) {
      this.entityGuid.reset();
      this.spinner.show();
      this.lookupService.getZonelookupByType(EntityId, zoneType).
        subscribe(response => {
          if (response.isSuccess === true) {
            if (response.data.length > 0) {
              this.selectZone = "Select Zone";
              this.hasZone = true;
            }
            else {
              this.selectZone = "No Zone";
              this.hasZone = false;
            }
            this.zoneList = response.data;
          }
          else {
            this.hasZone = false;
            this._notificationService.add(new Notification('error', response.message));
          }
          this.spinner.hide();
        }, error => {
          this.spinner.hide();
          this._notificationService.add(new Notification('error', error));
        })
    }
  }
  /**
   * Handle Image by event
   * */
  handleImageInput(event) {
    let files = event.target.files;
    if (files.length) {
      let fileType = files.item(0).name.split('.');
      let imagesTypes = ['jpeg', 'JPEG', 'jpg', 'JPG', 'png', 'PNG'];
      if (imagesTypes.indexOf(fileType[fileType.length - 1]) !== -1) {
        this.validstatus = true;
        this.fileName = files.item(0).name;
        this.fileToUpload = files.item(0);
      } else {
        this.imageRemove();
        this.MessageAlertDataModel = {
          title: "Light Image",
          message: "Invalid Image Type.",
          message2: "Upload .jpg, .jpeg, .png Image Only.",
          okButtonName: "OK",
        };
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          width: '400px',
          height: 'auto',
          data: this.MessageAlertDataModel,
          disableClose: false
        });
      }
    }

    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (innerEvent: any) => {
        this.fileUrl = innerEvent.target.result;
      }
    }
  }

  /**
    * Remove image
    * */
  imageRemove() {
    this.myFile.nativeElement.value = "";
    this.fileUrl = null;
    this.lightForm.get('imageFile').setValue('');
    this.fileToUpload = false;
    this.fileName = '';
  }

  /**
 * Get Zone List 
 * */
  getZoneTypeList() {
    this.spinner.show();
    this.lookupService.getZoneTypelist().subscribe(response => {
      if (response.isSuccess === true) {
        this.typeList = response.data;
      }
      else {
        this.hasZone = false;
        this._notificationService.add(new Notification('error', response.message));
      }
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
}
