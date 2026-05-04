import React, {useState} from 'react';

import '../../resources/styles/FormDefault.css';

import {
    MESSAGE_RECOVERY_PROMPT,
    MESSAGE_REGISTER_PROMPT,
    NAVIGATE_RECOVERY,
    NAVIGATE_REGISTER,
    RenderLink
} from '../../util/NavigationUtils';
import ValidationUtils from "../../util/ValidationUtils";
import {assetUrl} from "../../util/AssetUrl.js";

const logo = assetUrl('favicon.svg');

const LoginForm = ({onLogin, loginError, onNavigate}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        if (ValidationUtils.isLoginDataValid(username, password)) {
            const loginData = {
                email: username,
                password: password,
            };
            onLogin(loginData);
        } else {
            console.log("Invalid login data criteria.");
        }
    };

    return (
        <div className="div-major" data-e2e="login-root" data-testid="login-root">
            <img src={logo} className="App-logo" alt="logo" data-e2e="app-logo"/>

            <h1 data-e2e="login-heading">Login</h1>

            <form className="form-major" data-e2e="login-form" data-testid="login-form" onSubmit={handleLogin}>
                <label className="label-default" htmlFor="username-input">
                    Username or email:
                </label>
                <div className="input-container">
                    <input
                        id="username-input"
                        name="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder=" "
                        className="input-default"
                        data-testid="input-username"
                        data-e2e="input-username"
                        aria-label="Username or email"
                        required
                    />
                    {!ValidationUtils.isEmailValid(username) && !ValidationUtils.isLoginValid(username) && username !== '' && (
                        <span
                            className="span-alert"
                            role="alert"
                            data-e2e="username-error"
                            data-testid="username-error"
                        >
                            Please enter a valid email address or username.
                        </span>
                    )}
                </div>

                <label className="label-default" htmlFor="login-password-input">
                    Password:
                </label>
                <div className="input-container">
                    <input
                        id="login-password-input"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=" "
                        className="input-default"
                        data-testid="input-password"
                        data-e2e="input-password"
                        aria-label="Password"
                        required
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        data-e2e="password-toggle"
                        data-testid="password-toggle"
                    >
                        <svg>
                            <use href={`icons.svg#${showPassword ? 'eye-closed' : 'eye-open'}`}/>
                        </svg>
                    </button>
                    {!ValidationUtils.isStrongPassword(password) && password !== '' && (
                        <span
                            className="span-alert"
                            role="alert"
                            data-e2e="password-error"
                            data-testid="password-error"
                        >
                            The password must contain at least 8 characters, numbers and letters.
                        </span>
                    )}
                </div>

                {loginError && (
                    <p className="login-error" role="alert" data-e2e="login-error" data-testid="login-error">
                        Wrong username or password
                    </p>
                )}

                <button
                    type="submit"
                    className="button-registration"
                    data-e2e="submit-login"
                    data-testid="submit-login"
                >
                    Login
                </button>
            </form>

            <p>
                <span data-e2e="register-prompt">
                    {MESSAGE_REGISTER_PROMPT} <RenderLink text="Create account" page={NAVIGATE_REGISTER}
                                                          onNavigate={onNavigate}/>
                </span>
            </p>
            <p>
                <span data-e2e="recovery-prompt">
                    {MESSAGE_RECOVERY_PROMPT} <RenderLink text="Restore it" page={NAVIGATE_RECOVERY}
                                                          onNavigate={onNavigate}/>
                </span>
            </p>
        </div>
    );
};

export default LoginForm;
