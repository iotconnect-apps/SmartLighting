import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms'
import { NgxSpinnerService } from 'ngx-spinner'
import { UserService, NotificationService, Notification } from '../../../services';
import { CustomValidators } from '../../../helpers/custom.validators';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css']
})
export class UserAddComponent implements OnInit {
  public contactNoError:boolean=false;
  public mask = {
    guide: true,
    showMask: false,
    keepCharPositions: true,
    mask: ['(', /[0-9]/, /\d/, ')', '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/]
  };
  status;
  moduleName = "Add User";
  userObject = {};
  userGuid = '';
  isEdit = false;
  userForm: FormGroup;
  checkSubmitStatus = false;
  roleList = [];
  buttonname = 'SUBMIT'
  arrystatus = [{ "name": "Active", "value": true }, { "name": "Inactive", "value": false }]
  timezoneList = [];
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private _notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    public userService: UserService,
  ) {
    this.activatedRoute.params.subscribe(params => {
      if (params.userGuid != 'add') {
        this.getUserDetails(params.userGuid);
        this.userGuid = params.userGuid;
        this.moduleName = "Edit User";
        this.isEdit = true;
        this.buttonname = 'UPDATE'
        this.getRoleList();
        setTimeout(() => {
          this.getTimezoneList();
          
        }, 300);
      } else {
        this.userObject = { firstName: '', lastName: '', email: '', contactNo: '', roleGuid: '', timezoneGuid: '', isActive: '' }
        this.getRoleList();
        setTimeout(() => {
          this.getTimezoneList();
          
        }, 300);
      }
    });
    this.createFormGroup();
  }

  ngOnInit() {
  }
  /**
 * Load Form Group
 * */
  createFormGroup() {

    this.userForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{value:'',readonly: this.isEdit}, [Validators.required, Validators.email]],
      contactNo: ['', Validators.required],
      entityGuid: [''],
      isActive: [''],
      roleGuid: ['', Validators.required],
      timeZoneGuid: ['', Validators.required]
    }, {
      validators: CustomValidators.checkPhoneValue('contactNo')
    });
  }
  /**
 * Get RoleList
 * */
  getRoleList() {
    this.spinner.show();
    this.userService.getroleList().subscribe(response => {
      this.roleList = response.data;
      this.roleList = this.roleList.filter(word => word.isActive == true);
    });
  }
  /**
 * Get TimezoneList
 * */
  getTimezoneList() {
    this.userService.getTimezoneList().subscribe(response => {
      this.spinner.hide();
      this.timezoneList = response.data;
    });
  }
  /**
 * Add User
 * */
  addUser() {
    this.checkSubmitStatus = true;
    let contactNo = this.userForm.value.contactNo.replace("(", "")
    let contactno = contactNo.replace(")", "")
    let finalcontactno = contactno.replace("-", "")
    if(finalcontactno.match(/^0+$/)){
      this.contactNoError=true;
      return
    } else {
      this.contactNoError=false;
    }
    if (this.userForm.status === "VALID") {
      if (this.isEdit) {
        this.userForm.registerControl("id", new FormControl(''));
        this.userForm.patchValue({ "id": this.userGuid });
        this.userForm.get('isActive').setValue(this.userObject['isActive']);
      } else {
        this.userForm.get('isActive').setValue(true);
      }
      this.spinner.show();
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.userForm.get('entityGuid').setValue(currentUser.userDetail.entityGuid);
      this.userForm.get('contactNo').setValue(contactno);
      this.userService.addUser(this.userForm.value).subscribe(response => {
        if (response.isSuccess === true) {
          this.spinner.hide();
          if (response.data.updatedBy != null) {
            this._notificationService.add(new Notification('success', "User updated successfully."));
          } else {
            this._notificationService.add(new Notification('success', "User created successfully."));
          }
          this.router.navigate(['/users']);
        } else {
          this.spinner.hide();
          this._notificationService.add(new Notification('error', response.message));
        }
      })
    }
  }
  /**
 * Get UserDetail by userGuid
 * */
  getUserDetails(userGuid) {
    this.spinner.show();
    this.userService.getUserDetails(userGuid).subscribe(response => {
      if (response.isSuccess === true) {
        this.userObject = response.data;
      }
    });
  }
  /**
 * Convert To lowercase
 * @param val
 * */
  getdata(val) {
    return val = val.toLowerCase();
  }
}
