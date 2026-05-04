import React, {useEffect} from 'react';
import AvatarComponent from "../component/AvatarComponent";
import UserAvatar from "../../data/UserAvatar";
import {processAndUploadImage} from "../../util/ImageUploaderUtils";

/**
 * ImageUploader is a functional component for uploading and updating user avatars.
 * Supports drag-and-drop and file selection via an input element.
 */
const ImageUploader = () => {
    useEffect(() => {
        const updateAvatarOnMount = async () => {
            try {
                await UserAvatar.updateAvatar();
            } catch (error) {
                console.error("Failed to update avatar on mount:", error);
            }
        };

        updateAvatarOnMount();
    }, []);

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            processAndUploadImage(file);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            processAndUploadImage(file);
        }
    };

    return (
        <div
            className="imageLoaderDiv"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            data-testid="image-uploader-root"
        >
            <AvatarComponent width="192px" height="192px"/>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{display: 'none'}}
                id="fileInput"
                data-testid="file-input"
            />

            <label htmlFor="fileInput" data-testid="upload-label">
                Drag image to field or click <span className="highlight-here">here</span> to upload an image
            </label>
        </div>
    );
};

export default ImageUploader;
