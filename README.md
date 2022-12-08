# SEPIA SpeechRecognition Polyfill

An implementation of the SpeechRecognition portion of the [Web Speech API](https://wicg.github.io/speech-api/) built to function with a [SEPIA STT server](https://github.com/SEPIA-Framework/sepia-stt-server). This polyfill allows for developers to have consistent cross-platform
support for speech recognition, including on platforms that do not have access to the Web Speech API natively.

This polyfill attempts to conform to the existing specification draft as close as possible. Any deviations will be noted below.

## Setup

### Installation

For use with Node or NPM:

```bash
npm i sepia-speechrecognition-polyfill
```

You can also load it from a CDN link:

```text
https://cdn.jsdelivr.net/npm/sepia-speechrecognition-polyfill@1.0.0
https://unpkg.com/sepia-speechrecognition-polyfill@1.0.0
```

### Building Locally

```bash
git clone https://github.com/msub2/sepia-speechrecognition-polyfill
cd sepia-speechrecognition-polyfill
npm i
npm run build
```

## Usage

This polyfill requires you to connect to a SEPIA STT server. For more detailed instructions on how to set up a SEPIA STT server, you can refer to the setup instructions on the main repo [here](https://github.com/SEPIA-Framework/sepia-stt-server#quick-start-with-docker).

### API

The polyfill exports a function, `sepiaSpeechRecognitionInit()`, and a class, `SepiaSpeechRecognitionConfig`.

`sepiaSpeechRecognitionInit` takes in a `SepiaSpeechRecognitionConfig` as a parameter and returns the polyfilled SpeechRecognition class.

`SepiaSpeechRecognitionConfig` contains properties for configuring your connection to the SEPIA STT server, which are as follows:

|Property|Description|Default Value|
|-|-|-|
|`serverUrl`|The URL for the SEPIA STT server.|`"http://localhost:20741"`|
|`clientId`|The client ID to authenticate as with the SEPIA STT server.|`"any"`|
|`accessToken`|The access token used to authenticate with the SEPIA STT server. **On a default server installation, which is set to use a common access token, this is set to `test1234`.** If the server is set to use individual tokens instead, this should be set to the corresponding token for the clientId.|`"test1234"`|
|`task`|Allows for selecting a task-specific model without knowing its exact name.|`""`|
|`model`|The name of the ASR model to use on the server. This does not need to be set if language is already set.|`""`|
|`optimizeFinalResult`|If set to true, will optimize final results by converting numbers and ordinals expressed as words into integers (i.e. one -> 1, third -> 3rd, etc).|`true`|
|`engineOptions`|Allows you to set options for features that may only be available in certain engines used by the server. An example would be Vosk's speaker detection, which is not available in Coqui.|`{}`|

### Example

The following is an example of how to utilize the polyfill to support speech recognition across any browser:

```js
import { sepiaSpeechRecognitionInit, SepiaSpeechRecognitionConfig } from './sepia-speechrecognition-polyfill.min.js';

const config = new SepiaSpeechRecognitionConfig();
// Set configuration options specific to your SEPIA STT server

const SpeechRecognition = window.webkitSpeechRecognition || sepiaSpeechRecognitionInit(config);
const speechTest = new SpeechRecognition();
speechTest.onerror = (e) => console.log(e.error, e.message);
speechTest.onresult = (e) => console.log(`${e.results[0][0].transcript} ${e.results[0].isFinal}`);
speechTest.interimResults = true;
speechTest.continuous = true;

const micButton = document.getElementById("micButton");
let toggled = false;
micButton.addEventListener('pointerup', () => {
  if (!toggled) speechTest.start()
  else speechTest.stop();
  toggled = !toggled;
});
```

## Unimplemented Features

- The error codes `aborted`, `audio-capture`, and `bad-grammar` are not currently used by the polyfill.
- Grammars are not currently implemented. See [this issue](https://github.com/msub2/sepia-speechrecognition-polyfill/issues/1) for a more in-depth discussion about implementing grammars.

## Behavior Differences

- From my testing, this polyfill actually behaves closer to spec than Chromium's implementation in regards to how `continuous` works.
  - On Chrome, once the first final transcript is received, recognition seems to stop, and it only returns that last transcript no matter how much you say after that. The polyfill continuously returns finalized transcripts after a set period of no speech from the user.
- The polyfill will attempt to infer the `lang` property based on the document language or `navigator.language`. Chromium does not.

## Acknowledgements

Very special thanks goes out to [Florian Quirin](https://github.com/fquirin), maintainer of [SEPIA](https://github.com/SEPIA-Framework), for creating so much of the code that this polyfill relies on.
