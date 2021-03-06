import * as React from 'react';

import * as M from '../../database/models';
import Section from './Section';

import * as css from './PlayPage.scss';

export interface LocalBotSelectorProps {
  bots: M.BotList;
  onClick(id: M.BotId): void;
}

export class LocalBotSelector extends React.Component<LocalBotSelectorProps> {
  public render() {
    const { bots, onClick } = this.props;

    const botElements = Object.keys(bots).map((id, i) => {
      const { name, command, uuid } = bots[id];
      return (
        <li key={i} className={css.localBot}>
          <div className={css.botInfo}>
            <p>{name}</p>
            <p className={css.botCommand}>{command}</p>
          </div>
          <div className={css.botAdder}>
            <button
              className={'button is-success is-outlined is-rounded'}
              // tslint:disable-next-line:jsx-no-lambda
              onClick={() => onClick(uuid)}
            >
              +
            </button>
          </div>
        </li >
      );
    });

    return (
      <Section header={"Local Bots"} >
        <ul className={css.localBotSelector}>
          {botElements}
        </ul>
      </Section>
    );
  }
}
