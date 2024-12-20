import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getPolicies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/policies`);
  }

  getPolicyById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/policy/${id}`);
  }
}
