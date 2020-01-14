import { Component, Injectable, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LanguageService } from '../../services/language.service';
import { ModalService } from 'yti-common-ui/services/modal.service';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../../entities/user';
import { UserType } from '../../services/api-schema';
import { EditableService } from '../../services/editable.service';
import { TempUser } from '../../entities/tempuser';
import { contains } from 'yti-common-ui/utils/array';

@Component({
  selector: 'app-add-temp-users-modal',
  providers: [EditableService],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <a><i id="close_modal_link" class="fa fa-times" (click)="cancel()"></i></a>
        <span>{{titleLabel}}</span>
      </h4>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-12">
          <form [formGroup]="userForm" #form="ngForm">
            <app-literal-input class="col-md-12"
                               [id]="'user_firstname_input'"
                               [label]="'First name' | translate"
                               [required]="true"
                               [infoText]="'INFO_TEXT_USER_FIRSTNAME'"
                               [formControlName]="'firstName'"></app-literal-input>

            <app-literal-input class="col-md-12"
                               [id]="'user_lastname_input'"
                               [label]="'Last name' | translate"
                               [required]="true"
                               [infoText]="'INFO_TEXT_USER_LASTNAME'"
                               [formControlName]="'lastName'"></app-literal-input>

            <app-literal-input class="col-md-12"
                               [id]="'user_email_input'"
                               [label]="'Email' | translate"
                               [required]="true"
                               [infoText]="'INFO_TEXT_USER_EMAIL'"
                               [formControlName]="'email'"></app-literal-input>
          </form>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button id="add_user_button"
              type="button"
              class="btn btn-action"
              [disabled]="!userForm.valid"
              (click)="addUser()">
        <span translate>Add</span>
      </button>
      <button id="cancel_modal_button"
              type="button"
              class="btn btn-link cancel"
              (click)="cancel()">
        <span translate>Cancel</span>
      </button>
    </div>
  `
})
export class AddTempUsersModalComponent {

  @Input() restrictedEmails: string[];
  @Input() titleLabel: string;
  @Input() addLabel: string;
  @Input() useUILanguage: boolean;

  emailValidator = '(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])';

  userForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, this.filterEmails.bind(this), this.validateEmail.bind(this)])
  }, null);

  constructor(public modal: NgbActiveModal,
              private editableService: EditableService,
              public languageService: LanguageService) {

    this.editableService.edit();
  }

  addUser() {

    const userType: UserType = <UserType>{
      firstName: this.userForm.controls['firstName'].value,
      lastName: this.userForm.controls['lastName'].value,
      email: this.userForm.controls['email'].value
    };
    const user: User = new User(userType);
    this.modal.close(user);
  }

  cancel() {

    this.modal.dismiss('cancel');
  }

  filterEmails(control: AbstractControl) {
    if (this.restrictedEmails != null && control.value != null && control.value.length > 0) {
      const isNotRestricted = !contains(this.restrictedEmails, control.value.toLowerCase());
      return !isNotRestricted ? { 'emailExistsError': { value: control.value } } : null;
    }
    return null;
  }

  validateEmail(control: AbstractControl) {
    if (control.value != null && control.value.length > 0) {
      const isEmailValid = control.value.match(this.emailValidator);
      return !isEmailValid ? { 'emailValidationError': { value: control.value } } : null;
    }
    return null;
  }
}

@Injectable()
export class AddTempUsersModalService {

  constructor(private modalService: ModalService) {
  }

  open(titleLabel: string,
       addLabel: string,
       restrictedEmails: string[],
       useUILanguage: boolean = false): Promise<TempUser> {

    const modalRef = this.modalService.open(AddTempUsersModalComponent, { size: 'sm' });
    const instance = modalRef.componentInstance as AddTempUsersModalComponent;
    instance.titleLabel = titleLabel;
    instance.addLabel = addLabel;
    instance.restrictedEmails = restrictedEmails;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
