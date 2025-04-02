import { Component, Inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA
} from '@angular/material/dialog';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    constructor(
        private readonly snackBar: MatSnackBar,
        public dialog: MatDialog
    ) { }

    success(message: string) {
        this.openSnackBar(message, '', 'success-snackbar');
    }

    error(message: string) {
        this.openSnackBar(message, '', 'error', 3500);
    }

    openSnackBar(
        message: string,
        action: string,
        className = '',
        duration = 1000
    ) {
        this.snackBar.open(message, action, {
            duration: duration,
            panelClass: [className]
        });
    }
}