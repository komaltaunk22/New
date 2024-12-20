import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx'; // Import xlsx library

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {
  policyForm: FormGroup;
  allFormData: any[] = []; // Store form data in memory
  title = "Registration Form";

  constructor(private http: HttpClient) {
    this.policyForm = new FormGroup({
      agentName: new FormControl('', [Validators.required]),
      policyNumber: new FormControl('', [Validators.required]),
      policyStartDate: new FormControl('', [Validators.required]),
      policyEndDate: new FormControl('', [Validators.required]),
      policyType: new FormControl('', [Validators.required]),
      holderName: new FormControl('', [Validators.required]),
      holderDob: new FormControl('', [Validators.required]),
      holderAge: new FormControl('', [Validators.required]), // Age is calculated based on DOB
      holderGender: new FormControl('', [Validators.required]),
      spouseName: new FormControl(''),
      spouseDob: new FormControl(''),
      spouseAge: new FormControl('', [Validators.required]),
      spouseGender: new FormControl('', [Validators.required]),
      children: new FormArray([]) // FormArray to store children
    });

    // Calculate age whenever the DOB changes for the holder
    this.policyForm.get('holderDob')?.valueChanges.subscribe((dob: string | null) => {
      if (dob) {
        this.calculateAge('holderDob', 'holderAge');
      }
    });

    // Calculate age whenever the DOB changes for the spouse
    this.policyForm.get('spouseDob')?.valueChanges.subscribe((dob: string | null) => {
      if (dob) {
        this.calculateAge('spouseDob', 'spouseAge');
      }
    });
  }

  // Getter for children FormArray
  get children() {
    return (this.policyForm.get('children') as FormArray);
  }

  addChild() {
    const childGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      dob: new FormControl('', Validators.required),
      age: new FormControl('', [Validators.required]), // Disabled initially, will be calculated later
      gender: new FormControl('', Validators.required)
    });

    // Automatically calculate child's age when DOB is added
    childGroup.get('dob')?.valueChanges.subscribe((dob: string | null) => {
      if (dob) {
        this.calculateAgeForChild(childGroup);
      }
    });

    this.children.push(childGroup);
  }

  // Method to remove a child
  removeChild(index: number) {
    this.children.removeAt(index);
  }

  // Method to calculate the age based on DOB
  private calculateAge(dobControl: string, ageControl: string) {
    const dob = new Date(this.policyForm.get(dobControl)?.value);
    const age = this.calculateAgeFromDOB(dob);

    // Set the age field value
    this.policyForm.get(ageControl)?.setValue(age);
  }

  // Method to calculate the child's age based on DOB
  private calculateAgeForChild(childGroup: FormGroup) {
    const dob = new Date(childGroup.get('dob')?.value);
    const age = this.calculateAgeFromDOB(dob);

    // Set the age field value for the child
    childGroup.get('age')?.setValue(age);
  }

  // Helper method to calculate age from DOB
  private calculateAgeFromDOB(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  collectFormData() {
    const formData = this.policyForm.value;

    // Prepare the data for export
    const data = {
      holderName: formData.holderName,
      holderDob: formData.holderDob,
      holderAge: formData.holderAge,
      holderGender: formData.holderGender,
      spouseName: formData.spouseName,
      spouseDob: formData.spouseDob,
      spouseAge: formData.spouseAge,
      spouseGender: formData.spouseGender,
      children: formData.children.map((child: any, index: number) => ({
        [`Child ${index + 1} Name`]: child.name,
        [`Child ${index + 1} DOB`]: child.dob,
        [`Child ${index + 1} Age`]: child.age,
        [`Child ${index + 1} Gender`]: child.gender
      }))
    };

    // Push the new form data into the allFormData array
    this.allFormData.push(data);
  }

  // Export all collected form data into Excel
  exportToExcel() {
    const wsData = [];

    // Add headers dynamically based on the number of children
    const headers = [
      'Holder Name', 'Holder DOB', 'Holder Age', 'Holder Gender',
      'Spouse Name', 'Spouse DOB', 'Spouse Age', 'Spouse Gender'
    ];

    // Add dynamic child headers
    const childrenCount = this.policyForm.get('children')?.value.length || 0;
    for (let i = 1; i <= childrenCount; i++) {
      headers.push(`Child ${i} Name`, `Child ${i} DOB`, `Child ${i} Age`, `Child ${i} Gender`);
    }

    wsData.push(headers);

    // Add form data rows
    this.allFormData.forEach((data: any) => {
      const row = [
        data.holderName,
        data.holderDob,
        data.holderAge,
        data.holderGender,
        data.spouseName,
        data.spouseDob,
        data.spouseAge,
        data.spouseGender
      ];

      // Add dynamic child data
      data.children.forEach((child: any) => {
        row.push(child['Child 1 Name'], child['Child 1 DOB'], child['Child 1 Age'], child['Child 1 Gender']);
      });

      wsData.push(row);
    });

    // Create a worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Policy Data');

    // Write the workbook to a file
    XLSX.writeFile(wb, 'PolicyHolderDetails.xlsx');
  }

  // Handle form submission
  onSubmit() {
    if (this.policyForm.valid) {
      console.log(this.policyForm)
      this.collectFormData(); // Collect form data before submission
      this.http.post('http://localhost:5000/api/postpolicies', this.policyForm.value)
        .subscribe({
          next: (res: any) => console.log('Policy saved successfully!', res),
          error: (err: any) => console.error('Error saving policy:', err),
        });
    } else {
      console.log('Form is not valid');
    }
  }

  updateSpouseGender() {
    const holderGender = this.policyForm.get('holderGender')?.value;
    const spouseGender = this.policyForm.get('spouseGender');

    // Automatically set spouse's gender opposite to the holder's gender
    if (holderGender === 'Male') {
      spouseGender?.setValue('Female');
    } else if (holderGender === 'Female') {
      spouseGender?.setValue('Male');
    } else {
      spouseGender?.setValue('Other');
    }
  }
}
