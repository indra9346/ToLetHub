import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, ChatbotComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ToLetHub';
  showSplash = signal<boolean>(false);

  ngOnInit() {
    // Check if splash was already shown in this session
    const splashShown = sessionStorage.getItem('tolethub_splash_shown');
    if (!splashShown) {
      this.showSplash.set(true);
      
      // Auto hide splash after 3 seconds (2.5s animation + 0.5s fade out buffer)
      setTimeout(() => {
        this.showSplash.set(false);
        try {
          sessionStorage.setItem('tolethub_splash_shown', 'true');
        } catch (e) {
          // Fallback if storage is disabled
        }
      }, 3000);
    }
  }
}
