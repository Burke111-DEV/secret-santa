import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirestoreService } from '../firestore.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserComponent } from '../create-user/create-user.component';
import { IUser } from '../interfaces';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public hasUser: boolean = false;

  constructor(private afAuth: AngularFireAuth, 
              private session: SessionService,
              private firestore: FirestoreService,
              private router: Router,
              private snackBar: MatSnackBar,
              public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  public async signInWithGoogle() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      this.session.setAuthUser(user);
      this.authConnected();
    } catch (error) {
        this.snackBar.open("Failed to login...", '', {
          duration: 3000,
          panelClass: ['centered-text']
        });
      console.error(error);
    }
  }

  private async authConnected() {   
    const userUid = this.session.getAuthUser().uid;    
    const userPulled = await this.firestore.getUser(userUid);

    if(userPulled != null) 
      return this.moveOn(userPulled);
    
    if(await this.createNewUser() != "QUIT")
      this.moveOn(null);
  }

  private async moveOn(user: IUser|null) {
    if(user == null) user = await this.firestore.getUser(this.session.getAuthUser().uid);
    this.hasUser = true;
    this.session.setUser(<IUser>user);

    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1200);
  }

  private createNewUser() {
    return new Promise((resolve, reject) => {
      try {
        const dialogRef = this.dialog.open(CreateUserComponent, { width: '80vw' });
    
        dialogRef.afterClosed().subscribe(result => {
          if(result == undefined) 
            return resolve("QUIT");

          this.firestore.createNewUser(<IUser>result);
          return resolve("OK");
        });
      } catch (error) {
        console.log("Failed to create new user");
        reject();
      }
    })
  }
}
