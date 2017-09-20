var Blockly = require("node-blockly/browser");

const PW_COLOUR = 275;

module.exports = {
  'planets': {
    init: function() {
      this.appendDummyInput().appendField('Planets');
      this.setColour(PW_COLOUR);
      this.setOutput(true, 'List');
    }
  },
  'expeditions': {
    init: function() {
      this.appendDummyInput().appendField('Expeditions');
      this.setColour(PW_COLOUR);
      this.setOutput(true, 'List');
    }
  },
  'players': {
    init: function() {
      this.appendDummyInput().appendField('Players');
      this.setColour(PW_COLOUR);
      this.setOutput(true, 'List');
    }
  },
  'player_name': {
    init: function() {
      this.appendDummyInput().appendField('Me');
      this.setColour(PW_COLOUR);
      this.setOutput(true, 'Player');
    }
  },
  'nobody': {
    init: function() {
      this.appendDummyInput().appendField('Nobody');
      this.setColour(PW_COLOUR);
      this.setOutput(true, 'Player');
    }
  }
};
