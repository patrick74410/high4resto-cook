import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuardService } from './shared/services/Auth/auth-guard.service';
import { High4RestoCookComponent } from './high4restoCook/high4RestoCook.component.';


const routes: Routes = [
  {
    path: '',
    component: High4RestoCookComponent,canActivate: [AuthGuardService]
  },
  { path: 'login', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
