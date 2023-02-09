import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  registerForm: FormGroup;
  toggle: boolean = false;

  constructor(
    public auth: AuthService
  ) { }

  ngOnInit(): void {

    this.loginForm = new FormGroup({
      'loginEmail': new FormControl(null, [Validators.required, Validators.email]), 
      'loginPassword': new FormControl(null, Validators.required),
    });

    this.registerForm = new FormGroup({
      'firstName': new FormControl(null, Validators.required),
      'lastName': new FormControl(null, Validators.required),
      'registerEmail': new FormControl(null, [Validators.required, Validators.email]),
      'registerPassword': new FormControl(null, Validators.required),
      'confirmPassword': new FormControl(null, Validators.required),
    })

    this.registerForm.addValidators(
      this.matchValidator(
        this.registerForm.get('registerPassword')!,
        this.registerForm.get('confirmPassword')!
      )
    );
  }

  matchValidator(control: AbstractControl, controlTwo: AbstractControl): ValidatorFn {
    return () => {
      if (control.value !== controlTwo.value){
        return {match_error: 'Value does not match'}};
      return null;
    };
  }

  onLogin() {
    this.auth.login(
      this.loginForm.get('loginEmail')?.value,
      this.loginForm.get('loginPassword')?.value
      );
      this.loginForm.reset();
  }

  onRegister() {
    this.auth.register(
      this.registerForm.get('registerEmail')?.value,
      this.registerForm.get('registerPassword')?.value,
      );
      this.registerForm.reset();
  }

}
