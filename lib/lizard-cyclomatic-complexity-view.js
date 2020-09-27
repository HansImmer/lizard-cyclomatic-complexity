'use babel';

export default class ActiveEditorInfoView {

  constructor(serializedState)
  {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('active-editor-info');

    // Create message element
    const message = document.createElement('div');
    message.textContent = 'The ActiveEditorInfo package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);

    this.subscriptions = atom.workspace.getCenter().observeActivePaneItem(item => {
      if (!atom.workspace.isTextEditor(item)) return;
      message.innerHTML = `
        <h2>${item.getFileName() || 'untitled'}</h2>
        <ul>
          <li><b>Soft Wrap:</b> ${item.softWrapped}</li>
          <li><b>Tab Length:</b> ${item.getTabLength()}</li>
          <li><b>Encoding:</b> ${item.getEncoding()}</li>
          <li><b>Line Count:</b> ${item.getLineCount()}</li>
        </ul>
      `;
    });

    var editorFilePath = atom.workspace.getActiveTextEditor().getPath();
    var editorFileName = editorFilePath.split('\\').pop().split('/').pop();
    var editorFileExtension = editorFileName.split('\.').pop();

    console.log("editorFilePath " + editorFilePath);
    console.log("editorFileName" + editorFileName);
    console.log("editorFileExtension" + editorFileExtension);

    if(editorFileExtension=="py")
    {
      const { exec } = require("child_process");

      exec("lizard " + editorFilePath, (error, stdout, stderr) => {
          if (error) {
              console.log(`error: ${error.message}`);
              return;
          }
          if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
          }
          console.log(`stdout: ${stdout}`);
      });
    }
  }

  getTitle() {
    // Used by Atom for tab text
    return 'Active Editor Info';
  }

  getDefaultLocation() {
    // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
    // Valid values are "left", "right", "bottom", and "center" (the default).
    return 'right';
  }

  getAllowedLocations() {
    // The locations into which the item can be moved.
    return ['left', 'right', 'bottom'];
  }

  getURI() {
    // Used by Atom to identify the view when toggling.
    return 'atom://lizard-cyclomatic-complexity'
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {
      deserializer: 'active-editor-info/ActiveEditorInfoView'
    };
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
    this.subscriptions.dispose();
  }

  getElement() {
    return this.element;
  }

}
