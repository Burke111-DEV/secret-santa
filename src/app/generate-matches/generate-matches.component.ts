import { Component, Inject, OnInit } from '@angular/core';
import { IGroup, IGroupEditableFields } from '../interfaces';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteGroupComponent } from '../delete-group/delete-group.component';
import { FirestoreService } from '../firestore.service';
import { SessionService } from '../session.service';

const anonymisedNames = [ "Alice", "Benjamin", "Charlotte", "Daniel", "Emily", "Finn", "Grace", "Henry", "Isabella", "Jack", "Katherine", "Liam", "Mia", "Noah", "Olivia", "Penelope", "Quinlan", "Ruby", "Samuel", "Taylor", "Ava", "Bryce", "Chloe", "David", "Ella", "Freddie", "Georgia", "Hannah", "Isaac", "Jessica", "Kevin", "Lily", "Matthew", "Nora", "Owen", "Paige", "Quinn", "Rachel", "Sophia", "Thomas", "Ursula", "Victor", "Wendy", "Xander", "Yasmine", "Zachary" ];

@Component({
  selector: 'app-generate-matches',
  templateUrl: './generate-matches.component.html',
  styleUrls: ['./generate-matches.component.css']
})
export class GenerateMatchesComponent implements OnInit {
  public group: IGroup;
  public anonymisedSantas: { [santaName: string]: string; } = {};
  public noMatchdisplayedColumns: string[] = ['userA', 'userB',];
  public samtasDisplayedColumns: string[] = ['Santa', 'Recipient'];
  private clickedGenerated: boolean = false;
  private clickedSave: boolean = false;
  public hasSantas: boolean = false;

  constructor(public session: SessionService,
              private firestore: FirestoreService,
              private dialogRef: MatDialogRef<DeleteGroupComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private snackBar: MatSnackBar) {
                this.group = data.group;
              }

  ngOnInit(): void {
  }

  public clickOk() {
    if(this.clickedSave) return;
    this.clickedSave = true;
    setTimeout(() => this.clickedSave = false, 1000);
    
    this.saveMatches();
  }

  public saveMatches() {
    this.group.isGenerated = true;
    let fields: IGroupEditableFields = { santas: this.group.santas, isGenerated: this.group.isGenerated };

    this.firestore.updateGroupData(this.group.name, this.group.adminName, fields)
      .then(() => {
        this.firestore.refreshGroups();
        this.dialogRef.close({
          wasGenerated: true,
          group: this.group
        });
      })
      .catch(() => {
        this.snackBar.open("Failed to save santa matches...", '', { duration: 3000 });
      });
  }

  public clickGenerate(): any {
    if(this.clickedGenerated) return;
    this.clickedGenerated = true;
    const t = 1000 + (this.getObjectKeys(this.group.santas).length*150);
    setTimeout(() => this.clickedGenerated = false, t);
    this.hasSantas = false;

    this.group.santas = {};
    this.anonymisedSantas = {};

    const generateSantasResults = this.generateSantas(this.group);
    console.log("Generate Results", generateSantasResults);

    if(!generateSantasResults)
      return this.snackBar.open("Failed to generate santas :(", '', { duration: 3000 });

    this.group.santas = <{ [santaName: string]: string; }>generateSantasResults;

    this.anonymiseSantas();
    setTimeout(() => {
      this.hasSantas = true;
    }, t);
  }

  private anonymiseSantas() {
    const participants = this.getObjectKeys(this.group.participants);
    const participantAnonMap: { [santaName: string]: number } = {};

    participants.forEach(ptcpt => {
        let r;
        do {
            r = Math.floor(Math.random() * anonymisedNames.length-1);
        } while (Object.values(participantAnonMap).includes(r));
        
        participantAnonMap[ptcpt] = r;
    });

    let i = 0;
    participants.forEach(ptcpt => {
      const anonSantaName = anonymisedNames[participantAnonMap[ptcpt]];
      const anonRecipientName = anonymisedNames[participantAnonMap[this.group.santas[ptcpt]]];
      setTimeout(() => {
        this.anonymisedSantas[anonSantaName] = anonRecipientName;
      }, 500+(i*150));
      i++;
    });
}

  private generateSantas(group: IGroup): { [santaName: string]: string } | boolean {
    const participantsArray = Object.keys(group.participants);
    let santas: { [santaName: string]: string } = {};
    let attempts = 0;
  
    while (attempts < 30) {
      // Randomly shuffle participants array
      participantsArray.sort(() => Math.random() - 0.5);
  
      // Generate santas pairings
      santas = {};
      let isValidPairing = true;
  
      for (let i = 0; i < participantsArray.length; i++) {
        const santa = participantsArray[i];
        const recipient = participantsArray[(i + 1) % participantsArray.length];
  
        // Check if the pairing violates noMatchPairs
        if (group.noMatchPairs[santa] === recipient || group.noMatchPairs[recipient] === santa) {
          isValidPairing = false;
          break;
        }
  
        santas[santa] = recipient;
      }
  
      if (isValidPairing)
        return santas;
      else 
        console.log("Bad Pairing", attempts);
  
      attempts++;
    }
  
    return false;
  }

  public getObjectKeys(obj: Object) {
    if(obj)
      return Object.keys(obj);
    else
      return [];
  }
}
