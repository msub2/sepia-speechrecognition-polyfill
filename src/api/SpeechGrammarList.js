import { SpeechGrammar } from "./SpeechGrammar.js";

/**
 * Represents a list of SpeechGrammar objects containing words or patterns of words 
 * that we want the recognition service to recognize. Grammar is defined using JSpeech Grammar Format (JSGF).
 * Other formats may also be supported in the future.
 */
export class SpeechGrammarList {
  /** Internal list of SpeechGrammar objects */
  #list = [];

  /** Allows individual SpeechGrammar objects to be retrieved from the SpeechGrammarList using array syntax. */
  #item(index) {
    return this.#list[index];
  }
  
  /** Returns the number of SpeechGrammar objects contained in the SpeechGrammarList. */
  length = 0;
  
  constructor() {
    // Use a Proxy to more closely match the interface of SpeechGrammarList.
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop === 'addFromString' || prop === 'addFromURI') {
          return function() {
            return target[prop].apply(target, arguments);
          }
        } else if (typeof +prop === 'number') {
          return target.#item(prop);
        } else if (prop === 'length') {
          return target.#list.length;
        }
      }
    });
  }

  /**
   * Takes a grammar present at a specific URI and adds it to the SpeechGrammarList as a new SpeechGrammar object. 
   * @param {String} src The URI to fetch the grammar from.
   * @param {Number} weight The weight to assign to the newly created SpeechGrammar object. Default is 1.
   */
  addFromURI = (src, weight = 1) => {
    const grammar = new SpeechGrammar();
    fetch(src).then(res => {
      res.text().then(text => {
        grammar.src = text;
        grammar.weight = weight;
        this.#list.push(grammar);
      });
    }).catch(err => {
      console.log('Failed to add SpeechGrammar from URI: ', err);
    });
  }

  /**
   * Takes a grammar present in a specific string and adds it to the SpeechGrammarList as a new SpeechGrammar object. 
   * @param {String} string The string containing the grammar.
   * @param {Number} weight The weight to assign to the newly created SpeechGrammar object. Default is 1.
   */
  addFromString = (string, weight = 1) => {
    const grammar = new SpeechGrammar();
    grammar.src = string;
    grammar.weight = weight;
    this.#list.push(grammar);
  }
}