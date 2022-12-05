/**
 * Represents a list of SpeechRecognitionResult objects,
 * or a single one if results are being captured in continuous mode.
 */
 export class SpeechRecognitionResultList {
  /** Internal list of SpeechRecognitionResult objects. */
  #results = [];

  /**
   * Returns the length of the "array" — the number of SpeechRecognitionResult objects in the list.
   */
  length = 0;

  constructor(results) {
    this.#results = results;
    
    // Use a Proxy to more closely match the interface of SpeechRecognitionResultList.
    return new Proxy(this, {
      get: (_, prop) => {
        if (typeof +prop === 'number') {
          return this.#results[prop];
        } else if (prop === 'length') {
          return this.#results.length;
        }
      }
    });
  }
}