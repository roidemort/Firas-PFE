import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';

import {environment} from "../../../environments/environment";
import {AppComponent} from "../../app.component";

class LocalStorage implements Storage {
  [name: string]: any;
  readonly length!: number;
  clear(): void {}
  getItem(key: string): string | null {return null;}
  key(index: number): string | null {return null;}
  removeItem(key: string): void {}
  setItem(key: string, value: string): void {}
}


interface IStorage {
  value: any;
  expiresIn: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class LocalStorageService implements Storage {

  private storage: Storage;

  constructor() {
    this.storage = new LocalStorage();
    AppComponent.isBrowser.subscribe(isBrowser => {
      if (isBrowser) {
        this.storage = localStorage;
      }
    });
    // find out if storage needs to be forcefully nulled
    this._setResetKey();
  }
  [name: string]: any;

  length!: number;
  private get ourStorage(): Storage {
    return this.storage;
  }
  setOurStorage(storage: Storage): Storage {
    return this.storage = storage;
  }
  private _setResetKey(): void {
    // NOTE here, if you are getting configuration externally, and to avoid any
    // mishaps, subscribe to the config$ observable here, just in case
    // the storageService is injected too early

    const _key = this.getKey(environment.Storage.ResetKey);
    const _reset: any = this.ourStorage.getItem(_key);

    // if it does not exist, it must have changed in config, remove everything
    if (!_reset || _reset !== 'true') {
      this.clear();
      // set a new one
      this.ourStorage.setItem(_key, 'true');
    }
  }

  private getKey(key: string, withLanguage = false): string {
    return `${environment.Storage.Key}${
      withLanguage ? '.' + environment.Basic.language : ''
    }.${key}`;
  }

  setItem(
    key: string,
    value: any,
    expiresIn: number = environment.Storage.Timeout,
    withLanguage = false
  ) {
    // prepare value
    const _value: IStorage = {
      value,
      timestamp: Date.now(), // in milliseconds
      expiresIn: expiresIn, // in hours
    };

    // objects must be strings
    this.ourStorage.setItem(
      this.getKey(key, withLanguage),
      this.encrypt(JSON.stringify(_value))
    );
  }

  getItem(key: string, withLanguage = false): any {
    // check value
    const _key = this.getKey(key, withLanguage);
    let value: any = this.ourStorage.getItem(_key);

    if (!value) {
      return null;
    }
    // cast
    value = this.decrypt(value);
    const _value: IStorage = JSON.parse(value);

    // calculate expiration, expiresIn is in hours, so convert to milliseconds
    if (Date.now() - _value.timestamp > _value.expiresIn * 3_600_000) {
      // if expired, remove
      this.ourStorage.removeItem(_key);
      return null;
    }
    // return the value
    return _value.value;
  }

  removeItem(key: string, withLanguage = false) {
    this.ourStorage.removeItem(this.getKey(key, withLanguage));
  }

  // for caching language specific, prefix with language
  setCache(
    key: string,
    value: any,
    expiresIn: number = environment.Storage.Timeout
  ) {
    this.setItem(key, value, expiresIn, true);
  }
  getCache(key: string): any {
    return this.getItem(key, true);
  }
  removeCache(key: string) {
    this.removeItem(key, true);
  }

  clear(): void {
    // remove all prefixed items
    const toClear = [];

    for (let i = 0; i < this.ourStorage.length; i++) {
      const name = this.ourStorage.key(i);
      if (name!.indexOf(environment.Storage.Key) === 0) {
        // delay because removeItem is destructive
        toClear.push(name);
      }
    }

    toClear.forEach((n) => this.ourStorage.removeItem(n!));
  }

  key(index: number): string | null {
    return this.storage.key(index);
  }
  private encrypt(txt: string): string {
    return CryptoJS.AES.encrypt(txt, environment.Security.key).toString();
  }

  private decrypt(txtToDecrypt: string) {
    return CryptoJS.AES.decrypt(txtToDecrypt, environment.Security.key).toString(CryptoJS.enc.Utf8);
  }
}
