import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Notification, NotificationService, BuildingService } from '../../../services';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConstant, MessageAlertDataModel, DeleteAlertDataModel } from '../../../app.constants';

import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { MessageDialogComponent, DeleteDialogComponent } from '../..';

@Component({
  selector: 'app-add-new-building',
  templateUrl: './add-new-building.component.html',
  styleUrls: ['./add-new-building.component.css']
})
export class AddNewbuildingComponent implements OnInit {
  @ViewChild('myFile', { static: false }) myFile: ElementRef;
  handleImgInput = false;
  hasImage = false;
  validstatus = false;
  MessageAlertDataModel: MessageAlertDataModel;
  deleteAlertDataModel: DeleteAlertDataModel;
  moduleName = "Add Building";
  fileUrl: any;
  fileName = '';
  fileToUpload: any;
  isEdit = false;
  buildingForm: FormGroup;
  checkSubmitStatus = false;
  countryList = [];
  stateList = [];
  mediaUrl: any;
  buttonname = 'Submit';
  buildingobject: any = {};
  currentImage: any;
  buildingGuid: any;

  constructor(
    private router: Router,
    private _notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    public _appConstant: AppConstant,
    public location: Location,
    public dialog: MatDialog,
    public buildingsService: BuildingService,
  ) {
    this.createFormGroup();
    this.activatedRoute.params.subscribe(params => {
      if (params.buildingGuid != 'add') {
        this.getBuldingDetails(params.buildingGuid);
        this.buildingGuid = params.buildingGuid;
        this.moduleName = "Edit building";
        this.isEdit = true;
        this.buttonname = 'Update'
      } else {
        this.buildingobject = { name: '', zipcode: '', countryGuid: '', stateGuid: '', isactive: 'true', city: '', latitude: '', longitude: '' }
      }
    });
  }

  ngOnInit() {
    this.mediaUrl = this._notificationService.apiBaseUrl;
    this.getcountryList();
  }
 /**
   * Image Remove
   */
  imageRemove() {
    this.myFile.nativeElement.value = "";
    if (this.buildingobject['image'] == this.currentImage) {
      this.buildingForm.get('imageFile').setValue('');
      if (!this.handleImgInput) {
        this.handleImgInput = false;
        this.deleteImgModel();
      }
      else {
        this.handleImgInput = false;
      }
    }
    else {
      if (this.currentImage) {
        this.spinner.hide();
        this.buildingobject['image'] = this.currentImage;
        this.fileToUpload = false;
        this.fileName = '';
        this.fileUrl = null;
      }
      else {
        this.spinner.hide();
        this.buildingobject['image'] = null;
        this.buildingForm.get('imageFile').setValue('');
        this.fileToUpload = false;
        this.fileName = '';
        this.fileUrl = null;
      }
    }

  }

/**
   * Image Remove 
   */
  deleteImgModel() {
    this.deleteAlertDataModel = {
      title: "Delete Image",
      message: this._appConstant.msgConfirm.replace('modulename', "Building Image"),
      okButtonName: "Confirm",
      cancelButtonName: "Cancel",
    };
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      data: this.deleteAlertDataModel,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletebuildingImg();
      }
    });
  }
