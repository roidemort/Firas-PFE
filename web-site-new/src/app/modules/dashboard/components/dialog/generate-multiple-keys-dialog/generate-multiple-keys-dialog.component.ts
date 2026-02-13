import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-generate-multiple-keys-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './generate-multiple-keys-dialog.component.scss',
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <!-- Header -->
        <div class="border-b px-6 py-4">
          <h3 class="text-lg font-semibold text-gray-900">Générer plusieurs clés</h3>
          <p class="text-sm text-gray-500 mt-1">Sélectionnez le nombre de clés par rôle</p>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <!-- Pharmacien Titulaire -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pharmacien Titulaire
            </label>
            <div class="flex items-center">
              <button (click)="decrement('PHARMACIST_HOLDER')"
                      class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-l hover:bg-gray-300">
                -
              </button>
              <input type="number"
                     [(ngModel)]="keysCount.PHARMACIST_HOLDER"
                     min="0"
                     class="w-16 h-8 text-center border-y border-gray-300">
              <button (click)="increment('PHARMACIST_HOLDER')"
                      class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-r hover:bg-gray-300">
                +
              </button>
              <span class="ml-3 text-sm text-gray-600">{{keysCount.PHARMACIST_HOLDER}} clé(s)</span>
            </div>
          </div>

          <!-- Pharmacien -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pharmacien
            </label>
            <div class="flex items-center">
              <button (click)="decrement('PHARMACIST')"
                      class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-l hover:bg-gray-300">
                -
              </button>
              <input type="number"
                     [(ngModel)]="keysCount.PHARMACIST"
                     min="0"
                     class="w-16 h-8 text-center border-y border-gray-300">
              <button (click)="increment('PHARMACIST')"
                      class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-r hover:bg-gray-300">
                +
              </button>
              <span class="ml-3 text-sm text-gray-600">{{keysCount.PHARMACIST}} clé(s)</span>
            </div>
          </div>

          <!-- Stagiaire -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Stagiaire
            </label>
            <div class="flex items-center">
              <button (click)="decrement('STAGIAIRE')"
                      class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-l hover:bg-gray-300">
                -
              </button>
              <input type="number"
                     [(ngModel)]="keysCount.STAGIAIRE"
                     min="0"
                     class="w-16 h-8 text-center border-y border-gray-300">
              <button (click)="increment('STAGIAIRE')"
                      class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-r hover:bg-gray-300">
                +
              </button>
              <span class="ml-3 text-sm text-gray-600">{{keysCount.STAGIAIRE}} clé(s)</span>
            </div>
          </div>

          <!-- Préparateur en pharmacie -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Préparateur en pharmacie
            </label>
            <div class="flex items-center">
              <button (click)="decrement('PREPARER')"
                      class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-l hover:bg-gray-300">
                -
              </button>
              <input type="number"
                     [(ngModel)]="keysCount.PREPARER"
                     min="0"
                     class="w-16 h-8 text-center border-y border-gray-300">
              <button (click)="increment('PREPARER')"
                      class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-r hover:bg-gray-300">
                +
              </button>
              <span class="ml-3 text-sm text-gray-600">{{keysCount.PREPARER}} clé(s)</span>
            </div>
          </div>

          <!-- Total -->
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-700">Total des clés à générer:</span>
              <span class="text-lg font-bold text-blue-600">{{getTotalKeys()}}</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">Cliquez sur Générer pour créer toutes les clés en une seule fois</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t px-6 py-4 flex justify-end space-x-3">
          <button (click)="onCancel()"
                  class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
            Annuler
          </button>
          <button (click)="onGenerate()"
                  [disabled]="getTotalKeys() === 0"
                  [ngClass]="{'opacity-50 cursor-not-allowed': getTotalKeys() === 0}"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
            Générer {{getTotalKeys()}} clé(s)
          </button>
        </div>
      </div>
    </div>
  `
})
export class GenerateMultipleKeysDialogComponent {


  @Output() closeDialog = new EventEmitter<any>();

  keysCount = {
    PHARMACIST_HOLDER: 0,
    PHARMACIST: 0,
    STAGIAIRE: 0,
    PREPARER: 0
  };

  increment(role: keyof typeof this.keysCount) {
    this.keysCount[role]++;
  }

  decrement(role: keyof typeof this.keysCount) {
    if (this.keysCount[role] > 0) {
      this.keysCount[role]--;
    }
  }

  getTotalKeys(): number {
    return Object.values(this.keysCount).reduce((a, b) => a + b, 0);
  }

  onGenerate() {
    const total = this.getTotalKeys();
    if (total > 0) {
      // Prepare the data structure
      const keysToGenerate = [];

      for (const [role, count] of Object.entries(this.keysCount)) {
        for (let i = 0; i < count; i++) {
          keysToGenerate.push({ role });
        }
      }

      this.closeDialog.emit(keysToGenerate);
    }
  }

  onCancel() {
    this.closeDialog.emit(null);
  }

}
