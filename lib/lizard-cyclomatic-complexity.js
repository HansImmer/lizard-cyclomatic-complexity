'use babel';

import LizardCyclomaticComplexityView from './lizard-cyclomatic-complexity-view';
import {CompositeDisposable, Disposable} from 'atom';

export default {

  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable(
      // Add an opener for our view.
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://lizard-cyclomatic-complexity') {
          return new LizardCyclomaticComplexityView();
        }
      }),

      // Register command that toggles this view
      atom.commands.add('atom-workspace', {
        'lizard-cyclomatic-complexity:toggle': () => this.toggle()
      }),

      // Destroy any ActiveEditorInfoViews when the package is deactivated.
      new Disposable(() => {
        atom.workspace.getPaneItems().forEach(item => {
          if (item instanceof LizardCyclomaticComplexityView) {
            item.destroy();
          }
        });
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  toggle() 
  {
    console.log("Toggle view")
    atom.workspace.toggle('atom://lizard-cyclomatic-complexity');
  },

  deserializeActiveEditorInfoView(serialized)
  {
    return new LizardCyclomaticComplexityView();
  }

};