/**
   * Image Delete 
   */
  deletebuildingImg() {
    this.spinner.show();
    this.buildingsService.removeImage(this.buildingGuid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.currentImage = '';
        this.buildingobject['image'] = null;
        this.buildingForm.get('imageFile').setValue('');
        this.buildingForm.get('imageFile').setValue('');
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Building Image")));
      } else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

 /**
   * Form Group Object
   */

  createFormGroup() {
    this.buildingForm = new FormGroup({
      parentEntityGuid: new FormControl(''),
      countryGuid: new FormControl(null, [Validators.required]),
      stateGuid: new FormControl(null, [Validators.required]),
      city: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      zipcode: new FormControl('', [Validators.required, Validators.pattern('^[A-Z0-9 _]*$')]),
      description: new FormControl(''),
      address: new FormControl('', [Validators.required]),
      address2: new FormControl(''),
      isActive: new FormControl('', [Validators.required]),
      guid: new FormControl(null),
      latitude: new FormControl('', [Validators.required, Validators.pattern('^(\\+|-)?(?:90(?:(?:\\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\\.[0-9]{1,6})?))$')]),
      longitude: new FormControl('', [Validators.required, Validators.pattern('^(\\+|-)?(?:180(?:(?:\\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\\.[0-9]{1,6})?))$')]),
      imageFile: new FormControl(''),
    });
  }
/**
   * Get Image Onchange Event
   */

  handleImageInput(event) {
    this.handleImgInput = true;
    let files = event.target.files;
    var that = this;
    if (files.length) {
      let fileType = files.item(0).name.split('.');
      let imagesTypes = ['jpeg', 'JPEG', 'jpg', 'JPG', 'png', 'PNG'];
      if (imagesTypes.indexOf(fileType[fileType.length - 1]) !== -1) {
        this.validstatus = true;
        this.fileName = files.item(0).name;
        this.fileToUpload = files.item(0);
        if (event.target.files && event.target.files[0]) {
          var reader = new FileReader();
          reader.readAsDataURL(event.target.files[0]);
          reader.onload = (innerEvent: any) => {
            this.fileUrl = innerEvent.target.result;
            that.buildingobject.image = this.fileUrl;

          }
        }
      } else {
        this.imageRemove();
        this.MessageAlertDataModel = {
          title: "Building Image",
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
   * Get Country List
   */
  getcountryList() {
    this.spinner.show();
    this.buildingsService.getcountryList().subscribe(response => {
      this.spinner.hide();
      this.countryList = response.data;
    });
  }
/**
   * Get State List By stateGuid
   */
  changeCountry(event) {
    this.buildingForm.controls['stateGuid'].setValue(null, { emitEvent: true })
    if (event) {
      let id = event.value;
      this.spinner.show();
      this.buildingsService.getstatelist(id).subscribe(response => {
        this.spinner.hide();
        this.stateList = response.data;
      });
    }
  }
/**
   * LowerCase Value Callback
   */
  getdata(val) {
    return val = val.toLowerCase();
  }
/**
   * Add Building Data
   */
  manageBuilding() {

    this.checkSubmitStatus = true;
    if (this.isEdit) {
      this.buildingForm.get('guid').setValue(this.buildingGuid);
      this.buildingForm.get('isActive').setValue(this.buildingobject['isActive']);
    } else {
      this.buildingForm.get('isActive').setValue(true);
    }
    if (this.buildingForm.status === "VALID") {
      if (this.validstatus == true || !this.buildingForm.value.imageFile) {
        if (this.fileToUpload) {
          this.buildingForm.get('imageFile').setValue(this.fileToUpload);
        }
        this.spinner.show();
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.buildingForm.get('parentEntityGuid').setValue(currentUser.userDetail.entityGuid);

        this.buildingsService.addBuilding(this.buildingForm.value).subscribe(response => {
          this.spinner.hide();
          if (response.isSuccess === true) {
            if (this.isEdit) {
              this._notificationService.add(new Notification('success', " Building updated successfully."));
            } else {
              this._notificationService.add(new Notification('success', "Building created successfully."));
            }
            this.router.navigate(['/buildings']);
          } else {
            this._notificationService.add(new Notification('error', response.message));
          }
        });
      } else {
        this.MessageAlertDataModel = {
          title: "Building Image",
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

  getBuldingDetails(buildingGuid) {
    this.spinner.show();
    this.buildingsService.getBuildingDetails(buildingGuid).subscribe(response => {
      if (response.isSuccess === true) {
        this.buildingobject = response.data;
        if (this.buildingobject.image) {
          this.buildingobject.image = this.mediaUrl + this.buildingobject.image;
          this.currentImage = this.buildingobject.image;
          this.hasImage = true;
        } else {
          this.hasImage = false;
        }
        this.buildingsService.getstatelist(response.data.countryGuid).subscribe(response => {
          this.spinner.hide();
          this.stateList = response.data;
        });
      }
    });
  }
}
