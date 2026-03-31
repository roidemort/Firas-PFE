import { Component, OnInit } from '@angular/core';
import { FooterComponent } from './components/footer/footer.component';
import { NavigationEnd, Router, RouterOutlet, Event } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import {AppComponent} from "../../app.component";
import {MatDrawer, MatDrawerContainer, MatDrawerContent} from "@angular/material/sidenav";
import {ChatService} from "../../core/services/chat.service";
import {LoaderComponent} from "../../shared/components/loader/loader.component";
import {DatePipe, NgIf} from "@angular/common";
import {UsersService} from "../../core/services/users.service";
import {toast} from "ngx-sonner";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../core/services/auth.service";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, RouterOutlet, FooterComponent, MatDrawer, MatDrawerContainer, MatDrawerContent, LoaderComponent, NgIf, ReactiveFormsModule, MatTooltip, DatePipe],
})
export class LayoutComponent implements OnInit {
  private mainContent: HTMLElement | null = null;
  open = false
  isLoading = false
  userId = null
  courseId = null
  conversations: any
  user: any
  messageForm!: FormGroup;
  submitted = false
  currentUser: any
  constructor(private router: Router, private chatService: ChatService, private usersService: UsersService,private fb : FormBuilder, private authService: AuthService) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (this.mainContent) {
          this.mainContent!.scrollTop = 0;
        }
      }
    });
  }

  ngOnInit(): void {
    AppComponent.isBrowser.subscribe(isBrowser => {
      if (isBrowser) {
        this.mainContent = document.getElementById('nft-content');
      }
    });
    this.authService.currentUser.subscribe(userData => {
      this.currentUser = userData;
    });
    this.messageForm = this.fb.group({
      content: [null, Validators.required],
    });
    this.chatService.openChat$.subscribe(open => {
      this.open = open
    });
    this.chatService.chatData$.subscribe(data => {
      this.isLoading = data.loading
      this.courseId = data.courseId
      this.userId = data.userId
      if(this.userId && this.courseId) {
        this.getConversations()
      }
    });
  }
  private handleRequestError(error: any) {
    this.isLoading = false
    const msg = 'An error occurred while fetching users';
    toast.error(msg, {
      position: 'bottom-right',
      description: error.message,
      action: {
        label: 'Undo',
        onClick: () => console.log('Action!'),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }
  onCloseChat(){
    this.chatService.toggleChat(false);
    this.messageForm.reset();
  }
  sendMessage() {
    this.submitted = true;
    if (this.messageForm.valid) {
      this.isLoading = true
      this.usersService.addConversation(this.userId!, this.courseId!, this.messageForm.value.content).subscribe({
        next: (result) => {
          if (result.status) {
            this.isLoading = false
            this.messageForm.reset();
            this.getConversations()
          }
        },
        error: (error) => this.handleRequestError(error),
      });
    }
  }
  getConversations() {
    this.usersService.userConversation(this.userId!, this.courseId!).subscribe({
      next: (result) => {
        this.conversations = result.data.conversations
        this.user = result.data.user
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
}
