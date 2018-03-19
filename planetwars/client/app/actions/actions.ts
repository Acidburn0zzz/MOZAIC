import { IBotConfig } from '../utils/ConfigModels';
import { IMatchMetaData } from '../utils/GameModels';
import { INotification } from '../components/Navbar';

import { actionCreator, actionCreatorVoid } from './helpers';
// Nav
export const toggleNavMenu = actionCreatorVoid('TOGGLE_NAV_MENU');

// About
export const incrementAbout = actionCreatorVoid('TEST');

// Bots
export const addBot = actionCreator<IBotConfig>('ADD_BOT');
export const loadBot = actionCreator<IBotConfig>('LOAD_BOT');
export const removeBot = actionCreator<string>('REMOVE_BOT');
export const clearBots = actionCreatorVoid('CLEAR_BOTS');

// Matches
export const addMatchMeta = actionCreator<IMatchMetaData>('ADD_MATCH_META');
export const matchImportError = actionCreator<string>('MATCH_IMPORT_ERROR');
export const importMatchMeta = actionCreator<IMatchMetaData>('IMPORT_MATCH_META');

export const matchStarted = actionCreatorVoid('MATCH_STARTED');
export const matchFinished = actionCreatorVoid('MATCH_FINISHED');
export const matchCrashed = actionCreator<any>('MATCH_CHRASHED');

// DB
export const dbError = actionCreator<any>('DB_ERROR');
export const dbSync = actionCreator<any>('DB_SYNC');

// Notifications
export const addNotification = actionCreator<INotification>('ADD_NOTIFICATION');