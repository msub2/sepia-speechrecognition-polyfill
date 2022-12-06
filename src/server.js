//--- Server ---

export var serverSettings = {
  serverUrl: "http://localhost:20741",//location.href.replace(/(.*)\/www\/(.*?.html|)$/, "$1"),
  clientId: "any",
  accessToken: "test1234"
}
export var asrOptions = {
  //common options (usually supported by all engines):
  language: "en-US",
  task: "",
  model: "",
  continuous: true,
  optimizeFinalResult: true,
  messageFormat: "default", 	// "webSpeechApi" seems to mess with results, keep on default
  //engine specific options:
  engineOptions: {}
};
export var phrases = [];
export var hotWords = [];

var asrEngine = "";
var availableFeatures = {};
var availableLanguages = [];
var availableModels = {};

var suggestedSettings;

export function handleServerSettings(settings) {
  console.log("INFO - Server version: " + settings.version);
  console.log("INFO - Active engine: " + settings.engine);
  asrEngine = settings.engine;
  console.log("INFO - Available ASR languages: " + JSON.stringify(settings.languages, null, 2));
  asrOptions.language = settings.languages[0];
  availableLanguages = settings.languages;
  console.log("INFO - Available ASR models: " + JSON.stringify(settings.models, null, 2));
  asrOptions.model = settings.models[0];
  console.log("INFO - ASR model properties: " + JSON.stringify(settings.modelProperties, null, 2));
  settings.models.forEach(function(m, i) {
    availableModels[m] = settings.modelProperties[i];
    availableModels[m].language = settings.languages[i];
    if (!availableModels[m].engine) availableModels[m].engine = asrEngine; //if it's not dynamic it has to be default
  });
  console.log("INFO - Available ASR features: " + JSON.stringify(settings.features, null, 2));
  if (Array.isArray(settings.features)) {
    availableFeatures[asrEngine] = settings.features;	//fixed engine
  } else {
    availableFeatures = settings.features;	//dynamic engine
  }
  if (!suggestedSettings) {
    suggestedSettings = {};
    //find the best language fit
    let lang = navigator.language;
    let foundI;
    if (lang && settings.languages && settings.models) {
      let li = settings.languages.indexOf(lang);
      if (li >= 0) {
        foundI = li;
      } else {
        let langShort = lang.substring(0, 2);
        for (let i=0; i<settings.languages.length; i++) {
          if (settings.languages[i].indexOf(langShort) == 0) {
            foundI = i;
            break;
          }
        }
      }	
    }
    if (foundI != undefined) {
      asrOptions.language = settings.languages[foundI];
      asrOptions.model = settings.models[foundI];
    }
    console.log("INFO - Default language/model: " + asrOptions.language + "/" + asrOptions.model 
      + " - NOTE: If you set 'language' via settings make sure to remove 'model'!");
  }
}

export function getServerInfo() {
  console.log("INFO - Loading server settings...");
  var controller = new AbortController();
  setTimeout(function() {controller.abort();}, 8000);
  fetch(serverSettings.serverUrl + "/settings", {
    method: "GET",
    signal: controller.signal
  }).then(function(res) {
    if (res.ok) {
      return res.json();
    } else {
      throw {"name": "FetchError", "message": res.statusText, "code": res.status};
    }
  }).then(function(json) {
    console.log("Server Info", json);
    if (json && json.settings) {
      handleServerSettings(json.settings);
    }
  }).catch(function(err) {
    console.error("Server Info Fetch ERROR", err);
  });
}