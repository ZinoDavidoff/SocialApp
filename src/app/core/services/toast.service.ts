import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { TOAST, TOAST_STATE } from '../models/toaster-notification';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toaster$ = new Subject<TOAST>();

  constructor() { }

  getAlert(): Observable<any> {
    return this.toaster$.asObservable();
  }

  success(message: string) {
    this.showNotification(TOAST_STATE.Success, message);
  }

  danger(message: string) {
    this.showNotification(TOAST_STATE.Error, message);
  }

  info(message: string) {
    this.showNotification(TOAST_STATE.Info, message);
  }

  warn(message: string) {
    this.showNotification(TOAST_STATE.Warning, message);
  }

  showNotification(type: TOAST_STATE, message: string) {
    this.toaster$.next({ type: type, message: message });
  }

  hideNotification() {
    this.toaster$.next(null);
  }

}
