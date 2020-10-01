'use babel';

/* eslint semi: ["error", "always"] */
/* eslint "comma-dangle": ["error", {
        "arrays": "ignore",
        "objects": "ignore",
        "imports": "ignore",
        "exports": "ignore",
        "functions": "ignore"
    }], */

import {
  CompositeDisposable
} from 'atom';

const lazyReq = require('lazy-req')(require);
const {
  exec,
  generateRange
} = lazyReq('atom-linter')('exec', 'generateRange');

export default {
  subscriptions: null,

  activate (state) {
    // require('atom-package-deps').install('lizard-cyclomatic-complexity');
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.config.observe('lizard-cyclomatic-complexity.thresholdCyclomaticComplexity', (value) => {
      this.thresholdCyclomaticComplexity = value;
    }));

    this.subscriptions.add(atom.config.observe('lizard-cyclomatic-complexity.thresholdNumberOfParameters', (value) => {
      this.thresholdNumberOfParameters = value;
    }));

    this.subscriptions.add(atom.config.observe('lizard-cyclomatic-complexity.thresholdlinesOfCodeWithoutComments', (value) => {
      this.thresholdlinesOfCodeWithoutComments = value;
    }));

    this.subscriptions.add(atom.config.observe('lizard-cyclomatic-complexity.thresholdNumberOfTokens', (value) => {
      this.thresholdNumberOfTokens = value;
    }));
  },

  deactivate () {
    this.subscriptions.dispose();
  },

  provideLinter () {
    return {
      name: 'Lizard',
      scope: 'file',
      lintsOnChange: false,
      grammarScopes: ['source.c', 'source.h', 'source.cpp', 'source.java', 'source.cs', 'source.js', 'source.m', 'source.objc', 'source.objcpp', 'source.swift', 'source.python', 'source.python.django', 'source.ruby', 'text.html.php', 'source.php', 'source.scala', 'source.go', 'source.lua', 'source.rust'],
      lint: async (editor) => {
        const textEditor = editor;
        const fileText = textEditor.getText();
        var editorFilePath = textEditor.getPath();
        var editorFileName = editorFilePath.split('\\').pop().split('/').pop();
        var editorFileExtension = editorFileName.split('.').pop();
        const args = [editorFilePath];

        console.log('editorFilePath ' + editorFilePath);
        console.log('editorFileName' + editorFileName);
        console.log('editorFileExtension' + editorFileExtension);

        const stdout = await exec('lizard', args);

        // NOTE: Providers should also return null if they get null from exec
        // Returning null from provider will tell base linter to keep existing messages
        if (stdout === null) {
          return null;
        }

        // process data
        console.log(stdout);
        if (editor.getText() !== fileText) {
          // Editor text was modified since the lint was triggered, tell Linter not to update
          return null;
        }

        // Get the relevant part of stdout containing the function analysis.
        var regex = /-+(.*)1 file analyzed/gms;

        var m;
        m = regex.exec(stdout);

        let analyzedfunctionsString = m[1];
        analyzedfunctionsString = analyzedfunctionsString.trim().split('\n');

        const toReturn = [];

        // loop through all functions
        for (var line of analyzedfunctionsString) {
          regex = /\s?(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+) (.*)@(\d+)-\d+@/gm;
          m = regex.exec(line);

          if (m === null) {
            return null;
          }

          const linesOfCodeWithoutComments = parseInt(m[1]);
          const cyclomaticComplexity = parseInt(m[2]);
          const tokenCount = parseInt(m[3]);
          const numOfParameters = parseInt(m[4]);
          const functionName = m[6];
          const lineNumberInEditor = parseInt(m[7]) - 1;

          var message;
          var position;

          if ((cyclomaticComplexity > this.thresholdCyclomaticComplexity) ||
            (numOfParameters > this.thresholdNumberOfParameters) ||
            (linesOfCodeWithoutComments > this.thresholdlinesOfCodeWithoutComments) ||
            (tokenCount > this.thresholdNumberOfTokens)) {
            // safety check if the opened file has changed.
            if (textEditor.getLineCount() < lineNumberInEditor) {
              return null;
            }
            position = generateRange(textEditor, lineNumberInEditor);

            message = {
              severity: 'warning',
              location: {
                file: textEditor.getPath(),
                position
              },
              url: ''
            };
          }

          if (cyclomaticComplexity > this.thresholdCyclomaticComplexity) {
            message.excerpt = 'cyclomatic complexity too high for function ' + functionName;
            toReturn.push(message);
          }

          if (numOfParameters > this.thresholdNumberOfParameters) {
            message.excerpt = 'Too many parameters for function ' + functionName;
            toReturn.push(message);
          }

          if (linesOfCodeWithoutComments > this.thresholdlinesOfCodeWithoutComments) {
            message.excerpt = 'Too many lines of code in function ' + functionName;
            toReturn.push(message);
          }

          if (tokenCount > this.thresholdNumberOfTokens) {
            message.excerpt = 'Too many tokens in function ' + functionName;
            toReturn.push(message);
          }
        } // loop through all functions
        return toReturn;
      },
    };
  },
};
