// import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PolicyService } from '../policy.service';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-policy-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './policydetails.component.html',
  styleUrls: ['./policydetails.component.css']
})
export class PolicyDetailsComponent implements OnInit {
  policy: any;
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private policyService: PolicyService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // Get the 'id' from the URL
    if (id) {
      this.fetchPolicyDetails(id);
    }
  }

  fetchPolicyDetails(id: string): void {
    this.policyService.getPolicyById(id).subscribe({
      next: (data: any) => {
        this.policy = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to fetch policy details.';
        this.loading = false;
        console.error('Error fetching policy details:', err);
      }
    });
  }

  downloadAsPDF(): void {
    const element = document.getElementById('policy-details');
    if (!element) {
      console.error('Policy details element not found');
      return;
    }

    // Delay execution to ensure that the content is fully rendered
    setTimeout(() => {
      html2canvas(element, {
        scale: 2,  // Increase resolution for sharper images
        logging: true,  // Enable logging for debug info
        useCORS: true,  // Allow CORS for external images
        scrollX: 0,
        scrollY: -window.scrollY,  // Adjust for page scroll if needed
      }).then((canvas) => {
        console.log('Canvas Dimensions:', canvas.width, canvas.height);  // Check the canvas size

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190; // A4 width minus some margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`${this.policy.holderName}_PolicyDetails.pdf`);
      }).catch((error) => {
        console.error('Error generating PDF: ', error);
      });
    }, 100); // Delay for 100ms (adjust if necessary)
  }

  calculateAge(dob: string): number {
    const dateOfBirth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const m = today.getMonth() - dateOfBirth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    return age;
  }
}
