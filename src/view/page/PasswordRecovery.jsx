import React, {useState} from 'react';
import '../../resources/styles/FormDefault.css';

import {
    ERROR_INVALID_EMAIL,
    MESSAGE_LOGIN_PROMPT,
    MESSAGE_RECOVERY_SUCCESS,
    MESSAGE_REGISTER_PROMPT,
    NAVIGATE_LOGIN,
    NAVIGATE_REGISTER,
    RenderLink
} from '../../util/NavigationUtils';
import ResetPasswordRequest from "../../api/password/ResetPasswordRequest";
import ValidationUtils from '../../util/ValidationUtils';
import {assetUrl} from "../../util/AssetUrl.js";

const logo = assetUrl('favicon.svg');

const PasswordRecovery = ({onNavigate}) => {
    const [email, setEmail] = useState('');
    const [isRecoveryRequested, setRecoveryRequested] = useState(false);

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        ValidationUtils.isEmailValid(newEmail);
    };

    const handleRecoveryRequest = () => {
        if (ValidationUtils.isEmailValid(email)) {
            ResetPasswordRequest(email)
                .then(result => {
                    if (result.success) {
                        setRecoveryRequested(true);
                    }
                })
                .catch(error => {
                    console.error("Password reset request failed:", error);
                    alert("Failed to send recovery link. Please try again.");
                });
        } else {
            alert(ERROR_INVALID_EMAIL + email);
        }
    };

    return (
        <div className="div-major" data-e2e="password-recovery-root">
            <img src={logo} className="App-logo" alt="logo" data-e2e="app-logo"/>

            {isRecoveryRequested ? (
                <div className="recovery-success" data-e2e="recovery-success">
                    <h1 data-e2e="recovery-heading">Password recovery</h1>
                    <p data-e2e="recovery-message">{MESSAGE_RECOVERY_SUCCESS}</p>
                </div>
            ) : (
                <form className="form-major" data-e2e="recovery-form" onSubmit={(e) => {
                    e.preventDefault();
                    handleRecoveryRequest();
                }}>
                    <h1 data-e2e="recovery-heading">Password recovery</h1>

                    <label className="label-default" htmlFor="recovery-email-input">
                        Email:
                        <div className="input-container">
                            <input
                                id="recovery-email-input"
                                name="email"
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder=" "
                                className="input-default"
                                data-testid="input-recovery-email"
                                data-e2e="input-recovery-email"
                                required
                            />
                            {!ValidationUtils.isEmailValid(email) && email !== '' && (
                                <span
                                    className="span-alert"
                                    role="alert"
                                    data-e2e="recovery-email-error"
                                    data-testid="recovery-email-error"
                                >
                  Please enter a valid email address.
                </span>
                            )}
                        </div>
                    </label>

                    <button
                        type="button"
                        onClick={handleRecoveryRequest}
                        className="button-registration"
                        data-e2e="recovery-submit"
                        data-testid="recovery-submit"
                    >
                        Reset password
                    </button>

                    <p>
            <span data-e2e="link-login-wrapper">
              {MESSAGE_LOGIN_PROMPT} <RenderLink text="Login" page={NAVIGATE_LOGIN} onNavigate={onNavigate}/>
            </span>
                    </p>

                    <p>
            <span data-e2e="link-register-wrapper">
              {MESSAGE_REGISTER_PROMPT} <RenderLink text="Create account" page={NAVIGATE_REGISTER}
                                                    onNavigate={onNavigate}/>
            </span>
                    </p>
                </form>
            )}
        </div>
    );
};

export default PasswordRecovery;
