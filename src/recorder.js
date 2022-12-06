import { SepiaSpeechRecognition } from "./api/SpeechRecognition.js";
import { SpeechRecognitionEvent } from "./api/SpeechRecognitionEvent.js";
import { SpeechRecognitionAlternative } from "./api/SpeechRecognitionAlternative.js";
import { SpeechRecognitionResult } from "./api/SpeechRecognitionResult.js";
import { SpeechRecognitionResultList } from "./api/SpeechRecognitionResultList.js";
import { serverSettings, asrOptions, phrases } from "./server.js";
import { SpeechRecognitionErrorCode, SpeechRecognitionErrorEvent } from "./api/SpeechRecognitionErrorEvent.js";

//--- Recorder ---
export class Recorder {
  volumeThresholds = [0.05, 10];		//too low/too high
  gain = 1;
  
  isLoading = false;
  isRecording = false;
  isWaitingForFinalResult = false;
  waitingForFinalResultTimer = undefined;
  waitingForFinalResultDelay = 4000;
  asrStreaming = false;
  sourceInfo = "-?-";

  /**
   * @type {SepiaSpeechRecognition}
   */
  sepiaSpeechRecognition;

  constructor(sepiaSpeechRecognition) {
    if (!window.SepiaVoiceRecorder) {
      SepiaVoiceRecorder = {notSupported: true};	//Library not found or not supported (browser <= IE11)
      console.error("SEPIA Web Audio Library not found or not supported (IE11?)!");
    } else {
      this.sepiaSpeechRecognition = sepiaSpeechRecognition;
      const self = this;
      
      SepiaVoiceRecorder.onProcessorReady = function(info) {
        console.log("SepiaVoiceRecorder -  onProcessorReady", info);
        this.sourceInfo = "Sample-rate: " + info.targetSampleRate 
          + "Hz (factor: " + (info.inputSampleRate/info.targetSampleRate) + ")\nDevice Label:\n" + (info.sourceInfo ? info.sourceInfo.label : "");
        console.log(this.sourceInfo);
        this.isLoading = false;
        this.isRecording = false;
        this.isWaitingForFinalResult = false;
        SepiaVoiceRecorder.start();
      }
      SepiaVoiceRecorder.onConnected = function(info) {
        if (info && info.model) {
          console.log("INFO - connected - ASR active model: " + info.model);
          sepiaSpeechRecognition._dispatchEvent(new Event('start'));
        }
      }
      SepiaVoiceRecorder.onDisconnected = function() {
        sepiaSpeechRecognition._dispatchEvent(new Event('end'));
      }
      SepiaVoiceRecorder.onProcessorInitError = function(err) {
        self.onMicError();
        const error = new SpeechRecognitionErrorEvent();
        error.message = err.message;
        switch (err.name) {
          case 'NotAllowedError':
            error.error = SpeechRecognitionErrorCode.NOTALLOWED;
            error._dispatch(sepiaSpeechRecognition);
            break;
          default:
            console.log(err);
            break;
        }
        if (location.protocol == "http:" && !location.origin.indexOf("http://localhost") == 0) {
          console.error("Init. ERROR - Likely because of insecure origin (no HTTPS or localhost)");
        }
      }
      SepiaVoiceRecorder.onProcessorError = function(err) {
        console.error("SepiaVoiceRecorder -  onProcessorError", err);
        self.onMicError();
        console.log("ERROR - onProcessorError: " + err.name);
      }
      
      SepiaVoiceRecorder.onAudioStart = function(info) {
        sepiaSpeechRecognition._dispatchEvent(new Event('audiostart'));
        self.isRecording = true;
      }
      SepiaVoiceRecorder.onAudioEnd = function(info) {
        this;
        sepiaSpeechRecognition._dispatchEvent(new Event('audioend'));
        self.isRecording = false;
        //"loading" or "idle"? Depends if waiting for final result...
        if (self.isWaitingForFinalResult) {
          //trigger fallback timer
          clearTimeout(self.waitingForFinalResultTimer);
          self.waitingForFinalResultTimer = setTimeout(function() {
            self.isWaitingForFinalResult = false;
          }, self.waitingForFinalResultDelay);
        }
        console.log("Microphone is CLOSED");
      }
      
      SepiaVoiceRecorder.onProcessorRelease = function(info) {
        console.log("SepiaVoiceRecorder -  onProcessorRelease");
        self.isRecording = false;
        self.isLoading = false;
        self.isWaitingForFinalResult = false;
      }
      
      SepiaVoiceRecorder.onDebugLog = function(msg) {}
      
      SepiaVoiceRecorder.onResamplerData = function(data) {
        //console.log("SepiaVoiceRecorder -  onResamplerData", data.rms);
      }
      SepiaVoiceRecorder.onSpeechRecognitionStateChange = function(ev) {
        if (ev.state == "onStreamStart") {
          if (!self.asrStreaming) {
            // N/A?
          }
          self.asrStreaming = true;
        } else if (ev.state == "onStreamEnd") {
          if (self.asrStreaming) {
            if (ev.bufferOrTimeLimit === true) {
              console.log("Speech Recognition - Stopped streaming due to buffer- or time-limit");
            }
            if (self.isRecording) {
              SepiaVoiceRecorder.stop();
            } else if (self.isWaitingForFinalResult) {
              //trigger fallback timer
              clearTimeout(self.waitingForFinalResultTimer);
              self.waitingForFinalResultTimer = setTimeout(function() {
                self.isWaitingForFinalResult = false;
              }, self.waitingForFinalResultDelay);
            }
          }
          self.asrStreaming = false;
        }
      }
      SepiaVoiceRecorder.onSpeechRecognitionEvent = function(data) {
        if (data.type == "result") {
          if (!self.isRecording && !self.isWaitingForFinalResult) return;	//TODO: ignore unplanned results - use?
          // Prepare SpeechRecognitionEvent
          const alternative = new SpeechRecognitionAlternative();
          alternative.transcript = data.transcript;
          alternative.confidence = data.confidence;
          const result = new SpeechRecognitionResult([alternative]);
          if (data.isFinal) {
            // Final transcript
            if (self.isWaitingForFinalResult && !self.isRecording) {
              clearTimeout(self.waitingForFinalResultTimer);
            }
            result.isFinal = true;
            const list = new SpeechRecognitionResultList([result]);
            const event = new SpeechRecognitionEvent(list);
            if (data.transcript) {
              event._dispatch(sepiaSpeechRecognition, 'result');
            } else {
              const event = new SpeechRecognitionErrorEvent();
              event.error = SpeechRecognitionErrorCode.NOSPEECH;
              event.message = 'No speech was detected.';
              event._dispatch(sepiaSpeechRecognition)
            }
            self.isWaitingForFinalResult = false;
          } else {
            // Partial transcript
            result.isFinal = false;
            const list = new SpeechRecognitionResultList([result]);
            const event = new SpeechRecognitionEvent(list);
            if (data.transcript) {
              event._dispatch(sepiaSpeechRecognition, 'result');
            } else {
              event._dispatch(sepiaSpeechRecognition, 'nomatch');
            }
            self.isWaitingForFinalResult = true;
          }
        } else if (data.type == "error") {
          const error = new SpeechRecognitionErrorEvent();
          error.message = data.message;
          if (data.name && data.message) {
            switch (data.name) {
              case 'SocketConnectionError':
                error.error = SpeechRecognitionErrorCode.NETWORK;
                error._dispatch(sepiaSpeechRecognition);
                break;
              case 'Error':
                if (data.message === 'ChunkProcessorError failed to load.') {
                  // This only seems to happen when the access token is incorrect,
                  // so will use this for service not allowed.
                  error.error = SpeechRecognitionErrorCode.SERVICENOTALLOWED;
                  error.message = 'You are likely unauthorized to access this SEPIA STT server.';
                  error._dispatch(sepiaSpeechRecognition);
                }
                break;
              default:
                console.log(data);
                break;
            }
          } else {
            console.error("Speech Recognition Error:", data);
          }
        } else {
          console.log("Speech Recognition - Event: " + data.type);
        }
      }
      SepiaVoiceRecorder.onWaveEncoderAudioData = function(waveData) {
        // N/A
      }
      //Voice-Activity-Detection events
      SepiaVoiceRecorder.onVadStateChange = function(state, code){
        switch (state) {
          case 'vaup':
            sepiaSpeechRecognition._dispatchEvent(new Event('soundstart'));
            break;
          case 'vadown':
            sepiaSpeechRecognition._dispatchEvent(new Event('soundend'));
            break;
          case 'speechstart':
            sepiaSpeechRecognition._dispatchEvent(new Event('speechstart'));
            break;
          case 'speechend':
          sepiaSpeechRecognition._dispatchEvent(new Event('speechend'));
          break;
        }
      }
    }
  }
  
