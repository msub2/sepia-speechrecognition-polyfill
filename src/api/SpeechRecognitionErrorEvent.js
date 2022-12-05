export const SpeechRecognitionErrorCode = Object.freeze({
  /** No speech was detected.  */
  NOSPEECH: 'no-speech',
  /**
   * Speech input was aborted somehow, maybe by some user-agent-specific behavior 
   * such as UI that lets the user cancel speech input. 
   */
  ABORTED: 'aborted',
  /** Audio capture failed. */
  AUDIOCAPTURE: 'audio-capture',
  /** Some network communication that was required to complete the recognition failed. */
  NETWORK: 'network',
  /**
   * The user agent is not allowing any speech input to occur for reasons of security, privacy or user preference.
   */
  NOTALLOWED: 'not-allowed',
  /**
   * The user agent is not allowing the web application requested speech service, 
   * but would allow some speech service, to be used either because the user agent 
   * doesn’t support the selected one or because of reasons of security, privacy or user preference. 
   */
  SERVICENOTALLOWED: 'service-not-allowed',
  /** 
   * There was an error in the speech recognition grammar or semantic tags, 
   * or the grammar format or semantic tag format is unsupported.
   */
  BADGRAMMAR: 'bad-grammar',
  /** The language was not supported. */
  LANGUAGENOTSUPPORTED: 'language-not-supported',
});

/**
 * Represents error messages from the recognition service.
 */
export class SpeechRecognitionErrorEvent {
  /** Returns the type of error raised. */
  error = '';

  /** Returns a message describing the error in more detail. */
  message = '';
  
  /**
   * Internal function to dispatch `error` event.
   * @param {SpeechRecognition} el The main SpeechRecognition object.
   */
  _dispatch(el) {
    const event = new CustomEvent('error', {
      detail: {
        error: this.error,
        message: this.message
      }
    });
    el._dispatchEvent(event);
  }
}