import { SpeechRecognitionResultList } from './SpeechRecognitionResultList.js';

/**
 * Represents the event object for the result and nomatch events, 
 * and contains all the data associated with an interim or final speech recognition result.
 */
 export class SpeechRecognitionEvent {
  /**
   * Returns the lowest index value result in the SpeechRecognitionResultList "array" that has actually changed.
   */
  resultIndex = 0;
  
  /**
   * Returns a SpeechRecognitionResultList object representing 
   * all the speech recognition results for the current session.
   */
  results;

  constructor(results) {
    this.results = new SpeechRecognitionResultList(results);
  }
  
  /**
   * Internal function to dispatch either `result` or `nomatch` event.
   * @param {SpeechRecognition} el 
   * @param {"result" | "nomatch"} type 
   */
  _dispatch(el, type) {
    const event = new CustomEvent(type, {
      detail: {
        resultIndex: this.resultIndex,
        results: this.results
      }
    });
    el._dispatchEvent(event);
  }
}