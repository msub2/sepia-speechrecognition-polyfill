/**
 * Represents a single word that has been recognized by the speech recognition service.
 */
export class SpeechRecognitionAlternative {
  /** Returns a string containing the transcript of the recognized word. */
  transcript = '';
  /**
   * Returns a numeric estimate between 0 and 1 of how confident 
   * the speech recognition system is that the recognition is correct.
   */
  confidence = 1;
}