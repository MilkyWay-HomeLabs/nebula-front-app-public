import React, {useState} from 'react';
import '../../resources/styles/FormDefault.css';
import ValidationUtils from "../../util/ValidationUtils";
import ChangePasswordRequest from "../../api/password/ChangePasswordRequest";
import UserData from "../../data/UserData";

const PasswordChange = () => {
    const SUCCESS_MESSAGE = 'Password updated';
    const ERROR_MESSAGE = 'Something is wrong...';
    const INVALID_DATA_MESSAGE = 'Incorrect form data. Ensure your password is strong and matches the confirmation.';

    const [password, setPassword] = useState({
        userId: UserData.getUserId(),
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    const updatePasswordField = (field, value) => {
        setPassword(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    const toggleShowPassword = (field) => {
        setShowPassword(prevState => ({
            ...prevState,
            [field]: !prevState[field]
        }));
    };

    const resetForm = () => {
        setPassword({
            userId: UserData.getUserId(),
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });

        setShowPassword({
            currentPassword: false,
            newPassword: false,
            confirmPassword: false
        });
    };

    const handlePasswordChange = async () => {
        if (ValidationUtils.isUpdatePasswordValid(password)) {
            try {
                const result = await ChangePasswordRequest(password);
                const isSuccess = result === true || (result && result.success === true);
                if (isSuccess) {
                    resetForm();
                    alert(SUCCESS_MESSAGE);
                } else {
                    alert(ERROR_MESSAGE);
                }
            } catch (e) {
                console.error('Password change request failed:', e);
                alert(ERROR_MESSAGE);
            }
        } else {
            alert(INVALID_DATA_MESSAGE);
        }
    };

    return (
        <div className="div-major" data-e2e="password-change-root" data-testid="password-change-root">
            <h1 data-e2e="password-change-heading">Change password</h1>

            <form
                className="form-major"
                data-e2e="password-change-form"
                data-testid="password-change-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    handlePasswordChange();
                }}
            >
                <label className="label-default" htmlFor="current-password">
                    Current password:
                    <div className="input-container">
                        <input
                            id="current-password"
                            name="currentPassword"
                            data-testid="current-password-input"
                            data-e2e="current-password-input"
                            type={showPassword.currentPassword ? 'text' : 'password'}
                            value={password.currentPassword}
                            onChange={(e) => updatePasswordField('currentPassword', e.target.value)}
                            placeholder=" "
                            className="input-default"
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => toggleShowPassword('currentPassword')}
                            aria-label={showPassword.currentPassword ? 'Hide current password' : 'Show current password'}
                            aria-pressed={showPassword.currentPassword}
                        >
                            <svg>
                                <use href={`icons.svg#${showPassword.currentPassword ? 'eye-closed' : 'eye-open'}`}/>
                            </svg>
                        </button>
                    </div>
                </label>

                <label className="label-default" htmlFor="new-password">
                    New password:
                    <div className="input-container">
                        <input
                            id="new-password"
                            name="newPassword"
                            data-testid="new-password-input"
                            data-e2e="new-password-input"
                            type={showPassword.newPassword ? 'text' : 'password'}
                            value={password.newPassword}
                            onChange={(e) => updatePasswordField('newPassword', e.target.value)}
                            placeholder=" "
                            className="input-default"
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => toggleShowPassword('newPassword')}
                            aria-label={showPassword.newPassword ? 'Hide new password' : 'Show new password'}
                            aria-pressed={showPassword.newPassword}
                        >
                            <svg>
                                <use href={`icons.svg#${showPassword.newPassword ? 'eye-closed' : 'eye-open'}`}/>
                            </svg>
                        </button>
                        {!ValidationUtils.isStrongPassword(password.newPassword) && password.newPassword !== '' && (
                            <span className="span-alert" role="alert" data-testid="new-password-error">
                                The password must contain at least 8 characters, numbers and letters.
                            </span>
                        )}
                    </div>
                </label>

                <label className="label-default" htmlFor="confirm-password">
                    Confirm new password:
                    <div className="input-container">
                        <input
                            id="confirm-password"
                            name="confirmPassword"
                            data-testid="confirm-password-input"
                            data-e2e="confirm-password-input"
                            type={showPassword.confirmPassword ? 'text' : 'password'}
                            value={password.confirmPassword}
                            onChange={(e) => updatePasswordField('confirmPassword', e.target.value)}
                            placeholder=" "
                            className="input-default"
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => toggleShowPassword('confirmPassword')}
                            aria-label={showPassword.confirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                            aria-pressed={showPassword.confirmPassword}
                        >
                            <svg>
                                <use href={`icons.svg#${showPassword.confirmPassword ? 'eye-closed' : 'eye-open'}`}/>
                            </svg>
                        </button>
                        {!ValidationUtils.isPasswordMatches(password.newPassword, password.confirmPassword) && password.confirmPassword !== '' && (
                            <span className="span-alert" role="alert" data-testid="confirm-password-error">
                                Passwords must match.
                            </span>
                        )}
                    </div>
                </label>

                <button
                    type="submit"
                    className="button-registration"
                    data-testid="change-password-button"
                    data-e2e="change-password-button"
                >
                    Change password
                </button>
            </form>
        </div>
    );
};

export default PasswordChange;
