import { Component, Inject, OnInit } from '@angular/core';
import { IWishlist, IWishlistTemplate, generateTemplateFromWishlist, mergeTemplates } from '../interfaces';
import { SessionService } from '../session.service';
import { FirestoreService } from '../firestore.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-wishlist-generator',
  templateUrl: './wishlist-generator.component.html',
  styleUrls: ['./wishlist-generator.component.css']
})
export class WishlistGeneratorComponent implements OnInit {
  public templatesList: Array<IWishlistTemplate>;
  public wishlistsList: Array<IWishlist>;
  public currentTemplateName: string = "";
  public newQuestionName: string = "";
  public showNewQuestionField: boolean = false;
  public hideNewQuestionField: boolean = true;

  public wishlist: IWishlist = {
    name: "",
  }
  public template: IWishlistTemplate = {
    name: "",
    questions: []
  }

  constructor(public session: SessionService,
              public firestore: FirestoreService,
              public dialogRef: MatDialogRef<WishlistGeneratorComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.templatesList = session.getUserWishlistTemplates();
    this.wishlistsList = session.getUserWishlists();
    if(this.templatesList.length < 1)
      return;
    
    if(data.type == "edit") {
      this.loadWishlist(data.source);
    }
      
    // Make local list of templates a deep copy. Make first entry the merge:
    // Combine current selected wishlist template with the current template.
    
    
    this.selectTemplate(this.templatesList[0].name);
    // this.wishlist.name = this.templatesList[0].name;
  }

  ngOnInit(): void {
  }

  public loadWishlist(wishlistName: string) {
    this.wishlistsList.forEach(wishlist => {
      if(wishlist.name == wishlistName) {
        this.wishlist = wishlist;
      }
    });
  }

  public selectTemplate(templateName: string) {
    this.currentTemplateName = templateName
    
    this.templatesList.forEach(template => {
      if(template.name == this.currentTemplateName)
        this.template  = JSON.parse(JSON.stringify(template));
    });

    const templateFromData = generateTemplateFromWishlist(this.wishlist);
    const combinedTemplate = mergeTemplates(this.template, templateFromData);
    // this.templatesList = [  ...this.templatesList ];
    this.template = combinedTemplate;

    console.log(this.currentTemplateName, this.template);
  }

  public clickAddQuestion() {
    if(!this.showNewQuestionField) {
      this.hideNewQuestionField = false;
      this.showNewQuestionField = true;
    }
    else {
      if(this.newQuestionName.length < 2) 
        return;

      setTimeout(() => {
        this.showNewQuestionField = false;
      }, 500);
      
      this.addQuestion();
    }
    
  }
  public addQuestion() {
    this.hideNewQuestionField = true;
    setTimeout(() => {
      this.template.questions.push(this.newQuestionName);
      this.newQuestionName = "";
    }, 500);
  }

  public saveWishlist() {
    if(this.wishlist.name.length < 1)
      return;
    
    this.session.addWishlistToUser(this.wishlist);
    this.firestore.updateUserData();
    this.dialogRef.close();
  }

  public autoGrowTextZone(event: Event): void {
    const textArea = event.target as HTMLTextAreaElement;
    textArea.style.height = 'auto';
    textArea.style.height = (textArea.scrollHeight + 28) + 'px';
  }
}
