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
    // This is probably a bit of a no-no (assigning custom properties on Event instead of using CustomEvent)
    // but it's necessary to exactly replicate the expected SpeechRecognitionEvent object.
    const event = Object.create(SpeechRecognitionEvent);
    event.resultIndex = this.resultIndex;
    event.results = this.results;
    event.type = type;
    el._dispatchEvent(event);
  }
}