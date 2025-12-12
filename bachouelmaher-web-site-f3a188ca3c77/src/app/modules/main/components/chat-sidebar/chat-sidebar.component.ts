import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Validators } from 'ngx-editor';
import { AuthService } from 'src/app/core/services/auth.service';
import { ConversationService } from 'src/app/core/services/conversation.service';
import { LoadingService } from 'src/app/core/services/loading.service';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.scss'
})
export class ChatSidebarComponent{
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @Input() isChatOpen: boolean = false;
  @Input() coursId: any
  @Output() isChatClose = new EventEmitter<boolean>();
  chatForm: FormGroup
  conversations: any
  count = 0
  user: any
  constructor(private fb: FormBuilder, private conversationService: ConversationService, private authService: AuthService, private cdr: ChangeDetectorRef, private loadingService: LoadingService) {
    this.chatForm = this.fb.group({
      message: [null, Validators.required],
    });
  }

  ngOnChanges() {
    this.scrollToBottom();
  }

  ngOnInit(){
    this.loadingService.chatSubject$.subscribe((status) => {
      if (status != null) {
        this.getMine();
      }
  })
    this.user = this.authService.getUser()
    this.getMine()
    this.scrollToBottom()
    // console.log(this.coursId)

  }

  getMine(): Promise<void> {
    return new Promise((resolve) => {
      this.conversationService.getMine(this.coursId).subscribe({
        next: (res) => {
          this.conversations = res.data.conversations.sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateA - dateB;
          });
          // console.log(this.conversations)
          this.count = res.data.count
          resolve();
        },
        error: (error) => {
          console.error(error);
          resolve();
        },
      });
    });
  }

  toggleChat() {
    this.isChatClose.emit(false);
  }

  markAllAsTouched() {
    Object.keys(this.chatForm.controls).forEach(key => {
      this.chatForm.get(key)?.markAsTouched();
    });
  }


  onSubmit() {
    // this.markAllAsTouched();
    // stop here if form is invalid
    if (this.chatForm.invalid) {
      return;
    }
    const {message} = this.chatForm.value

    const data = {
      courseId: this.coursId,
      content: message,
    }

    this.conversationService.addConversation(data).subscribe({
      next: (res) => {
        if (res.status) {
         this.chatForm.reset()
         this.getMine().then(() => {
          this.scrollToBottom();
        });
        } else {
        }
      }, error: error => {
        console.error(error)
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      const lastMessage = this.chatContainer.nativeElement.lastElementChild;
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  }
}
