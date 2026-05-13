import React from 'react';

import {
    MESSAGE_HEADER_CONFIRMATION,
    MESSAGE_LOGIN_PROMPT,
    NAVIGATE_LOGIN,
    RenderLink
} from '../../util/NavigationUtils';

import '../../resources/styles/FormDefault.css';

import {assetUrl} from "../../util/AssetUrl.js";

const logo = assetUrl('favicon.svg');

/**
 * ConfirmationInfo is a functional React component that renders a confirmation interface.
 * It is used to display a header message along with prompts for account creation
 * or account recovery. The component includes navigation links that invoke the
 * provided navigation handler.
 *
 * @param {Object} props - The properties object.
 * @param {Function} props.onNavigate - Function to handle navigation events when links are clicked.
 * @returns {JSX.Element} A React component rendering a confirmation message and navigation options.
 */
const ConfirmationInfo = ({onNavigate}) => {

    return (
        <div className={'div-major'} data-e2e="confirmation-info-page">
            <img src={logo} className="App-logo" alt="logo" data-e2e="app-logo"/>
            <h1 data-e2e="confirmation-heading">{MESSAGE_HEADER_CONFIRMATION}</h1>
            <p data-e2e="login-prompt-wrapper">
                {MESSAGE_LOGIN_PROMPT} <RenderLink text="Go to login page" page={NAVIGATE_LOGIN}
                                                   onNavigate={onNavigate}/>.
            </p>
        </div>
    );
};

export default ConfirmationInfo;
