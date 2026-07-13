import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListingService } from '../../services/listing.service';
import { GeolocationService } from '../../services/geolocation.service';

@Component({
  selector: 'app-create-listing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-listing.component.html',
  styleUrls: ['./create-listing.component.scss']
})
export class CreateListingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private listingService = inject(ListingService);
  private geolocationService = inject(GeolocationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  listingForm!: FormGroup;
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  
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
    const propType = this.route.snapshot.queryParams['type'] || 'PG';

    this.listingForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      propertyType: [propType, [Validators.required]],
      description: ['', [Validators.required]],
      rent: ['', [Validators.required, Validators.min(0)]],
      deposit: ['', [Validators.required, Validators.min(0)]],
      address: ['', [Validators.required]],
      city: ['Bangalore', [Validators.required]],
      locality: ['', [Validators.required]],
      latitude: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      longitude: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      contactName: ['', [Validators.required]],
      contactPhone: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s]{10,15}$/)]],
      availableFrom: ['', [Validators.required]],
      imagesText: ['', []],
      videoUrl: ['', []],
      foodAvailability: [false, []],
      furnishing: ['unfurnished', [Validators.required]],
      genderPreference: ['any', [Validators.required]],
      roomSharingType: ['none', [Validators.required]],
      status: ['available', [Validators.required]]
    });

    // Load draft if exists
    this.loadDraft();

    // Auto save draft on changes
    this.listingForm.valueChanges.subscribe(() => {
      this.saveDraft();
    });
  }

  saveDraft() {
    try {
      const draft = {
        formValues: this.listingForm.value,
        amenities: this.selectedAmenities,
        step: this.currentStep()
      };
      localStorage.setItem('tolethub_draft_listing', JSON.stringify(draft));
    } catch (e) {
      // Ignored if storage disabled
    }
  }

  loadDraft() {
    try {
      const raw = localStorage.getItem('tolethub_draft_listing');
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.formValues) {
          this.listingForm.patchValue(draft.formValues);
        }
        if (draft.amenities) {
          this.selectedAmenities = draft.amenities;
        }
        if (draft.step) {
          this.currentStep.set(draft.step);
        }
      }
    } catch (e) {
      // Ignored if storage disabled
    }
  }

  clearDraft() {
    try {
      localStorage.removeItem('tolethub_draft_listing');
    } catch (e) {
      // Ignored
    }
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
      return true; // Step 3 has only optional / checkbox inputs
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
      this.saveDraft();
    } else {
      this.markStepTouched(this.currentStep());
    }
  }

  prevStep() {
    this.currentStep.update(s => Math.max(1, s - 1));
    this.saveDraft();
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
    this.saveDraft();
  }

  onSubmit() {
    if (this.listingForm.invalid) {
      this.markStepTouched(4);
      return;
    }

    this.isLoading.set(true);
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

    this.listingService.createListing(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Listing published successfully! Redirecting...');
        this.clearDraft();
        setTimeout(() => this.router.navigate(['/dashboard']), 1200);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to create listing.');
      }
    });
  }
}
