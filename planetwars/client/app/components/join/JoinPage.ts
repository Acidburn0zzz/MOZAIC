import { connect } from 'react-redux';
import * as crypto from 'crypto';

import * as A from '../../actions';
import * as M from '../../database/models';
import { GState } from '../../reducers';
import { Importer } from '../../utils/Importer';
import { Join, JoinDispatchProps, JoinState, JoinStateProps } from './Join';
import { v4 as uuidv4 } from 'uuid';


const mapStateToProps = (state: GState) => {
  return {
    allBots: state.bots,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    joinMatch: (address: M.Address, bot: M.InternalBotSlot) => {
      const matchId = uuidv4();
      dispatch(A.joinMatch({
        matchId,
        address,
        token: bot.token,
        name: bot.name,
        botId: bot.botId,
        clientid: bot.clientid,
      }));
    },
  };
};

export default connect<JoinStateProps, JoinDispatchProps>(mapStateToProps, mapDispatchToProps)(Join);
