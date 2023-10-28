import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material/material.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../environments/environment';


import { LoginComponent } from './login/login.component';
import { IndexComponent } from './index/index.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { WishlistsComponent } from './wishlists/wishlists.component';
import { SnackbarYesnoComponent } from './snackbar-yesno/snackbar-yesno.component';
import { WishlistGeneratorComponent } from './wishlist-generator/wishlist-generator.component';
import { WishlistTemplateGeneratorComponent } from './wishlist-template-generator/wishlist-template-generator.component';
import { GroupGeneratorComponent } from './group-generator/group-generator.component';
import { JoinGroupComponent } from './join-group/join-group.component';
import { ViewGroupComponent } from './view-group/view-group.component';
import { DeleteGroupComponent } from './delete-group/delete-group.component';
import { GenerateMatchesComponent } from './generate-matches/generate-matches.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    IndexComponent,
    CreateUserComponent,
    WishlistsComponent,
    SnackbarYesnoComponent,
    WishlistGeneratorComponent,
    WishlistTemplateGeneratorComponent,
    GroupGeneratorComponent,
    JoinGroupComponent,
    ViewGroupComponent,
    DeleteGroupComponent,
    GenerateMatchesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
