import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListingService } from '../../services/listing.service';
import { AuthService } from '../../services/auth.service';
import { GeolocationService } from '../../services/geolocation.service';
import { Listing } from '../../models/listing.model';

@Component({
  selector: 'app-edit-listing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-listing.component.html',
  styleUrls: ['./edit-listing.component.scss']
})
export class EditListingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private listingService = inject(ListingService);
  private authService = inject(AuthService);
  private geolocationService = inject(GeolocationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  listingForm!: FormGroup;
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  listingId = signal<string>('');

  // Step indicator
  currentStep = signal<number>(1);

  // Amenities checklist helper
  amenitiesList = ['WiFi', 'AC', 'Geyser', 'Parking', 'CCTV', 'Power Backup', 'Housekeeping', 'Gym', 'Clubhouse', 'Washing Machine'];
  selectedAmenities: string[] = [];

  // Form selections dropdown helpers
  propertyTypes = ['PG', 'Room', 'House'];
  furnishingTypes = ['unfurnished', 'semi-furnished', 'fully-furnished'];
  genderPreferences = ['boys', 'girls', 'any'];
  sharingTypes = ['private', '2-sharing', '3-sharing', '4+-sharing', 'none'];

  ngOnInit() {
    this.listingForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      propertyType: ['', [Validators.required]],
      description: ['', [Validators.required]],
      rent: ['', [Validators.required, Validators.min(0)]],
      deposit: ['', [Validators.required, Validators.min(0)]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      locality: ['', [Validators.required]],
      latitude: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      longitude: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      contactName: ['', [Validators.required]],
      contactPhone: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s]{10,15}$/)]],
      availableFrom: ['', [Validators.required]],
      imagesText: ['', []],
      videoUrl: ['', []],
      foodAvailability: [false, []],
      furnishing: ['', [Validators.required]],
      genderPreference: ['', [Validators.required]],
      roomSharingType: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.listingId.set(id);
        this.loadListingDetails(id);
      }
    });
  }

  loadListingDetails(id: string) {
    this.listingService.getListing(id).subscribe({
      next: (res) => {
        if (res.success) {
          const list = res.data;
          
          const currentOwnerId = typeof list.owner === 'object' ? list.owner._id : list.owner;
          if (currentOwnerId !== this.authService.currentUser()?.id) {
            alert('You are not authorized to edit this listing.');
            this.router.navigate(['/dashboard']);
            return;
          }

          this.selectedAmenities = list.amenities || [];
          
          const formattedDate = list.availableFrom 
            ? new Date(list.availableFrom).toISOString().split('T')[0] 
            : '';

          this.listingForm.patchValue({
            title: list.title,
            propertyType: list.propertyType,
            description: list.description,
            rent: list.rent,
            deposit: list.deposit,
            address: list.address,
            city: list.city,
            locality: list.locality,
            latitude: list.location.coordinates[1],
            longitude: list.location.coordinates[0],
            contactName: list.contactName,
            contactPhone: list.contactPhone,
            availableFrom: formattedDate,
            imagesText: list.images.join(', '),
            videoUrl: list.videoUrl || '',
            foodAvailability: list.foodAvailability,
            furnishing: list.furnishing,
            genderPreference: list.genderPreference,
            roomSharingType: list.roomSharingType,
            status: list.status
          });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.router.navigate(['/not-found']);
      }
    });
  }

  isStepValid(step: number): boolean {
    if (step === 1) {
      return !!(
        this.listingForm.get('title')?.valid &&
        this.listingForm.get('propertyType')?.valid &&
        this.listingForm.get('description')?.valid &&
        this.listingForm.get('furnishing')?.valid
      );
    }
    if (step === 2) {
      return !!(
        this.listingForm.get('rent')?.valid &&
        this.listingForm.get('deposit')?.valid &&
        this.listingForm.get('genderPreference')?.valid &&
        this.listingForm.get('roomSharingType')?.valid &&
        this.listingForm.get('status')?.valid
      );
    }
    if (step === 3) {
      return true;
    }
    return this.listingForm.valid;
  }

  markStepTouched(step: number) {
    if (step === 1) {
      this.listingForm.get('title')?.markAsTouched();
      this.listingForm.get('propertyType')?.markAsTouched();
      this.listingForm.get('description')?.markAsTouched();
      this.listingForm.get('furnishing')?.markAsTouched();
    } else if (step === 2) {
      this.listingForm.get('rent')?.markAsTouched();
      this.listingForm.get('deposit')?.markAsTouched();
      this.listingForm.get('genderPreference')?.markAsTouched();
      this.listingForm.get('roomSharingType')?.markAsTouched();
      this.listingForm.get('status')?.markAsTouched();
    } else if (step === 4) {
      this.listingForm.markAllAsTouched();
    }
  }

  nextStep() {
    if (this.isStepValid(this.currentStep())) {
      this.currentStep.update(s => Math.min(4, s + 1));
    } else {
      this.markStepTouched(this.currentStep());
    }
  }

  prevStep() {
    this.currentStep.update(s => Math.max(1, s - 1));
  }

  autofillCoordinates() {
    this.geolocationService.getCurrentLocation()
      .then(coords => {
        this.listingForm.patchValue({
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6)
        });
      })
      .catch(() => {
        alert('Could not retrieve browser location. Please insert coordinates manually.');
      });
  }

  toggleAmenity(amenity: string) {
    const idx = this.selectedAmenities.indexOf(amenity);
    if (idx > -1) {
      this.selectedAmenities.splice(idx, 1);
    } else {
      this.selectedAmenities.push(amenity);
    }
  }

  onSubmit() {
    if (this.listingForm.invalid) {
      this.markStepTouched(4);
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const imgsText = this.listingForm.value.imagesText;
    const imagesArray = imgsText 
      ? imgsText.split(',').map((img: string) => img.trim()).filter((img: string) => img.length > 0)
      : [];

    const payload = {
      ...this.listingForm.value,
      images: imagesArray,
      amenities: this.selectedAmenities
    };

    delete payload.imagesText;

    this.listingService.updateListing(this.listingId(), payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Changes saved successfully! Redirecting...');
        setTimeout(() => this.router.navigate(['/dashboard']), 1200);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to save changes.');
      }
    });
  }
}
