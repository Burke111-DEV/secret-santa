import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar-yesno',
  templateUrl: './snackbar-yesno.component.html',
  styleUrls: ['./snackbar-yesno.component.css']
})
export class SnackbarYesnoComponent implements OnInit {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {
  }

  ngOnInit(): void {
  }

  onYesClick(): void {
    this.data.onYesClick();
  }

  onNoClick(): void {
    this.data.onNoClick();
  }
}
