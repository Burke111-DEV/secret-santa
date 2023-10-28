import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { IndexComponent } from './index/index.component';
import { ViewGroupComponent } from './view-group/view-group.component';

const routes: Routes = [
  { path: '', component: IndexComponent},
  { path: 'login', component: LoginComponent},
  { path: 'secretsanta/:name/:index', component: ViewGroupComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
