import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, map, Observable, of, startWith, switchMap } from 'rxjs';
import { ItemService, Post } from '../item.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  categories: string[] = [];
  users: Post[] = [];
  categoriesToAdd = new FormControl(
    '',
    [Validators.required, Validators.minLength(3), Validators.maxLength(12)],
    [this.asyncValidator()])
  search = new FormControl('');

  constructor(private itemServise: ItemService) { }

  ngOnInit(): void {
    this.itemServise.getCategories().subscribe(data => {
      this.categories = data;
    })

    this.itemServise.getAllPosts().subscribe(data => {
      this.users = data
    })
  }

  filteredByAuthor: Observable<Post[]> = this.search?.valueChanges.pipe(
    startWith(''),
    debounceTime(800),
    switchMap(searchValue => {
      return of(this.users).pipe(
        map(users => {
          return users
            .filter(u => u.author.toLowerCase().includes(searchValue))
        })
      );
    }))

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
