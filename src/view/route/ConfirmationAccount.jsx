import React from 'react';
import {useParams} from 'react-router-dom';
import ConfirmationTokenRequest from "../../api/account/ConfirmationTokenRequest";
import '../../resources/styles/FormDefault.css';
import {assetUrl} from "../../util/AssetUrl.js";

const logo = assetUrl('favicon.svg');


const ConfirmationAccount = () => {
    const {id, token} = useParams();

    const createTokenData = (id, token) => {
        const parsedId = parseInt(id, 10);
        return {
            tokenId: parsedId,
            token: token,
        };
    };

    const handleConfirmation = async () => {
        const confirmationData = createTokenData(id, token);
        try {
            const response = await ConfirmationTokenRequest(confirmationData);
            if (response.success) {
                // data contains the actual API response body
                if (response.data?.success === false) {
                    console.error("Confirmation failed:", response.data.message);
                    alert(`Confirmation failed: ${response.data.message || 'Unknown error'}`);
                } else {
                    alert("The account has been confirmed");
                    window.location.href = import.meta.env.BASE_URL || "/";
                }
            } else {
                // HTTP error (4xx/5xx) — message is raw text from server
                console.error("Confirmation failed:", response.message);
                alert(`Confirmation failed: ${response.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error("Error during confirmation:", err);
            alert("An error occurred during account confirmation. Please try again.");
        }
    };

    const truncateToken = (str) => {
        if (!str) return '';
        if (str.length <= 20) return str;
        return `${str.substring(0, 10)}...${str.substring(str.length - 10)}`;
    };

    return (
        <div className="div-major">
            <img src={logo} className="App-logo" alt="logo"/>
            <h1>Account confirmation</h1>
            <div className="form-major">
                <p>ID: {id}</p>
                <p style={{wordBreak: 'break-all'}} title={token}>
                    Token: {truncateToken(token)}
                </p>
                <button onClick={handleConfirmation} className="button-registration">
                    Confirm Account
                </button>
            </div>
        </div>
    );
};

export default ConfirmationAccount;
