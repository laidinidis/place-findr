import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  constructor(private http: HttpClient) {}

  getLocation(text: string): Observable<any> {
    return this.http.get(`http://localhost:3000/locations?input=${text}`);
  }

  getPlaces( type: string, location: string): Observable<any> {
    return this.http.get(`http://localhost:3000/places?&type=${type}&location=${location}`);
  }
}
