'use babel';

/* eslint semi: ["error", "always"] */
/* eslint "comma-dangle": ["error", {
        "arrays": "ignore",
        "objects": "ignore",
        "imports": "ignore",
        "exports": "ignore",
        "functions": "ignore"
    }], */

import { CompositeDisposable } from 'atom';

const lazyReq = require('lazy-req')(require);
const { exec, generateRange } = lazyReq('atom-linter')('exec', 'generateRange');

export default {
  subscriptions: null,

  activate (state) {
    // require('atom-package-deps').install('lizard-cyclomatic-complexity');
    this.subscriptions = new CompositeDisposable();
  },

  deactivate () {
    this.subscriptions.dispose();
  },

  provideLinter () {
    return {
      name: 'Lizard',
      scope: 'file',
      lintsOnChange: false,
      grammarScopes: ['source.python', 'source.python.django'],
      lint: async (editor) => {
        const fileText = editor.getText();
        var editorFilePath = atom.workspace.getActiveTextEditor().getPath();
        var editorFileName = editorFilePath.split('\\').pop().split('/').pop();
        var editorFileExtension = editorFileName.split('\.').pop();

        console.log('editorFilePath ' + editorFilePath);
        console.log('editorFileName' + editorFileName);
        console.log('editorFileExtension' + editorFileExtension);

        const args = [editorFilePath];

        const data = await exec('lizard', args);

        // NOTE: Providers should also return null if they get null from exec
        // Returning null from provider will tell base linter to keep existing messages
        if (data === null) {
          return null;
        }

        // process data
        console.log(data);
        const stdout = data;
        if (editor.getText() !== fileText) {
          // Editor text was modified since the lint was triggered, tell Linter not to update
          return null;
        }

        var regex = /-+(.*)1 file analyzed/gms;

        var m;
        m = regex.exec(stdout);
        let analyzedfunctionsString = m[1];
        analyzedfunctionsString = analyzedfunctionsString.trim().split('\n');

        const toReturn = [];

        for (var line of analyzedfunctionsString) {
          regex = /\s?(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+) (.*)@(\d+)-\d+@/gm;
          m = regex.exec(line);

          var linesOfCodeWithoutComments = m[1];
          var cyclomaticComplexity = m[2];
          var tokenCount = m[3];
          var numOfParameters = m[4];
          var functionLength = m[5];
          var functionName = m[6];
          var lineNumberInEditor = m[7];

          if (cyclomaticComplexity > 2) {
            console.log(line);
            console.log(`linesOfCodeWithoutComments ${linesOfCodeWithoutComments}, cyclomaticComplexity ${cyclomaticComplexity}, tokenCount ${tokenCount}, numOfParameters ${numOfParameters}, lineNumberInEditor ${lineNumberInEditor}, functionLength ${functionLength}, functionName ${functionName}`);

            const position = generateRange(editor, lineNumberInEditor);
            const message = {
              severity: 'warning',
              excerpt: 'cyclomatic complexity too high for function ' + functionName,
              location: { file: editor.getPath(), position },
              url: '',
            };
            toReturn.push(message);
          }
        }
        console.log(toReturn);

        return toReturn;
      },
    };
  },
};
