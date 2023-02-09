import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './features/navbar/navbar.component';
import { HttpClientModule } from '@angular/common/http'
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { LoginComponent } from './features/login/login.component';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { environment } from 'src/environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { SortedPipe } from './core/pipes/sorted.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoriesComponent } from './features/categories/categories.component';
import { MatInputPromptComponent } from './shared/mat-input-prompt/mat-input-prompt.component';
import { ToastComponent } from './shared/toast/toast.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { BlogPostComponent } from './features/blog-post/blog-post.component';
import { PostComponent } from './features/blog-post/post/post.component';
import { CardComponent } from './shared/card/card.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    BlogPostComponent,
    DashboardComponent,
    MatInputPromptComponent,
    SortedPipe,
    CategoriesComponent,
    ToastComponent,
    SpinnerComponent,
    NotFoundComponent,
    PostComponent,
    CardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatTabsModule,
    MatSidenavModule,
    MatListModule,
    MatDialogModule,
    MatTooltipModule,
    MatTableModule,
    AngularFireModule.initializeApp(environment.firebase)
  ],
  providers: [

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
