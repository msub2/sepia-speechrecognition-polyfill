import { SepiaSpeechRecognition } from './api/SpeechRecognition.js';

/**
 * Returns a SpeechRecognition implementation that uses a SEPIA STT server
 * to perform ASR and generate transcriptions.
 * 
 * @param options A set of options for configuring the SEPIA STT socket client.
 * @returns A class implementing the SpeechRecognition interface.
 */
export const sepiaSpeechRecognitionInit = (options) => {
  return new SepiaSpeechRecognition(options);
}