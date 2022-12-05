/**
 * Represents a set of words or patterns of words that we want the recognition service to recognize.
 * Grammar is defined using JSpeech Grammar Format (JSGF.) Other formats may also be supported in the future.
 */
export class SpeechGrammar {
  /** Sets and returns a string containing the grammar from within in the SpeechGrammar object. */
  src = '';
  /** Sets and returns the weight of the SpeechGrammar object. */
  weight = 1;
}