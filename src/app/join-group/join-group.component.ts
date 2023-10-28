import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import { IGroup } from '../interfaces';
import { SessionService } from '../session.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-join-group',
  templateUrl: './join-group.component.html',
  styleUrls: ['./join-group.component.css']
})
export class JoinGroupComponent implements OnInit {
  public joinCode: string = "";
  public prevJoinCode: string = "";
  public group!: IGroup;
  public hasGroup: boolean = false;
  public clickedJoinCount: number = 0;
  public identifyParticipant: string = "";
  public hasIdentifiedParticipant: boolean = false;

  constructor(private session: SessionService,
              private firestore: FirestoreService,
              public dialogRef: MatDialogRef<JoinGroupComponent>,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  public clickJoin() {
    this.clickedJoinCount += 1;

    switch(this.clickedJoinCount) {
      case 1: {
        return;
      }
      case 2: {
        this.joinGroup();
      }
    }
  }

  private async joinGroup() {
    console.log("joining group");
    await this.firestore.updateParticipant(this.group.name, this.group.adminName, this.identifyParticipant, this.session.getUser().id);
    this.session.addUserWishlistTemplate(this.group.wishlistTemplate);
    this.firestore.updateUserData();
    this.session.addLocalGroup(this.group);
    
    this.snackBar.open(`Joined ${this.group.name}`, "OK", {duration: 3000} );
    this.dialogRef.close();
  }

  public async jobCodeInputKeyUp() {
    this.joinCode = this.joinCode.toUpperCase();
    if(this.joinCode === this.prevJoinCode)
      return;
    
    try {
      const foundGroup = await this.firestore.getGroupFromJoinCode(this.joinCode);
      if(foundGroup) {
        console.log("Found Group", foundGroup);
        this.hasGroup = true;
        this.group = <IGroup>foundGroup;
      }
      else {
        this.hasGroup = false;
        this.hasIdentifiedParticipant = false;
        this.clickedJoinCount = 0;
      }

      this.prevJoinCode = this.joinCode;
    } catch (error) {
      console.log(error);
    }
  }

  public selectIdentifyParticipant() {
    console.log(this.identifyParticipant);
    this.hasIdentifiedParticipant = true;
  }

  public getRemainingParticipants(): Array<string> {
    let ptcpts: Array<string> = [];
    this.getObjectKeys(this.group.participants).forEach( ptcpt => {
      if(this.group.participants[ptcpt] == "")
        ptcpts.push(ptcpt);
    });
    return ptcpts;
  }

  public getObjectKeys(object: any): string[] {
    return Object.keys(object);
  }
}
