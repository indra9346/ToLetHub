import { Component, signal, ViewChild, ElementRef, AfterViewChecked, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ChatMessage } from '../../models/chat.model';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements AfterViewChecked {
  chatService = inject(ChatService);
  authService = inject(AuthService);

  isOpen = signal<boolean>(false);
  userInput = signal<string>('');

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    // Automatically scroll to bottom when a new message is added
    effect(() => {
      this.chatService.messages();
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  sendMessage() {
    const text = this.userInput().trim();
    if (!text) return;

    this.userInput.set('');
    this.chatService.sendChatMessage(text).subscribe();
  }

  // Handle clicking on suggested prompt chips
  onChipClick(chipText: string) {
    this.chatService.sendChatMessage(chipText).subscribe();
  }

  clearConversation() {
    this.chatService.clearChat();
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }
}
