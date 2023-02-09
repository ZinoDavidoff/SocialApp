import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogPostComponent } from './blog-post.component';
import { PostComponent } from './post/post.component';

const routes: Routes = [
  {
    path: '',
    component: BlogPostComponent
  },
  { path: '', children: [
    { path: 'post/:id', component: PostComponent }
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogPostRoutingModule { }
