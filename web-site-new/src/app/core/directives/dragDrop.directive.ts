import {
  Directive,
  HostListener,
  Output,
  EventEmitter
} from "@angular/core";
import { DomSanitizer } from '@angular/platform-browser';


@Directive({
  standalone: true,
  selector: "[appDrag]"
})
export class DragDirective {
  @Output() files: EventEmitter<FileList> = new EventEmitter();

  constructor(private sanitizer: DomSanitizer) { }

  @HostListener("dragover", ["$event"]) public onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  @HostListener("dragleave", ["$event"]) public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  @HostListener('drop', ['$event']) public onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();

    let files: FileList
    files = evt.dataTransfer!.files
    if (files.length > 0) {
      this.files.emit(files);
    }
  }
}
