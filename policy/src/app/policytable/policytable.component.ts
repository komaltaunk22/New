import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { RouterModule, Router } from "@angular/router";

@Component({
  selector: 'app-policytable',
  imports: [CommonModule, RouterModule],
  templateUrl: './policytable.component.html',
  styleUrl: './policytable.component.css',
})
export class PolicytableComponent implements OnInit {
  policies: any[] = [];
  filteredPolicies: any[] = [];
  searchName: string = '';
  searchAge: number | null = null;
  searchDate: string = '';
  loading: boolean = true;
  error: string | null = null;

  constructor(private httpClient: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchPolicies();
  }

  fetchPolicies() {
    this.loading = true;
    this.error = null;

    this.httpClient.get<any[]>('http://localhost:5000/api/getpolicies').subscribe({
      next: (data) => {
        this.policies = data.map((policy) => ({
          id: policy._id,
          name: policy.holderName,
          members: [
            {
              id: policy._id,
              name: policy.holderName,
              dob: new Date(policy.holderDob),
              gender: policy.holderGender || 'Unknown',
              age: this.calculateAge(new Date(policy.holderDob)),
            },
            ...(policy.spouseDob
              ? [
                  {
                    name: policy.spouseName,
                    dob: new Date(policy.spouseDob),
                    gender: policy.spouseGender,
                    age: this.calculateAge(new Date(policy.spouseDob)),
                  },
                ]
              : []),
            ...(policy.children?.map((child: any) => ({
              name: child.name,
              dob: new Date(child.dob),
              gender: child.gender || 'Unknown',
              age: this.calculateAge(new Date(child.dob)),
            })) || []),
          ],
        }));

        this.filteredPolicies = [...this.policies];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to fetch data.';
        this.loading = false;
      },
    });
  }

  isBirthday(dob: Date): boolean {
    const today = new Date();
    console.log(  dob.getDate() , today.getDate(),dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth());

    return dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
  }

  viewMemberDetails(member: any) {
    console.log('Clicked Member:', member);
    if (member && member.id) {
      this.router.navigate(['/policy', member.id]);
    } else {
      console.error('Member object does not have a valid ID:', member);
    }
  }
  

  calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }
}
