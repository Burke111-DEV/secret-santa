import { Component, OnInit, ViewChild } from '@angular/core';
import { SessionService } from '../session.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarYesnoComponent } from '../snackbar-yesno/snackbar-yesno.component';
import { FirestoreService } from '../firestore.service';
import { WishlistGeneratorComponent } from '../wishlist-generator/wishlist-generator.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-wishlists',
  templateUrl: './wishlists.component.html',
  styleUrls: ['./wishlists.component.css']
})
export class WishlistsComponent implements OnInit {
  @ViewChild("wishlistsHeaderPanel") wishlistsHeaderPanel: any;
  @ViewChild("wishlistsEmptyPanel") wishlistsEmptyPanel: any;
  
  constructor(public session: SessionService,
              private firestore: FirestoreService,
              public dialog: MatDialog,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  public createWishlist() {
    const dialogRef = this.dialog.open(WishlistGeneratorComponent, { 
      width: '85vw', 
      minHeight: '50vh',
      maxHeight: '90vh',
      data: {
        type: "new"
      }
    });

    dialogRef.afterClosed().subscribe(result => { });
  }

  public getLines(text:string) {
    const lineBreaks = text.match(/(\r\n|\r|\n)/g);
    return 1+(lineBreaks ? lineBreaks.length : 0);
  }

  public editWishList(wishlist: string) {
    const dialogRef = this.dialog.open(WishlistGeneratorComponent, { 
      width: '85vw', 
      minHeight: '50vh',
      data: {
        type: "edit",
        source: wishlist,
      }
    });
    dialogRef.afterClosed().subscribe(result => { });
  }

  private async deleteWishlist(wishlistName: string) {
    // Check if this list is participating in a group - if so, cancel and warn.
    await this.firestore.clearWishlistFromGroups(wishlistName);
    this.session.deleteWishlistFromUser(wishlistName);
    this.firestore.updateUserData();
  }

  public async clickDeleteWishlist(wishlistName: string) {
    const response = await new Promise((resolve, reject) => {
      const snackBarRef = this.snackBar.openFromComponent(SnackbarYesnoComponent, {
        data: {
          message: `Delete ${wishlistName}?`,
          onYesClick: () => {
            snackBarRef.dismissWithAction(); // Close the Snackbar
            return resolve("OK");
          },
          onNoClick: () => {
            snackBarRef.dismissWithAction(); // Close the Snackbar
            return resolve("NO");
          },
        },
        duration: 4000
      });
    });
    if(response === "OK") {
      this.deleteWishlist(wishlistName);
    }
  }

  public doNothing(panelName: string) {
    switch(panelName) {
      case "header": { return this.wishlistsHeaderPanel.close(); }
      case "empty": { return this.wishlistsEmptyPanel.close(); }
    }
  }

  public getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
