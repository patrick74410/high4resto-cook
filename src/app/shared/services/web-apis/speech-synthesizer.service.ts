import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SpeechSynthesizerService {
  speechSynthesizer!: SpeechSynthesisUtterance;

  constructor() {
    this.initSynthesis();
  }

  initSynthesis(): void {
    this.speechSynthesizer = new SpeechSynthesisUtterance();
    this.speechSynthesizer.volume = 1;
    this.speechSynthesizer.rate = 1;
    this.speechSynthesizer.pitch = 0.0;
  }

  speak(message: string): void {
    this.speechSynthesizer.lang = "fr-FR";
    this.speechSynthesizer.text = message;
    speechSynthesis.speak(this.speechSynthesizer);
  }
}
