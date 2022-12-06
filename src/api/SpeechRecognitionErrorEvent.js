export const SpeechRecognitionErrorCode = Object.freeze({
  /** 
   * No speech was detected in the final transcript.
   */
  NOSPEECH: 'no-speech',
  /**
   * Speech input was aborted somehow, maybe by some user-agent-specific behavior 
   * such as UI that lets the user cancel speech input.
   * 
   * **This is not currently used.**
   */
  ABORTED: 'aborted',
  /** 
   * Audio capture failed.
   * 
   * **This is not currently used.**
   */
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
   * 
   * In the context of this polyfill, it likely means you are attempting to authenticate to the
   * SEPIA STT server with incorrect credentials.
   */
  SERVICENOTALLOWED: 'service-not-allowed',
  /** 
   * There was an error in the speech recognition grammar or semantic tags, 
   * or the grammar format or semantic tag format is unsupported.
   * 
   * **This is not yet implemented.** Future support for grammars is planned.
   */
  BADGRAMMAR: 'bad-grammar',
  /** 
   * The language was not supported.
   * 
   * In the context of this polyfill, this means the SEPIA STT server does not have a corresponding
   * model to the user's specified language.
   */
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
    // This is probably a bit of a no-no (assigning custom properties on Event instead of using CustomEvent)
    // but it's necessary to exactly replicate the expected SpeechRecognitionErrorEvent object.
    const event = Object.create(SpeechRecognitionErrorEvent);
    event.error = this.error;
    event.message = this.message;
    event.type = 'error';
    el._dispatchEvent(event);
  }
}