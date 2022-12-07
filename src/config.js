/**
 * The configuration to use when connecting to the SEPIA STT server.
 * Each property's initial value is set in such a way that you could
 * connect to a server running from the Docker image with no additional configuration,
 * as long as your current language is either English or German.
 */
export class SepiaSpeechRecognitionConfig {
  // Server Settings

  /** The URL for the SEPIA STT server. */
  serverUrl = "http://localhost:20741";

  /** The client ID to authenticate as with the SEPIA STT server. */
  clientId = "any";

  /**
   * The access token used to authenticate with the SEPIA STT server.
   * 
   * **On a default server installation, which is set to use a common access token,
   * this is set to `test1234`.** If the server is set to use individual tokens instead,
   * this should be set to the corresponding token for the clientId.
   */
  accessToken = "test1234";

  // ASR options

  /// Common options (usually supported by all engines):

  /** Allows for selecting a task-specific model without knowing its exact name. */
  task = "assistant";

  /** The name of the ASR model to use on the server. This does not need to be set if language is already set. */
  model = "";

  /**
   * If set to true, will optimize final results by converting numbers and ordinals expressed as words
   * into integers (i.e. one -> 1, third -> 3rd, etc).
   */
  optimizeFinalResult = true;

  /// Engine specific options:

  /**
   * Allows you to set options for features that may only be available in certain engines.
   * An example would be Vosk's speaker detection, which is not available in Coqui.
   */
  engineOptions = {};
}