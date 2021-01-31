import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps';

import { PlacesService } from './places.service';
import PlaceTypes from './plaseTypes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap | undefined;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow:
    | MapInfoWindow
    | undefined;

  locationInput = new FormControl();
  categoryInput = new FormControl();
  filteredCategories: Observable<{ key: string; value: string }[]> | undefined;
  locations: Array<{ name: string }> = [];
  categories = PlaceTypes;
  markers: Array<any> = [];
  infoContent = '';

  mapOptions = {
    zoom: 14,
    center: { lat: 34.66717565508676, lng: 33.040826677237575 },
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  };

  constructor(private places: PlacesService) {}

  ngOnInit(): void {
    navigator.geolocation.getCurrentPosition(
      (location) => {
        this.mapOptions.center = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };
      },
      (e) => {
        console.log(e);
      }
    );

    this.filteredCategories = this.categoryInput.valueChanges.pipe(
      startWith(''),
      map((category) =>
        typeof category === 'string' ? category : category.value
      ),
      map((category) =>
        category ? this._filter(category) : this.categories.slice()
      )
    );

    this.locationInput.valueChanges
      .pipe(debounceTime(500), startWith(''))
      .subscribe((text) => {
        this.places.getLocation(text).subscribe(
          (data: any) => {
            this.locations = data.candidates;
          },
          (e) => console.log('=> ERROR: ', e)
        );
      });
  }

  private _filter(category: string): { key: string; value: string }[] {
    return this.categories.filter((option) =>
      option.value.toLowerCase().includes(category.toLowerCase())
    );
  }

  categoryDisplay(category: { key: string; value: string }): string {
    return category ? category.value : '';
  }

  locationDisplay(location: any): string {
    return location ? location.name : '';
  }

  onLocationSelected(event: any): void {
    console.log({
      location: this.locationInput.value,
      category: this.categoryInput.value,
    });

    this.places
      .getPlaces(
        this.categoryInput.value.key,
        `${this.locationInput.value.geometry.location.lat},${this.locationInput.value.geometry.location.lng}`
      )
      .subscribe((data) => {
        console.log(data);
        this.markers = data.results;
      });
  }

  onListingClick(marker: any): void {
    console.log(marker);
  }

  onListingHover(marker: any): void {
    if (this.infoWindow) {
      this.infoWindow.options = {
        pixelOffset: new google.maps.Size(0, -43),
      };
      this.infoWindow.position = marker.geometry.location;
      this.infoContent = marker.name;
      this.infoWindow.open();
    }
  }

  openInfo(marker: MapMarker, info: string): void {
    this.infoContent = info;
    if (this.infoWindow) {
      this.infoWindow.options = {
        pixelOffset: new google.maps.Size(0, 0),
      };
      this.infoWindow.open(marker);
    }
  }
}
