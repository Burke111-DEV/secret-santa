import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IUser } from '../interfaces';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {
  public userData:IUser = {
    name: "",
    id: "",
    wishlists: [],
    wishlistTemplates: [],
    groups: []
  }

  constructor(private session: SessionService,
              public dialogRef: MatDialogRef<CreateUserComponent>) { }

  ngOnInit(): void {
      this.userData.id = this.session.getAuthUser().uid;
  }

  public userCreated() {
    if(this.userData.name.length < 1) return;
    this.dialogRef.close(this.userData);
  }

}
