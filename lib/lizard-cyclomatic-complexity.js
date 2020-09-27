'use babel';

import LizardCyclomaticComplexityView from './lizard-cyclomatic-complexity-view';
import { CompositeDisposable } from 'atom';

export default {

  lizardCyclomaticComplexityView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.lizardCyclomaticComplexityView = new LizardCyclomaticComplexityView(state.lizardCyclomaticComplexityViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.lizardCyclomaticComplexityView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'lizard-cyclomatic-complexity:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.lizardCyclomaticComplexityView.destroy();
  },

  serialize() {
    return {
      lizardCyclomaticComplexityViewState: this.lizardCyclomaticComplexityView.serialize()
    };
  },

  toggle() {
    console.log('LizardCyclomaticComplexity was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
