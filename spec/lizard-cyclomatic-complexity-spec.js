'use babel';

import * as path from 'path';

const { lint } = require('../lib/lizard-cyclomatic-complexity.js').provideLinter();

const basePath = path.join(__dirname, 'files');

function CheckFileExtension(pathToTestFolder, language, fileEnding, badFunctionName) {
  describe(`The lizard tool can handle ${language} files`, () => {
    const goodPath = path.join(pathToTestFolder, language, 'good.') + fileEnding;
    const badPath = path.join(pathToTestFolder, language, 'bad.') + fileEnding;
    const emptyPath = path.join(pathToTestFolder, language, 'empty.') + fileEnding;

    beforeEach(async () => {
      await atom.packages.activatePackage('lizard-cyclomatic-complexity');

      // set the value for cyclomatic complexity threshold very low in order
      // to have smaller test files (e.g. bad.py)
      atom.config.set('lizard-cyclomatic-complexity.thresholdCyclomaticComplexity', '2');
    });

    it(`checks bad.${fileEnding} and reports the correct results`, async () => {
      const editor = await atom.workspace.open(badPath);
      const messages = await lint(editor);

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('warning');
      expect(messages[0].excerpt).toBe(`cyclomatic complexity of 3 is too high for function ${badFunctionName}`);
      expect(messages[0].location.file).toBe(badPath);
      // expect(messages[0].location.position).toEqual([[0, 0], [0, 23]]);
      expect(messages[0].url).toBe('');
    });

    it(`finds nothing wrong with an empty.${fileEnding} file`, async () => {
      const editor = await atom.workspace.open(emptyPath);
      const messages = await lint(editor);
      expect(messages).toBe(null);
    });

    it(`finds nothing wrong with good.${fileEnding} file`, async () => {
      const editor = await atom.workspace.open(goodPath);
      const messages = await lint(editor);
      expect(messages.length).toBe(0);
    });
  });
}

describe('The lizard provider for Linter', () => {
  beforeEach(async () => {
    await atom.packages.activatePackage('lizard-cyclomatic-complexity');
  });

  it('should be in the packages list', () => {
    expect(atom.packages.isPackageLoaded('lizard-cyclomatic-complexity')).toBe(true);
  });

  it('should be an active package', () => {
    expect(atom.packages.isPackageActive('lizard-cyclomatic-complexity')).toBe(true);
  });
});

CheckFileExtension(basePath, 'c', 'c', 'bad_function');
CheckFileExtension(basePath, 'c', 'h', 'bad_function');
CheckFileExtension(basePath, 'cpp', 'cpp', 'bad_function');
CheckFileExtension(basePath, 'java', 'java', 'TestClass::bad_function');
CheckFileExtension(basePath, 'CSharp', 'cs', 'bad_function');
CheckFileExtension(basePath, 'JavaScript', 'js', 'bad_function');
CheckFileExtension(basePath, 'ObjectiveC', 'm', 'bad_function');
CheckFileExtension(basePath, 'swift', 'swift', 'bad_function');
CheckFileExtension(basePath, 'python', 'py', 'bad_function');
CheckFileExtension(basePath, 'ruby', 'rb', 'bad_function');
CheckFileExtension(basePath, 'php', 'php', 'bad_function');
CheckFileExtension(basePath, 'scala', 'scala', 'bad_function');
CheckFileExtension(basePath, 'GDScript', 'gd', 'bad_function');
CheckFileExtension(basePath, 'GoLang', 'go', 'bad_function');
CheckFileExtension(basePath, 'lua', 'lua', 'bad_function');
CheckFileExtension(basePath, 'rust', 'rs', 'bad_function');
