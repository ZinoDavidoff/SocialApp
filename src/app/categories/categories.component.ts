import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { auditTime, debounceTime, map, Observable, of, startWith, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ItemService, Post } from '../item.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit, OnDestroy {

  categories: string[] = [];
  users: Post[] = [];
  categoriesToAdd = new FormControl(
    '',
    [Validators.required, Validators.minLength(3), Validators.maxLength(12)],
    [this.asyncValidator()])
  search = new FormControl('');
  private untilDestroy = new Subject();

  constructor(private itemServise: ItemService) { }

  ngOnDestroy(): void {
     this.untilDestroy.next(null);
      this.untilDestroy.complete();
  }

  ngOnInit(): void {
    this.itemServise.getCategories().subscribe(data => {
      this.categories = data;
    })

    this.itemServise.getAllPosts().subscribe(data => {
      this.users = data
    })
  }

  filteredByAuthor: Observable<Post[]> = this.search?.valueChanges.pipe(
    takeUntil(this.untilDestroy.asObservable()),
    startWith(''),
    debounceTime(1000),
    tap(),
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

  removeCategory(e: string) {
    this.categories.forEach((value, index) => {
      if (value === e) {
        this.categories.splice(index, 1);
        this.itemServise.createNewCategories(this.categories).subscribe()
      } 
    });
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
