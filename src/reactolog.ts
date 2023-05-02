/*********************************
 File:       reactolog.js
 Function:   Does Reactotron logging
 Copyright:  Bertco LLC
 Date:       2020-02-14
 Author:     mkahn
 **********************************/

import Reactotron from 'reactotron-react-native';
import {Message, ReactotronInstance} from './types';

let reactotronInstance: ReactotronInstance | undefined;

export const log = (message: Message | Error) => {
    if (reactotronInstance !== undefined) {
        reactotronInstance.log!(message);
    }
};

export const logImportant = (message: Message) => {
    if (reactotronInstance !== undefined) {
        reactotronInstance.logImportant!(message);
    }
};

export const display = (message: Message) => {
    if (reactotronInstance !== undefined) {
        reactotronInstance.display(message);
    }
};

// Pass in the configured reference
export const setReactotronInstance = (instance: typeof Reactotron | undefined) => reactotronInstance = instance;
