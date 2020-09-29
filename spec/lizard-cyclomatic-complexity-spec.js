'use babel';

/* eslint semi: ["error", "always"] */
/* eslint "comma-dangle": ["error", {
        "arrays": "ignore",
        "objects": "ignore",
        "imports": "ignore",
        "exports": "ignore",
        "functions": "ignore"
    }], */

import * as path from 'path';

var goodPath = path.join(__dirname, 'files', 'good.');
var badPath = path.join(__dirname, 'files', 'bad.');
var emptyPath = path.join(__dirname, 'files', 'empty.');

const { lint } = require('../lib/lizard-cyclomatic-complexity.js').provideLinter();

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

describe('The lizard tool can handle python files', () => {
  const goodPathPy = goodPath + 'py';
  const badPathPy = badPath + 'py';
  const emptyPathPy = emptyPath + 'py';

  beforeEach(async () => {
    await atom.packages.activatePackage('lizard-cyclomatic-complexity');
  });

  it('checks bad.py and reports the correct results', async () => {
    const editor = await atom.workspace.open(badPathPy);
    const messages = await lint(editor);

    expect(messages.length).toBe(1);

    expect(messages[0].severity).toBe('warning');
    expect(messages[0].excerpt).toBe('cyclomatic complexity too high for function bad_function');
    expect(messages[0].location.file).toBe(badPathPy);
    // expect(messages[0].location.position).toEqual([[0, 0], [0, 31]]);
    expect(messages[0].url).toBe('');
  });

  it('finds nothing wrong with an empty file', async () => {
    const editor = await atom.workspace.open(emptyPathPy);
    const messages = await lint(editor);
    expect(messages).toBe(null);
  });

  it('finds nothing wrong with a valid file', async () => {
    const editor = await atom.workspace.open(goodPathPy);
    const messages = await lint(editor);
    expect(messages.length).toBe(0);
  });
});

describe('The lizard tool can handle c files', () => {
  const goodPathC = goodPath + 'c';
  const badPathC = badPath + 'c';
  const emptyPathC = emptyPath + 'c';

  it('checks bad.c and reports the correct results', async () => {
    const editor = await atom.workspace.open(badPathC);
    const messages = await lint(editor);

    expect(messages.length).toBe(1);

    expect(messages[0].severity).toBe('warning');
    expect(messages[0].excerpt).toBe('cyclomatic complexity too high for function bad_function');
    expect(messages[0].location.file).toBe(badPathC);
    // expect(messages[0].location.position).toEqual([[0, 0], [0, 23]]);
    expect(messages[0].url).toBe('');
  });

  it('finds nothing wrong with an empty file', async () => {
    const editor = await atom.workspace.open(emptyPathC);
    const messages = await lint(editor);
    expect(messages).toBe(null);
  });

  it('finds nothing wrong with a valid file', async () => {
    const editor = await atom.workspace.open(goodPathC);
    const messages = await lint(editor);
    expect(messages.length).toBe(0);
  });
});
