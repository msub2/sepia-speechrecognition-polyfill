import { getServerInfo } from '../server.js';
import { Recorder } from "../recorder.js";
import { SpeechRecognitionErrorEvent } from './SpeechRecognitionErrorEvent.js';
import { SpeechGrammarList } from './SpeechGrammarList.js';

let sepiaOptions = {};

/**
 * Returns a SpeechRecognition implementation that uses a SEPIA STT server
 * to perform ASR and generate transcriptions.
 * 
 * @param options A set of options for configuring the SEPIA STT socket client.
 * @returns A class implementing the SpeechRecognition interface.
 */
 export const sepiaSpeechRecognitionInit = (options) => {
  sepiaOptions = options;
  return SepiaSpeechRecognition;
}

export class SepiaSpeechRecognition {
  #recorder = new Recorder(this);
  
  /**
   * Returns and sets a collection of SpeechGrammar objects that represent the grammars 
   * that will be understood by the current SpeechRecognition. 
   */
  grammars = new SpeechGrammarList();

  /**
   * Returns and sets the language of the current SpeechRecognition. 
   * If not specified, this defaults to the HTML lang attribute value, 
   * or the user agent's language setting if that isn't set either. 
   */
  lang = document.documentElement.lang || navigator.language;

  /** Controls whether continuous results are returned for each recognition, or only a single result. */
  continuous = false;

  /**
   * Controls whether interim results should be returned (true) or not (false).
   * Interim results are results that are not yet final
   * (e.g. the SpeechRecognitionResult.isFinal property is false). 
   */
  interimResults = false;

  /** Sets the maximum number of SpeechRecognitionAlternatives provided per SpeechRecognitionResult. */
  maxAlternatives = 1;

  constructor() {
    getServerInfo();
    console.log(sepiaOptions);
  }

  /**
   * Starts the speech recognition service listening to incoming audio with intent
   * to recognize grammars associated with the current SpeechRecognition. 
   */
  start = () => {
    this.#recorder.toggleMic();
  }

  /**
   * Stops the speech recognition service from listening to incoming audio, 
   * and attempts to return a SpeechRecognitionResult using the audio captured so far. 
   */
  stop = () => {
    this.#recorder.toggleMic();
  }

  /**
   * Stops the speech recognition service from listening to incoming audio,
   * and doesn't attempt to return a SpeechRecognitionResult. 
   */
  abort = () => {
    this.#recorder.toggleMic();
  }

  /**
   * Fired when the user agent has started to capture audio for speech recognition.
   * @param {Event} event 
   */
  onaudiostart = (event) => {};
  /**
   * Fired when any sound — recognizable speech or not — has been detected.
   * @param {Event} event 
   */
  onsoundstart = (event) => {};
  /**
   * fired when sound recognized by the speech recognition service as speech has been detected.
   * @param {Event} event 
   */
  onspeechstart = (event) => {};
  /**
   * Fired when speech recognized by the speech recognition service has stopped being detected.
   * @param {Event} event 
   */
  onspeechend = (event) => {};
  /**
   * Fired when any sound — recognizable speech or not — has stopped being detected.
   * @param {Event} event 
   */
  onsoundend = (event) => {};
  /**
   * Fired when the user agent has finished capturing audio for speech recognition.
   * @param {Event} event 
   */
  onaudioend = (event) => {};
  /**
   * Fired when the speech recognition service returns a result — a word or phrase has been 
   * positively recognized and this has been communicated back to the app
   * @param {SpeechRecognitionEvent} event 
   */
  onresult = (event) => {};
  /**
   * Fired when the speech recognition service returns a final result with no significant recognition.
   * @param {SpeechRecognitionEvent} event 
   */
  onnomatch = (event) => {};
  /**
   * Fired when a speech recognition error occurs.
   * @param {SpeechRecognitionErrorEvent} event 
   */
  onerror = (event) => {};
  /**
   * Fired when the speech recognition service has begun listening to incoming audio 
   * with intent to recognize grammars associated with the current SpeechRecognition.
   * @param {Event} event 
   */
  onstart = (event) => {};
  /**
   * Fired when the speech recognition service has disconnected.
   * @param {Event} event 
   */
  onend = (event) => {};

  /** Internal Map of event callbacks */
  _eventCallbacks = new Map();
  
  /**
   * Internal function to fire events
   */
  _dispatchEvent = (event) => {
    // Fire registered callbacks for this event
    const callbacks = this._eventCallbacks.get(event.type);
    if (callbacks) {
      callbacks.forEach(cb => cb(event));
    }
    // Fire EventHandler
    this[`on${event.type}`](event);
  }
  /**
   * Dummy addEventListener implementation.
   * Does not implement options or useCapture.
   * 
   * @param {String} type The event to listen for
   * @param {Function} listener The listener to add for this event
   */
  addEventListener = (type, listener) => {
    // Associate callback with specified event
    if (!this._eventCallbacks.has(type)) {
      this._eventCallbacks.set(type, [listener]);
    } else {
      this._eventCallbacks.get(type).push(listener);
    }
  }
  /**
   * Dummy removeEventListener implementation.
   * Does not implement options or useCapture.
   * 
   * @param {String} type The event to listen for
   * @param {Function} listener The listener to remove for this event
   */
   removeEventListener = (type, listener) => {
    // Associate callback with specified event
    if (!this._eventCallbacks.has(type)) {
      // Do nothing
    } else {
      const listeners = this._eventCallbacks.get(type);
      if (listeners.includes(listener)) {
        listeners.splice(listeners.indexOf(listener), 1);
      }
    }
  }
}