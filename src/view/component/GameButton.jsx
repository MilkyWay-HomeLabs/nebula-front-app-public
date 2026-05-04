import React from "react";

const GameButton = ({game}) => {
    const handleClick = () => {
        if (game.enable) {
            window.location.href = game.pageUrl;
        }
    };

    return (
        <button type="button" className="game-button" onClick={handleClick} disabled={!game.enable}>
            {game.iconUrl && <img className="game-icon" src={game.iconUrl} alt={game.name}/>}
            <div className="game-name">{game.name}</div>
        </button>
    );
};

export default GameButton;
