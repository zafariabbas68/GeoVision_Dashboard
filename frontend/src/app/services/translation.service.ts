import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  constructor(private translate: TranslateService) {
    // Set default language
    this.translate.setDefaultLang('en');

    // Available languages
    this.translate.addLangs(['en', 'it', 'ps']);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('preferredLanguage', lang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || 'en';
  }

  getLanguages() {
    return [
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'it', name: 'Italiano', flag: '🇮🇹' },
      { code: 'ps', name: 'پښتو', flag: '🇦🇫' }
    ];
  }

  initializeLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      this.translate.use(savedLang);
    } else {
      // Detect browser language
      const browserLang = this.translate.getBrowserLang();
      if (browserLang && ['en', 'it', 'ps'].includes(browserLang)) {
        this.translate.use(browserLang);
      }
    }
  }
}
