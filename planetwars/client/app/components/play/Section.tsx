import * as React from 'react';

// tslint:disable-next-line:no-var-requires
const styles = require('./PlayPage.scss');

export default class Section extends React.Component<{ header: string, onMouseMove?: () => void; }> {
  public render() {
    return (
      <div className={styles.sectionWithHeader} onMouseMove={this.props.onMouseMove}>
        <div className={styles.sectionHeader}>
          <h1>{this.props.header}</h1>
        </div>
        <div className={styles.verticalGrowAndScroll}>
          {this.props.children}
        </div>
      </div>
    );
  }
}