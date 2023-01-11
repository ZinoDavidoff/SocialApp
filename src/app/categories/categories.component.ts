import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ItemService } from '../item.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  categories: string[] = [];
  categoriesToAdd = new FormControl('')

  constructor(private itemServise: ItemService) { }

  ngOnInit(): void {
    this.itemServise.getCategories().subscribe(data => {
      this.categories = data;
    })
  }

  addCategory() {
    this.categories.push(this.categoriesToAdd.value)
    this.itemServise.createNewCategories(this.categories).subscribe()
    this.categoriesToAdd.reset();
  }

}
