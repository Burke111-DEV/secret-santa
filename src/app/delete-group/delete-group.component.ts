import { Component, Inject, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { FirestoreService } from '../firestore.service';
import { IGroup } from '../interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-delete-group',
  templateUrl: './delete-group.component.html',
  styleUrls: ['./delete-group.component.css']
})
export class DeleteGroupComponent implements OnInit {
  public group: IGroup;
  public clicked: boolean = false;

  constructor(public session: SessionService,
              private firestore: FirestoreService,
              private dialogRef: MatDialogRef<DeleteGroupComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private snackBar: MatSnackBar) {
                this.group = data.group;
              }

  ngOnInit(): void {
  }

  public clickOK() {
    if(this.clicked) return;
    this.clicked = true;
    setTimeout(() => this.clicked = false, 3000);

    this.deleteGroup()
      .then( result => {
        console.log("OK", result);
        this.snackBar.open(`Deleted ${this.group.name}`, '', {duration: 3000});
        this.session.deleteLocalGroup(this.group.name);
        this.dialogRef.close(true);
      })
      .catch( result => {
        console.log("noK", result);
        this.snackBar.open(`Failed to delete all data for ${this.group.name}`, '', {duration: 3000});
        this.dialogRef.close(true);
      });
  }

  private deleteGroup() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.firestore.deleteGroup(this.group.name, this.group.adminName);
      } catch (error) {
        console.log("Failed to delete group", error);
        return reject("ERROR");
      }

      try {
        Object.keys(this.group.participants).forEach(async (ptcpt) => {
            if(<boolean>(this.group.participants[ptcpt] && this.group.participants[ptcpt].length > 1))
              await this.firestore.removeWishlistTemplateFromUser(ptcpt, this.group.name);
          });
        return resolve("OK");
      } catch (error) {
        console.log("Failed to delete template from users", error);
        return reject("ERROR");
      }
    });
  }

  public clickCancel() {
    if(this.clicked) return;
    this.clicked = true;
    setTimeout(() => this.clicked = false, 3000);

    setTimeout(() => {
      this.dialogRef.close(false);
    }, 300);
  }
}
