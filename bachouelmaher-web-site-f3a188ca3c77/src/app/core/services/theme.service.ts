import { Injectable, signal } from '@angular/core';
import { Theme } from '../models/theme.model';
import { effect } from '@angular/core';
import {AppComponent} from "../../app.component";
import {LocalStorageService} from "./localstorage.service";

type DocumentType = Document

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public theme = signal<Theme>({ mode: 'light', color: 'base' });
  constructor(private localstorageService: LocalStorageService) {
    this.loadTheme();
    effect(() => {
      this.setTheme();
    });
  }

  private loadTheme() {
    const theme = this.localstorageService.getItem('theme');
    if (theme) {
      this.theme.set(theme)
    }
  }

  private setTheme() {
    this.localstorageService.setItem('theme', this.theme());
    this.setThemeClass();
  }

  public get isDark(): boolean {
    return this.theme().mode == 'dark';
  }

  private setThemeClass() {
    AppComponent.isBrowser.subscribe(isBrowser => {
      if (isBrowser) {
        document.querySelector('html')!.className = this.theme().mode;
        document.querySelector('html')!.setAttribute('data-theme', this.theme().color);
      }
    });
  }
}
