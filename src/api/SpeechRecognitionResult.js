/**
 * Represents a single recognition match, which may contain multiple SpeechRecognitionAlternative objects.
 */
export class SpeechRecognitionResult {
  /** Internal list of SpeechRecognitionAlternative objects. */
  #alternatives = [];
  
  /**
   * A boolean value that states whether this result is final (true) or not (false) — if so,
   * then this is the final time this result will be returned; if not, then this result is an interim result,
   * and may be updated later on.
   */
  isFinal = false;

  /**
   * Returns the length of the "array" — the number of SpeechRecognitionAlternative objects 
   * contained in the result (also referred to as "n-best alternatives").
   */
  length = 0;

  constructor(alternatives) {
    this.#alternatives = alternatives;
    
    // Use a Proxy to more closely match the interface of SpeechRecognitionResult.
    return new Proxy(this, {
      get: (_, prop) => {
        if (prop === 'isFinal') {
          return this.isFinal;
        } else if (prop === 'length') {
          return this.#alternatives.length;
        } else if (typeof +prop === 'number') {
          return this.#alternatives[prop];
        } 
      }
    });
  }
}