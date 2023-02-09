import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { debounceTime, map, Observable, of, startWith, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { CategoryService } from 'src/app/core/services/category.service';
import { Post } from '../../core/models/interfaces';
import { AuthService } from '../../core/services/auth.service';
import { ItemService } from '../../core/services/item.service';
import { ToastService } from '../../core/services/toast.service';

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
    [this.asyncValidator()]
  )
  categoriesToEdit = new FormControl(
    '',
    [Validators.required, Validators.minLength(3), Validators.maxLength(12)],
    [this.asyncValidator()]
  )
  search = new FormControl('');
  toggle: boolean = false;
  index: number;
  cat: string;
  private untilDestroy = new Subject();

  constructor(
    private itemServise: ItemService,
    private categoryService: CategoryService,
    public authService: AuthService,
    private toast: ToastService
    ) { }

  ngOnDestroy(): void {
     this.untilDestroy.next(null);
      this.untilDestroy.complete();
  }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    })

    this.itemServise.getAllPosts().subscribe(data => {
      this.users = data
    })
  }

  filteredByAuthor: Observable<Post[]> = this.search?.valueChanges.pipe(
    takeUntil(this.untilDestroy.asObservable()),
    startWith(''),
    debounceTime(1500),
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
    this.categoryService.createNewCategories(this.categories).subscribe()
    this.toast.success("You just added a new category");
    this.categoriesToAdd.reset();
  }

  editCategory() {
    if (this.index !== -1) {
      this.categories[this.index] = this.categoriesToEdit.value;
    }
    this.categoryService.editCategory(this.categories).subscribe()
    this.toast.success("You just edited a category");
    this.toggle = false;
    for (let post of this.users) {
      if (post.category == this.cat) {
        post.category = this.categoriesToEdit.value
        this.itemServise.patchPost(post.id, post).subscribe()
      }
    }
    this.categoriesToEdit.reset();
  }

  getValue(category: string) {
    this.categoriesToEdit.setValue(category)
    this.cat = category
    this.index = this.categories.indexOf(this.categoriesToEdit.value)
  }

  removeCategory(e: string) {
    this.categories.forEach((value, index) => {
      if (value === e) {
        this.categories.splice(index, 1);
        this.categoryService.createNewCategories(this.categories).subscribe()
      } 
    });
    this.toast.success("This category has been deleted");
  }

  checkIfCategoryExists(value: string) {
    return of(this.categories.some((val) => val?.toLowerCase() === value))
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
