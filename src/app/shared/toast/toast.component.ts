import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { TOAST, TOAST_STATE } from 'src/app/core/models/toaster-notification';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  animations: [
    trigger('toastTrigger', [
      transition('void => *', [
        style({
          height: 0,
          opacity: 0,
          transform: 'scale(0.65)',
          'margin-bottom': 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
        }),
        animate('170ms', style({
          height: '*',
          'margin-bottom': '*',
          paddingTop: '*',
          paddingBottom: '*',
          paddingLeft: '*',
          paddingRight: '*',
        })),
        animate(68)
      ]),
      transition('* => void', [
        animate(50, style({
          transform: 'scale(1.05)'
        })),
        animate(50, style({
          transform: 'scale(1)',
          opacity: 0.75
        })),
        animate('220ms ease-out', style({
          transform: 'scale(0.68)',
          opacity: 0,
        })),
        animate('250ms ease-out', style({
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
          'margin-bottom': '0',
        }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit {

  toaster: TOAST[] = [];

  constructor(public toast: ToastService) { }

  ngOnInit(): void {
    this.toast.getAlert()
      .subscribe((alert: TOAST) => {
        this.toaster = [];
        if (!alert) {
          this.toaster = [];
          return;
        }
        this.toaster.push(alert);
        setTimeout(() => {
          this.toast.hideNotification();
        }, 3000);
      });
  }

  removeToaster() {
    this.toast.hideNotification();
  }

  addToasterClass(alert: TOAST) {
    if (!alert) {
      return;
    }
    switch (alert.type) {
      case TOAST_STATE.Success:
        return 'success-toast';
      case TOAST_STATE.Error:
        return 'danger-toast';
      case TOAST_STATE.Info:
        return 'info-toast';
      case TOAST_STATE.Warning:
        return 'warning-toast';
    }
  }

}
