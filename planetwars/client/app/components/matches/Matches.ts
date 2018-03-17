import * as React from 'react';
import { Component } from 'react';
import { div, h, li, span, ul, p, button, input, form, label } from 'react-hyperscript-helpers';
import { IMatchMetaData } from '../../utils/GameModels';
import * as moment from 'moment';
import * as classnames from 'classnames';
import * as VisualizerComponent from '../visualizer';


const styles = require('./Matches.scss');

// tslint:disable-next-line:interface-over-type-literal
type AnnotatedMatch = { id: number, match: IMatchMetaData };
type LogLoader = (paths: FileList) => void;

interface IMatchViewerProps {
  expandedGameId: number;
  matches: AnnotatedMatch[];
  loadLogs: LogLoader;
  importError: string;
}

interface IMatchViewerState {
  // use index as id, for now
  selectedMatch: number,
}

export default class MatchViewer extends Component<IMatchViewerProps, IMatchViewerState> {
  constructor(props: IMatchViewerProps) {
    super(props)
    this.state = { selectedMatch: 0 };
  }

  select(idx: number) {
    this.setState({ selectedMatch: idx });
  }

  public render() {
    const { loadLogs, importError, matches } = this.props;
    // TODO: Error handling sucks, will get overridden on new problem;
    if (importError) { alert(importError); }
    if (matches.length === 0) { return h(NoMatches, { loadLogs }); }

    return div({ className: styles.matchViewer }, [
      h(MatchList, {
        matches,
        selected: this.state.selectedMatch,
        selectFn: this.select.bind(this),
      }),
      div("placeholder")
    ]);
  }
}

interface IMatchListProps {
  matches: AnnotatedMatch[],
  selected: number,
  selectFn: (index: number) => void,
}

export class MatchList extends Component<IMatchListProps> {
  public render() {
    const matches = this.props.matches.map((match, idx) =>
      li([
        h(MatchListEntry, {
          match,
          selected: idx == this.props.selected,
          onClick: () => this.props.selectFn(idx),
        }),
      ]),
    );
    return ul(`.${styles.matchList}`, matches);
  }
}

interface IMatchEntryProps {
  match: AnnotatedMatch,
  selected: boolean,
  onClick: () => void,
}

// tslint:disable-next-line:variable-name
export class MatchListEntry extends Component<IMatchEntryProps> {
  className() : string {
    if (this.props.selected) {
      return classnames(styles.matchListEntry, styles.selected);
    } else {
      return styles.matchListEntry;
    }
  }

  playerList() {
    const { stats, players } = this.props.match.match;
    return ul({ className: styles.playerList }, players.map((p, idx) => {
      let className;
      if (stats.winner == idx + 1) {
        className = styles.winner;
      } else {
        className = styles.loser;
      }
      return li({ className }, p);
    }));
  }

  mapName() {
    // placeholder until we have actual map information
    const mapName = "mycoolmap23"; 
    return span(mapName);
  }

  render() {
    let attrs = {
      className: this.className(),
      onClick: this.props.onClick,
    };

    return div(attrs, [
      div({ className: styles.inner }, [
        this.playerList(),
        this.mapName(),
      ])
    ]);
  }
}

export class MatchDetails extends React.Component<{}, {}> {
  public render() {
    return div(`.${styles.matchDetailsPane}`, ['No details yet!']);
  }
}

// tslint:disable-next-line:variable-name
export const NoMatches: React.SFC<{ loadLogs: LogLoader }> = (props) => {
  return div(`.${styles.noMatches}`, [
    h(MatchImporter, props),
    p(['No matches played yet!']),
  ]);
};

// TODO: Support loading multiple files
export class MatchImporter extends React.Component<{ loadLogs: LogLoader }> {
  private fileInput: FileList;

  public render() {
    return form(`.${styles.matchImporter}`,
      { onSubmit: (evt: any) => this.handleSubmit(evt) },
      [
        label(['Import Match(es)']),
        input({
          type: 'file',
          multiple: true,
          onChange: (evt: any) => this.handleChange(evt),
        }),
        button({ type: 'submit' }, ['Import']),
      ]
    );
  }

  private handleChange(evt: any): void {
    this.fileInput = evt.target.files;
  }

  private handleSubmit(event: any) {
    this.props.loadLogs(this.fileInput);
  }
}
