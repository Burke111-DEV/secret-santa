import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GroupGeneratorComponent } from '../group-generator/group-generator.component';
import { JoinGroupComponent } from '../join-group/join-group.component';
import { FirestoreService } from '../firestore.service';
import { IGroup } from '../interfaces';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  constructor(public session: SessionService, 
              private router: Router,
              private firestore: FirestoreService,
              public dialog: MatDialog) {
    if(session.getAuthUser() == undefined) {
      router.navigate(['/', 'login']);
    }
  }

  ngOnInit(): void {
    this.firestore.getGroupsByParticipant(this.session.getUser().name, this.session.getUser().id)
      .then((groups: Array<IGroup>) => {
        console.log(groups);
        if(groups)
          this.session.setGroups([ ...groups]);
      });
  }

  public clickSetupNewGroup() {
    const dialogRef = this.dialog.open(GroupGeneratorComponent, { 
      width: '85vw', 
      minHeight: '50vh',
      maxHeight: '90vh',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => { });
  }

  public clickJoinGroup() {
    const dialogRef = this.dialog.open(JoinGroupComponent, { 
      width: '85vw', 
      minHeight: '50vh',
      maxHeight: '90vh',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => { });
  }
}
