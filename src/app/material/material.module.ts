import { NgModule } from '@angular/core';
import { MatButtonModule} from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';



const MaterialComponents = [
  MatButtonModule,
  MatToolbarModule,
  MatInputModule,
  MatDividerModule,
  MatStepperModule,
  MatIconModule,
  MatGridListModule,
  MatCheckboxModule,
  MatSnackBarModule,
  MatDialogModule,
  MatTabsModule,
  MatSelectModule,
  MatProgressBarModule,
  MatTooltipModule,
  MatSidenavModule,
  MatBadgeModule,
  MatExpansionModule,
  MatListModule,
  MatSlideToggleModule,
  MatTableModule,
]

@NgModule({
  imports: [
    MaterialComponents
  ],
  exports: [
    MaterialComponents
  ]
})
export class MaterialModule { }
