import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IGroup, IGroupEditableFields, IWishlist } from '../interfaces';
import { SessionService } from '../session.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirestoreService } from '../firestore.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteGroupComponent } from '../delete-group/delete-group.component';
import { GenerateMatchesComponent } from '../generate-matches/generate-matches.component';

@Component({
  selector: 'app-view-group',
  templateUrl: './view-group.component.html',
  styleUrls: ['./view-group.component.css']
})
export class ViewGroupComponent implements OnInit {
  public group!: IGroup;
  public isAdmin: boolean = false;
  public selectedWishlist!: IWishlist;
  public isReady: boolean = false;
  public participantName: string = "";
  public participants: Array<string> = [];
  public recipientName: string = "";
  public recipientWishlist!: IWishlist;
  public displayedColumns: string[] = ['position', 'name', 'attendance', 'ready', 'wishlist'];


  constructor(public session: SessionService,
              private firestore: FirestoreService,
              private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private router: Router,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      const name = params['name'];
      const index = params['index'];
      const groupFound = this.findGroupByName(name, index);
      
      if(groupFound.status == -1) {
        this.snackBar.open("Error Finding Secret Santa Group...", "OK", {duration: 3000} );
        this.router.navigate(["/"]);
        return;
      }

      this.group = <IGroup>groupFound.group;
      console.log("Search Status: ", groupFound.status);

      this.checkIsAdmin();
      this.getParticipantName();
      this.participants = Object.keys(this.group.participants);

      this.isReady = this.group.participantsReady[this.participantName];
      this.selectedWishlist = <IWishlist>this.session.getWishlists().find( obj => obj.name == this.group.wishlists[this.participantName]);

      if(this.group.isGenerated) {
        this.recipientName = this.group.santas[this.participantName];
        this.recipientWishlist = <IWishlist> await this.firestore.getRecipientWishlist(this.recipientName, this.group.participants[this.recipientName], this.group.wishlists[this.recipientName]);
      }
    });
  }

  public getLines(text:string) {
    const lineBreaks = text.match(/(\r\n|\r|\n)/g);
    return 1+(lineBreaks ? lineBreaks.length : 0);
  }

  public selectWishlist() {
    console.log(this.selectedWishlist);

    let fields: IGroupEditableFields = { wishlists: {} };
    if (fields.wishlists)
      fields.wishlists[this.participantName] = this.selectedWishlist.name;
    this.firestore.updateGroupData(this.group.name, this.group.adminName, fields)
      .then(() => {
        this.group.wishlists[this.participantName] = this.selectedWishlist.name;
        this.firestore.refreshGroups();
      });
  }

  public readySliderToggled() {
    console.log(this.isReady);
    let fields: IGroupEditableFields = { participantsReady: {} };
    if (fields.participantsReady)
      fields.participantsReady[this.participantName] = this.isReady;
    this.firestore.updateGroupData(this.group.name, this.group.adminName, fields)
      .then(() => {
        this.group.participantsReady[this.participantName] = this.isReady;
      });
  }

  public checkAttendance(name: string):boolean {
    return <boolean>(this.group.participants[name] && this.group.participants[name].length > 1);
  }

  public clickGenerate() {
    const dialogRef = this.dialog.open(GenerateMatchesComponent, { 
      width: '90vw', 
      minHeight: '25vh',
      maxHeight: '90vh',
      data: {
        group: this.group,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined && result.wasGenerated) {
        this.group = result.group;
        this.recipientName = this.group.santas[this.participantName];
        console.log(this.group);
      }
    });
  }

  public clickDeleteGroup() {
    const dialogRef = this.dialog.open(DeleteGroupComponent, { 
      width: '70vw', 
      minHeight: '25vh',
      maxHeight: '90vh',
      data: {
        group: this.group,
      }
    });

    dialogRef.afterClosed().subscribe(wasDeleted => {
      if(wasDeleted)
        this.router.navigate(['/']);
    });
  }

  private findGroupByName(name: string, index: number): { group: IGroup | null, status: number } {
    const groups = this.session.getGroups();
    if (index >= 0 && index < groups.length && groups[index].name === name)
      return { group: groups[index], status: 1 };
    else {
      const foundGroup = groups.find(group => group.name === name);
      const status = foundGroup ? 0 : -1;
      return { group: foundGroup || null, status };
    }
  }

  private checkIsAdmin() {
    this.isAdmin = this.session.getUser().id == this.group.participants[this.group.adminName];
  }

  private getParticipantName() {
    const myId = this.session.getUser().id;
    Object.keys(this.group.participants).forEach(ptcpt => {
      if(this.group.participants[ptcpt] == myId) {
        console.log("I am", ptcpt, myId);
        this.participantName = ptcpt;
      }
    });
  }

  public canGenerate() {
    let allReady = true;
    this.getObjectKeys(this.group.participantsReady).forEach(ptcpt => {
        if(!this.group.participantsReady[ptcpt])
          allReady = false;
      });

    return !this.group.isGenerated && allReady;
  }

  public getObjectKeys(obj: Object) {
    if(obj)
      return Object.keys(obj);
    else
      return [];
  }
}