  toggleMic() {
    const shortenedLang = this.sepiaSpeechRecognition.lang.split('-')[0];
    if (asrOptions.language != this.sepiaSpeechRecognition.lang && asrOptions.language != shortenedLang) {
      const event = new SpeechRecognitionErrorEvent();
      event.error = SpeechRecognitionErrorCode.LANGUAGENOTSUPPORTED;
      event.message = 'The specified SEPIA STT server does not support the language specified by the user agent.';
      event._dispatch(this.sepiaSpeechRecognition);
      return;
    }
    
    const self = this;
    if (!this.isLoading && !this.isRecording && !this.isWaitingForFinalResult) {
      this.isLoading = true;
      //for this demo we create a new recorder each time
      SepiaVoiceRecorder.stopAndReleaseIfActive(function() {
        SepiaFW.webAudio.tryNativeStreamResampling = false;		//try native resampling?
        //build options
        var opt = Object.assign({}, serverSettings, asrOptions);
        if (phrases.length) {
          if (!opt.engineOptions) opt.engineOptions = {};
          opt.engineOptions.phrases = phrases;
        }
        if (hotWords.length) {
          if (!opt.engineOptions) opt.engineOptions = {};
          opt.engineOptions.hotWords = hotWords;
        }
        SepiaVoiceRecorder.create({
          gain: self.gain,
          //recordingLimitMs: 10000,	//NOTE: will not apply in continous mode
          asr: opt,
          vad: true 	//check voice recorder demo of SEPIA Web Audio Lib. for info about VAD etc.
        });
      });
      
    } else if (this.isRecording) {
      SepiaVoiceRecorder.stop();
    
    } else if (this.isLoading || this.isWaitingForFinalResult) {
      SepiaVoiceRecorder.stopAndReleaseIfActive(function() {
        this.isLoading = false;
        this.isRecording = false;
        this.isWaitingForFinalResult = false;
      });
    }
  }
  
  releaseMic(callback) {
    SepiaVoiceRecorder.stopAndReleaseIfActive(function() {
      this.isLoading = false;
      this.isRecording = false;
      this.isWaitingForFinalResult = false;
      if (callback) callback();
    });
  }
  
  onMicError() {
    this.isRecording = false;
    this.isWaitingForFinalResult = false;
    this.isLoading = false;
  }
}
