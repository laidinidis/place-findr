import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps';

import { PlacesService } from './places.service';
import PlaceTypes from './plaseTypes';

const mapPhotos = (photos: any[]) =>
  photos.map((p) => ({
    path: `https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyAoUfOFS9NKd8b3s6C0AYdEraz7mf64C3E&photoreference=${p.photo_reference}&maxwidth=300`,
  }));

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
  infoContent: {
    placeInfo?: any;
    title?: string;
    image?: string;
    photos?: any[];
  } = {};
  placeInfo: any = {};

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
    this.places
      .getPlaces(
        this.categoryInput.value.key,
        `${this.locationInput.value.geometry.location.lat},${this.locationInput.value.geometry.location.lng}`
      )
      .subscribe((data) => {
        this.markers = data.results;
        const bounds = new google.maps.LatLngBounds();

        for (const marker of this.markers) {
          bounds.extend(new google.maps.LatLng(marker.geometry.location.lat, marker.geometry.location.lng));
        }
        this.map?.fitBounds(bounds);
      });
  }

  onListingClick(marker: any): void {
    console.log(marker);
  }

  setInfoContent(marker: any) {
    this.infoContent.title = marker.name;
    this.infoContent.photos = marker.photos ? mapPhotos(marker.photos) : [];

    if (this.placeInfo[marker.place_id]) {
      this.infoContent.photos = this.placeInfo[marker.place_id].photos
        ? mapPhotos(this.placeInfo[marker.place_id].photos)
        : [];
    } else {
      this.places.getPlaceInfo(marker.place_id).subscribe((placeInfo) => {
        this.placeInfo[marker.place_id] = placeInfo.result;
        this.infoContent.placeInfo = placeInfo.result;
        this.infoContent.photos = placeInfo.result.photos
          ? mapPhotos(placeInfo.result.photos)
          : [];
      });
    }
  }

  onListingHover(marker: any): void {
    if (this.infoWindow) {
      this.setInfoContent(marker);
      this.infoWindow.options = {
        pixelOffset: new google.maps.Size(0, -43),
      };
      this.infoWindow.position = marker.geometry.location;
      this.infoWindow.open();
    }
  }

  openInfo(mapMarker: MapMarker, marker: any): void {
    if (this.infoWindow) {
      this.setInfoContent(marker);
      this.infoWindow.options = {
        pixelOffset: new google.maps.Size(0, 0),
      };
      this.infoWindow.open(mapMarker);
    }
  }
}
