import { Component, OnInit, ViewChild } from '@angular/core';
import { IGroup, IWishlistTemplate, generateNewJoinCode, generateTemplateFromWishlist, mergeTemplates } from '../interfaces';
import { SessionService } from '../session.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarYesnoComponent } from '../snackbar-yesno/snackbar-yesno.component';
import { MatSelect } from '@angular/material/select';
import { FirestoreService } from '../firestore.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-group-generator',
  templateUrl: './group-generator.component.html',
  styleUrls: ['./group-generator.component.css']
})
export class GroupGeneratorComponent implements OnInit {
  public group: IGroup;
  public participants: Array<string> = []
  public noMatchPairs: { [name: string]: string };
  public currentNoMatchPtcpt: string = "";
  public currentNoMatchPair: string = "";
  @ViewChild('noMatchPtcptSelect') noMatchPtcptSelect!: MatSelect;
  public currentTemplateName: string = "";
  public wishlistTemplate: IWishlistTemplate;
  public templatesList: Array<IWishlistTemplate> = [];
  private previousGroupName: string = "";
  

  constructor(private session: SessionService,
              private firestore: FirestoreService,
              public dialogRef: MatDialogRef<GroupGeneratorComponent>,
              private snackBar: MatSnackBar) {
    const thisUsername = session.getUser().name;
    this.group = {
      name: "",
      adminName: "",
      budget: 20,
      participants: { },
      participantsReady: {},
      noMatchPairs: {},
      wishlistTemplate: { name: "", questions: [] },
      wishlists: {},
      isGenerated: false,
      santas: {},
      joinCode: ""
    }
    this.participants.push(thisUsername);
    this.participants = [ ...this.participants, "Hachi", "Cinni", "Timmi", "Ivy"];

    this.templatesList = this.session.getUser().wishlistTemplates;
    if(this.templatesList.length > 0) {
      this.wishlistTemplate = JSON.parse(JSON.stringify(this.templatesList[0]));
      this.wishlistTemplate.name = "";
    }
    else
      this.wishlistTemplate = { name: "", questions: [] };

    this.noMatchPairs = {};
  }

  ngOnInit(): void {
  }

  public async clickComplete() {
    if(this.group.name.length < 2) 
      return this.openSnackbar("You must name this Secret Santa.");

    if(this.participants.length < 3) 
      return this.openSnackbar("You must enter at least 3 participants.");

    this.participants.forEach(ptcpt => {
        if(ptcpt != "") {
          this.group.participants[ptcpt] = "";
          this.group.participantsReady[ptcpt] = false;
        }
      });
    this.group.participants[this.participants[0]] = this.session.getUser().id;

    this.group.noMatchPairs = this.verifyNoMatchPairs();

    this.group.wishlistTemplate = this.wishlistTemplate;

    this.group.adminName = this.getObjectKeys(this.group.participants)[0];

    console.log("Completed: ", this.group);

    do {
      this.group.joinCode = generateNewJoinCode();
    } while (await this.firestore.checkIfJoinCodeExists(this.group.joinCode));

    this.session.addUserWishlistTemplate(this.wishlistTemplate);
    this.firestore.updateUserData();
    await this.firestore.createNewGroup(this.group).then(
      () => {
        this.snackBar.open(`Created ${this.group.name}`, "OK", {duration: 3000} );
        this.dialogRef.close();
      }
    );
    this.session.addLocalGroup(this.group);
  }

  public nameGroupFocusOut() {
    if(this.wishlistTemplate.name.length < 2 || this.wishlistTemplate.name === this.previousGroupName)
      this.wishlistTemplate.name = this.group.name;
    this.previousGroupName = this.group.name;
  }

  private verifyNoMatchPairs() {
    this.getObjectKeys(this.noMatchPairs).forEach(ptcpt => {
        if(!this.group.participants.hasOwnProperty(ptcpt) || this.group.noMatchPairs[ptcpt] == "")
          delete this.noMatchPairs[ptcpt];
      });
    return this.noMatchPairs;
  }
  public selectNoMatchParticipant(participant: string) {
    this.noMatchPairs[participant] = "";
    console.log("selectNoMatchParticipant", this.noMatchPairs);
    this.noMatchPtcptSelect.value = null;
  }
  public selectNoMatchPair(participant: string) {
    console.log(participant, this.noMatchPairs[participant]);
    if(this.noMatchPairs[participant] === null)
      delete this.noMatchPairs[participant];
    console.log("selectNoMatchPair", this.noMatchPairs);
  }
  public noMatchHasBeenSelected(participant: string) {
    return this.noMatchPairs.hasOwnProperty(participant);
  }

  public addedPtcptInputFocusOut(index: number) {
    if(this.participants[index] == "") {
      // Remove this element from the list
      this.participants.splice(index, 1);
    }
  }
  public clickAddParticipant() {
    this.participants.push("");
    console.log(this.participants);
  }

  public selectTemplate(templateName: string) {
    this.currentTemplateName = templateName
    let newtmplt = {};
    
    this.templatesList.forEach(template => {
      if(template.name == this.currentTemplateName)
        newtmplt = JSON.parse(JSON.stringify(template));
    });

    const combinedTemplate = mergeTemplates(this.wishlistTemplate, <IWishlistTemplate>newtmplt);
    this.wishlistTemplate = combinedTemplate;
  }
  public questionInputFocusOut(questionIndex: number) {
    if(this.wishlistTemplate.questions[questionIndex] == "") {
      this.wishlistTemplate.questions.splice(questionIndex, 1);
    }
  }
  public clickAddQuestion() {
    if(this.wishlistTemplate.questions[this.wishlistTemplate.questions.length-1] == "") 
      return;
    this.wishlistTemplate.questions.push("");
  }

  private openSnackbar(message: string, duration=3000) {
    this.snackBar.open(message, '', {
      duration: duration, // Duration in milliseconds (Optional)
      horizontalPosition: 'center', // Position: 'start', 'center', 'end', or 'left', 'right'
      verticalPosition: 'bottom', // Position: 'top' or 'bottom'
    });
  }

  public getObjectKeys(object: any): string[] {
    return Object.keys(object);
  }

  public trackByIndex(index: number, item: any): number {
    return index;
  }
}
