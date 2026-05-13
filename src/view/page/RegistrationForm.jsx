import React, {useState} from 'react';

import '../../resources/styles/FormDefault.css';

import {
    MESSAGE_LOGIN_PROMPT,
    MESSAGE_RECOVERY_PROMPT,
    NAVIGATE_LOGIN,
    NAVIGATE_RECOVERY,
    RenderLink
} from '../../util/NavigationUtils';
import ValidationUtils from '../../util/ValidationUtils';
import NationalityFetchData from '../../api/components/geters/NationalityFetchData.jsx';
import GenderFetchData from '../../api/components/geters/GenderFetchData.jsx';
import {assetUrl} from "../../util/AssetUrl.js";

const logo = assetUrl('favicon.svg');

const RegistrationForm = ({onRegister, onNavigate}) => {
    const [login, setLogin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [birthdate, setBirthdate] = useState('2000-01-01');
    const [nationality, setNationality] = useState('');
    const [gender, setGender] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleNationality = (nationality) => {
        setNationality(nationality);
    };
    const handleGender = (gender) => {
        setGender(gender);
    };

    const handleRegister = () => {
        if (ValidationUtils.isRegistrationDataValid(login, email, password, confirmPassword, birthdate, nationality, gender)) {
            const userObject = {
                login,
                email,
                password,
                birthdate,
                nationality,
                gender,
            };
            onRegister(userObject);
        } else {
            alert("Fields wasn't correct filled!");
        }
    };

    return (
        <div className="div-major" data-e2e="registration-root" data-testid="registration-root">
            <img src={logo} className="App-logo" alt="logo" data-e2e="app-logo"/>
            <h1 data-e2e="registration-heading">Registration form</h1>

            <form
                className="form-major"
                data-e2e="registration-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleRegister();
                }}
            >
                <label className="label-default">
                    Your login:
                    <div className="input-container">
                        <input
                            id="login-input"
                            name="login"
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            pattern="[A-Za-z0-9\-]{3,45}"
                            required
                            placeholder=" "
                            className="input-default"
                            data-testid="input-login"
                            data-e2e="input-login"
                        />
                        {!ValidationUtils.isLoginValid(login) && login !== '' && (
                            <span
                                className="span-alert"
                                role="alert"
                                data-e2e="login-error"
                                data-testid="login-error"
                            >
                                Login can only contain letters, numbers and the '-' sign.
                                Length between 3 to 45 characters.
                            </span>
                        )}
                    </div>
                </label>

                <label className="label-default">
                    Email:
                    <div className="input-container">
                        <input
                            id="email-input"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder=" "
                            className="input-default"
                            data-testid="input-email"
                            data-e2e="input-email"
                        />
                        {!ValidationUtils.isEmailValid(email) && email !== '' && (
                            <span
                                className="span-alert"
                                role="alert"
                                data-e2e="email-error"
                                data-testid="email-error"
                            >
                                Email can only contain letters, numbers and the '-' sign
                                and must be in format user@domain.net.
                            </span>
                        )}
                    </div>
                </label>

                <label className="label-default">
                    Your Password:
                    <div className="input-container">
                        <input
                            id="password-input"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder=" "
                            className="input-default"
                            data-testid="input-password"
                            data-e2e="input-password"
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
                                The password must contain at least 8 characters, numbers or letters.
                            </span>
                        )}
                    </div>
                </label>

                <label className="label-default">
                    Repeat password:
                    <div className="input-container">
                        <input
                            id="repeat-password-input"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder=" "
                            className="input-default"
                            data-testid="input-repeat-password"
                            data-e2e="input-repeat-password"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            aria-pressed={showConfirmPassword}
                            data-e2e="repeat-password-toggle"
                            data-testid="repeat-password-toggle"
                        >
                            <svg>
                                <use href={`icons.svg#${showConfirmPassword ? 'eye-closed' : 'eye-open'}`}/>
                            </svg>
                        </button>
                        {!ValidationUtils.isPasswordMatches(password, confirmPassword) && confirmPassword !== '' && (
                            <span
                                className="span-alert"
                                role="alert"
                                data-e2e="confirm-password-error"
                                data-testid="confirm-password-error"
                            >
                                Passwords must match.
                            </span>
                        )}
                    </div>
                </label>

                <label className="label-default">
                    Birthdate:
                    <div className="input-container">
                        <input
                            id="birthdate-input"
                            name="birthdate"
                            type="date"
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                            className="input-default"
                            data-testid="input-birthdate"
                            data-e2e="input-birthdate"
                        />
                        {!ValidationUtils.isBirthDateValid(birthdate) && (
                            <span
                                className="span-alert"
                                role="alert"
                                data-e2e="birthdate-error"
                                data-testid="birthdate-error"
                            >
                                Enter valid birthdate value.
                            </span>
                        )}
                    </div>
                </label>

                <div data-e2e="nationality-fetch-wrapper">
                    <NationalityFetchData onChange={handleNationality}/>
                </div>

                <div data-e2e="gender-fetch-wrapper">
                    <GenderFetchData onChange={handleGender}/>
                </div>

                <button
                    type="submit"
                    className="button-registration"
                    data-e2e="submit-register"
                    data-testid="submit-register"
                >
                    Register Account
                </button>
            </form>

            <p>
                {MESSAGE_LOGIN_PROMPT}{' '}
                <span data-e2e="link-login">
                    <RenderLink text="Login" page={NAVIGATE_LOGIN} onNavigate={onNavigate}/>
                </span>
                .
            </p>
            <p>
                {MESSAGE_RECOVERY_PROMPT}{' '}
                <span data-e2e="link-recovery">
                    <RenderLink text="Restore it" page={NAVIGATE_RECOVERY} onNavigate={onNavigate}/>
                </span>
                .
            </p>
        </div>
    );
};

export default RegistrationForm;
