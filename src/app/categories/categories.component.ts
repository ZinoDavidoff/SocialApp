import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { map, Observable, of } from 'rxjs';
import { ItemService } from '../item.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  categories: string[] = [];
  categoriesToAdd = new FormControl('', [Validators.required, Validators.minLength(3)], [this.asyncValidator()])

  constructor(private itemServise: ItemService) { }

  ngOnInit(): void {
    this.itemServise.getCategories().subscribe(data => {
      this.categories = data;
    })
  }

  addCategory() {
    this.categories.unshift(this.categoriesToAdd.value)
    this.itemServise.createNewCategories(this.categories).subscribe()
    this.categoriesToAdd.reset();
  }

  checkIfCategoryExists(value: string) {
    return of(this.categories.some((val) => val.toLowerCase() === value))
  }

  asyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors> => {
      return this.checkIfCategoryExists(control.value).pipe(
        map((result: boolean) =>
          result ? {categoryAlreadyExists: true} : null
        )
      )
    }
    
  }

}
