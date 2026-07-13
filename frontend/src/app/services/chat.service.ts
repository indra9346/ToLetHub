import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ChatMessage, ChatResponse } from '../models/chat.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  // Holds active session messages
  messages = signal<ChatMessage[]>([]);
  isTyping = signal<boolean>(false);

  private readonly STORAGE_KEY = 'tolethub_active_chat_session';

  constructor(private http: HttpClient) {
    this.loadSessionChat();
  }

  // Load chat session on initial service bootstrap
  private loadSessionChat(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Map timestamps back to Date objects
        const loadedMessages = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        this.messages.set(loadedMessages);
      } catch (err) {
        this.clearChat();
      }
    } else {
      this.initWelcomeMessage();
    }
  }

  // Initialize welcome greetings
  private initWelcomeMessage(): void {
    const greeting: ChatMessage = {
      sender: 'assistant',
      text: "Hi! I’m the ToLetHub Assistant. I can help you find PGs, rooms, or houses, explain filters, compare saved properties, and guide owners through listing a property.",
      timestamp: new Date(),
      isDemoMode: false,
      suggestions: [
        'Find PGs near me under ₹10,000',
        'Show furnished rooms with food',
        'How do I list my PG?',
        'Compare my saved properties',
        'What amenities are available?'
      ]
    };
    this.messages.set([greeting]);
    this.saveSessionChat();
  }

  // Post message to backend chat endpoint
  sendChatMessage(messageText: string): Observable<ChatResponse> {
    const userMsg: ChatMessage = {
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    };

    // Append user message immediately
    this.messages.update(prev => [...prev, userMsg]);
    this.saveSessionChat();
    this.isTyping.set(true);

    return this.http.post<ChatResponse>(this.apiUrl, { message: messageText }).pipe(
      tap({
        next: (res) => {
          const assistantMsg: ChatMessage = {
            sender: 'assistant',
            text: res.text,
            timestamp: new Date(),
            isDemoMode: res.isDemoMode,
            listings: res.listings,
            suggestions: res.suggestions,
            filters: res.filters
          };
          this.messages.update(prev => [...prev, assistantMsg]);
          this.saveSessionChat();
          this.isTyping.set(false);
        },
        error: (err) => {
          this.isTyping.set(false);
          const errorMsg: ChatMessage = {
            sender: 'assistant',
            text: err.error?.message || 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date()
          };
          this.messages.update(prev => [...prev, errorMsg]);
          this.saveSessionChat();
        }
      })
    );
  }

  // Clear chat history
  clearChat(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.messages.set([]);
    this.initWelcomeMessage();
  }

  // Save session chat list to storage
  private saveSessionChat(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.messages()));
  }
}
