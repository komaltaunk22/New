import { Routes } from '@angular/router';
import { PolicytableComponent } from './policytable/policytable.component';
import { FormComponent } from './form/form.component';
import { PolicyDetailsComponent } from './policydetails/policydetails.component';

export const routes: Routes = [
{path:'*',component:FormComponent},
{path:'policies', component:PolicytableComponent},
 {path:'forms', component: FormComponent},
 {path:'policy/:id', component:PolicyDetailsComponent}
];
