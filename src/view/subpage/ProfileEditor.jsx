import React, {useEffect, useState} from 'react';
import '../../resources/styles/FormDefault.css';

import UserData from '../../data/UserData';

import ImageUploader from '../component/ImageUploader.jsx';
import NationalityUpdaterFetchData from "../../api/components/updaters/NationalityUpdaterFetchData.jsx";
import GenderUpdaterFetchData from "../../api/components/updaters/GenderUpdaterFetchData.jsx";
import ValidationUtils from "../../util/ValidationUtils";
import UserProfileDataUpdate from "../../api/user/UserProfileDataUpdate";

export const PROFILE_UPDATE_ERROR_MESSAGE = 'Incorrect form data, this usually happens if the name fields contain illegal characters or are empty.';
export const PROFILE_UPDATE_SUCCESS_MESSAGE = 'Profile data updated';
export const PROFILE_UPDATE_PARTIAL_SUCCESS_MESSAGE = 'Profile data updated but not downloaded';
export const PROFILE_UPDATE_FAILED_MESSAGE = 'Failed to update profile. Please try again.';

const ProfileEditor = () => {
    const [profileData, setProfileData] = useState({
        login: '',
        email: '',
        firstName: '',
        lastName: '',
        birthDate: '2000-01-01',
        nationality: {id: 180, name: "Poland", code: "POL"},
        gender: {id: 3, name: "Unknown"}
    });

    useEffect(() => {
        const fetchData = async () => {
            const userData = await UserData.loadUserData();
            if (userData) {
                setProfileData({
                    id: userData.id,
                    login: userData.login,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    birthDate: userData.birthDate,
                    nationality: userData.nationality,
                    gender: userData.gender,
                });
            }
        };
        fetchData();
    }, []);

    const handleChange = (field, value) => {
        setProfileData(prevData => ({...prevData, [field]: value}));
    };

    const handleNationalityChange = (nationality) => {
        setProfileData(prevData => ({...prevData, nationality}));
    };

    const handleGenderChange = (gender) => {
        setProfileData(prevData => ({...prevData, gender}));
    };

    const handleNameChange = (field, newName) => {
        const nameRegex = /^[\p{L}\p{M}\s-]*$/u;
        const MAX_LENGTH = 50;
        if (newName && newName.length <= MAX_LENGTH && nameRegex.test(newName)) {
            setProfileData(prevData => ({...prevData, [field]: newName}));
        }
    };

    const saveChanges = async () => {
        try {
            if (ValidationUtils.isProfileUpdateDataValid(profileData)) {
                const result = await UserProfileDataUpdate(profileData);
                const isSuccess = result === true || (result && result.success === true);
                if (isSuccess) {
                    const isDataFetched = await UserData.fetchUserData();
                    alert(isDataFetched ? PROFILE_UPDATE_SUCCESS_MESSAGE : PROFILE_UPDATE_PARTIAL_SUCCESS_MESSAGE);
                } else {
                    alert(PROFILE_UPDATE_FAILED_MESSAGE);
                }
            } else {
                alert(PROFILE_UPDATE_ERROR_MESSAGE);
            }
        } catch (error) {
            alert(`${PROFILE_UPDATE_ERROR_MESSAGE}: ${error.message}`);
        }
    };

    return (
        <div className="div-major" data-testid="profile-editor-root" data-e2e="profile-editor-root">
            <h1 data-e2e="profile-editor-heading">Edit profile</h1>

            <div className="profile-editor-layout">
                <div className="profile-editor-avatar">
                    <ImageUploader/>
                </div>

                <form
                    className="form-major"
                    data-testid="profile-editor-form"
                    data-e2e="profile-editor-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        saveChanges();
                    }}
                >
                    <label className="label-default label-default--readonly" htmlFor="username">
                        Username:
                        <div className="input-container">
                            <input
                                id="username"
                                type="text"
                                className="input-default"
                                value={profileData.login}
                                disabled
                                readOnly
                                placeholder=" "
                                data-testid="input-username"
                            />
                        </div>
                    </label>

                    <label className="label-default label-default--readonly" htmlFor="email">
                        Email:
                        <div className="input-container">
                            <input
                                id="email"
                                type="email"
                                className="input-default"
                                value={profileData.email}
                                disabled
                                readOnly
                                placeholder=" "
                                data-testid="input-email"
                            />
                        </div>
                    </label>

                    <label className="label-default" htmlFor="firstName">
                        First name:
                        <div className="input-container">
                            <input
                                id="firstName"
                                type="text"
                                className="input-default"
                                value={profileData.firstName || ''}
                                onChange={(e) => handleNameChange('firstName', e.target.value)}
                                placeholder=" "
                                required
                                data-testid="input-first-name"
                                data-e2e="input-first-name"
                            />
                            {!ValidationUtils.isTextNameValid(profileData.firstName) && profileData.firstName !== '' && (
                                <span className="span-alert" role="alert" data-testid="first-name-error">
                                    Invalid first name
                                </span>
                            )}
                        </div>
                    </label>

                    <label className="label-default" htmlFor="lastName">
                        Last name:
                        <div className="input-container">
                            <input
                                id="lastName"
                                type="text"
                                className="input-default"
                                value={profileData.lastName || ''}
                                onChange={(e) => handleNameChange('lastName', e.target.value)}
                                placeholder=" "
                                required
                                data-testid="input-last-name"
                                data-e2e="input-last-name"
                            />
                            {!ValidationUtils.isTextNameValid(profileData.lastName) && profileData.lastName !== '' && (
                                <span className="span-alert" role="alert" data-testid="last-name-error">
                                    Invalid last name
                                </span>
                            )}
                        </div>
                    </label>

                    <label className="label-default" htmlFor="birthdate">
                        Birthdate:
                        <div className="input-container">
                            <input
                                id="birthdate"
                                type="date"
                                className="input-default"
                                value={profileData.birthDate || ''}
                                onChange={(e) => handleChange('birthDate', e.target.value)}
                                data-testid="input-birthdate"
                                data-e2e="input-birthdate"
                            />
                        </div>
                    </label>

                    <NationalityUpdaterFetchData
                        value={profileData.nationality}
                        onChange={handleNationalityChange}
                    />
                    {!ValidationUtils.isNationalityValid(profileData.nationality?.id) && (
                        <span className="span-alert" role="alert">
                            Select Nationality from list.
                        </span>
                    )}

                    <GenderUpdaterFetchData
                        value={profileData.gender}
                        onChange={handleGenderChange}
                    />
                    {!ValidationUtils.isGenderValid(profileData.gender?.id) && (
                        <span className="span-alert" role="alert">
                            Select Gender from list.
                        </span>
                    )}

                    <button
                        type="submit"
                        className="button-registration"
                        data-testid="save-changes-button"
                        data-e2e="save-changes-button"
                    >
                        Save changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileEditor;