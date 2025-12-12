import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-file-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-overview.component.html',
  styleUrls: ['./file-overview.component.scss'],
})
export class FileOverviewComponent implements OnInit {
  @Input() url!: string;
  sanitizedUrl!: SafeResourceUrl;
  

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    // console.log(this.url);
    this.sanitizedUrl = this.sanitizeIframeUrl(this.url);
  }

  sanitizeIframeUrl(url: string): SafeResourceUrl {
    const urlMatch = url.match(/src="([^"]+)"/);
    if (urlMatch && urlMatch[1]) {
      // Marquer l'URL comme sûre
      return this.sanitizer.bypassSecurityTrustResourceUrl(urlMatch[1]);
    }
    throw new Error('Invalid URL');
  }
}
