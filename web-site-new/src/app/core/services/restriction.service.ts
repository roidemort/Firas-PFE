import { Injectable, Renderer2, RendererFactory2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class RestrictionService {
  private renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2, @Inject(PLATFORM_ID) private platformId: Object) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  // Méthode pour ajouter les restrictions
  applyRestrictions(element: HTMLElement): void {
    // Vérification si nous sommes côté client (navigateur)
    if (isPlatformBrowser(this.platformId)) {
      // Désactiver le clic droit sur un élément spécifique
      this.renderer.listen(element, 'contextmenu', (event: MouseEvent) => {
        event.preventDefault();
        // alert('Clic droit désactivé.');
      });

      // Désactiver les raccourcis clavier au niveau global
      this.renderer.listen(document, 'keydown', (event: KeyboardEvent) => {
        const restrictedKeys = [
          { keys: ['Ctrl', 'Shift', 'I'] },
          { keys: ['Ctrl', 'Shift', 'C'] },
          { keys: ['Ctrl', 'Shift', 'J'] },
          { keys: ['Ctrl', 'U'] },
          { keys: ['F12'] },
          { keys: ['PrintScreen'] },
          { keys: ['Ctrl', 'Shift', 'S'] }
          // { keys: ['Meta', 'Shift', 'S'] }, // Windows + Shift + S
        ];

        const keyCombo = [
          event.ctrlKey ? 'Ctrl' : null,
          event.shiftKey ? 'Shift' : null,
          event.altKey ? 'Alt' : null,
          event.metaKey ? 'Meta' : null, // Meta correspond à la touche Windows sur PC ou Cmd sur Mac
          event.key ? event.key.toUpperCase() : null
        ].filter(Boolean);

        for (const shortcut of restrictedKeys) {
          if (shortcut.keys.every(key => keyCombo.includes(key))) {
            event.preventDefault();
            // alert('Action désactivée : raccourci restreint.');
            break;
          }
        }
      });
    }
  }
}
