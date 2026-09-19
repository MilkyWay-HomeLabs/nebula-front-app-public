import React, {useEffect, useState} from 'react';
import '../../resources/styles/Achievements.css';
import UserData from "../../data/UserData";

const defaultTableHeaders = [
    {key: 'id', label: 'Id'},
    {key: 'iconUrl', label: 'Icon'},
    {key: 'name', label: 'Name'},
    {key: 'source', label: 'Game'},
    {key: 'progress', label: 'Progress'},
    {key: 'level', label: '5-star scale'}
];

// Achievements can arrive from any game on the platform (Chess, Robak, Element, Racer, ...)
// as well as Nebula's own cross-game rollups. Not every achievement carries a `source` yet
// (older/partial data), so this falls back to a neutral placeholder rather than an empty cell.
const SourceBadge = ({source}) => {
    if (!source) {
        return <span className="source-badge source-badge-unknown">—</span>;
    }
    const label = source.charAt(0).toUpperCase() + source.slice(1);
    return <span className={`source-badge source-badge-${source}`}>{label}</span>;
};

const RenderStarRating = ({rating}) => {
    const stars = Array.from({length: 5}, (_, i) => (
        <span
            key={i + 1}
            data-testid="star"
            className={i + 1 <= rating ? 'gold-star' : 'black-star'}
            aria-label={i + 1 <= rating ? 'gold star' : 'black star'}
        >
      &#9733;
    </span>
    ));
    return <div className="star-container" data-testid="star-container">{stars}</div>;
};

const SkeletonRow = ({columns}) => (
    <tr className="skeleton-row" aria-hidden="true">
        {Array.from({length: columns}).map((_, i) => (
            <td key={i}>
                <div className="skeleton-cell"/>
            </td>
        ))}
    </tr>
);

const Achievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await UserData.loadUserData();
                // defensive: if result is undefined or missing achievements, set empty array
                setAchievements((result && result.achievements) ? result.achievements : []);
            } catch (error) {
                console.error('Error loading user data:', error);
                setAchievements([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderTableHeader = () =>
        defaultTableHeaders.map(({key, label}) => (
            <th key={key} style={{textAlign: 'left'}}>
                {label}
            </th>
        ));

    return (
        <div className='full-page-container achievements-page'>
            <div className="custom-table-wrapper">
                <table className="custom-table" role="table" aria-label="Achievements table">
                    <thead>
                    <tr>{renderTableHeader()}</tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        // show fixed number of skeleton rows while loading
                        <>
                            <SkeletonRow columns={defaultTableHeaders.length}/>
                            <SkeletonRow columns={defaultTableHeaders.length}/>
                            <SkeletonRow columns={defaultTableHeaders.length}/>
                        </>
                    ) : achievements.length === 0 ? (
                        <tr>
                            <td colSpan={defaultTableHeaders.length} style={{textAlign: 'center', padding: '24px'}}>
                                No achievements yet — play a game on the platform and check back here.
                            </td>
                        </tr>
                    ) : (
                        achievements.map(({id, iconUrl, name, source, progress, level}) => (
                            <tr key={id} data-testid={`achievement-row-${id}`}>
                                <td style={{textAlign: 'left'}}>{id}</td>
                                <td style={{textAlign: 'left'}}>
                                    <img
                                        src={iconUrl}
                                        alt={name}
                                        className="achievement-icon"
                                        width="40"
                                        height="40"
                                    />
                                </td>
                                <td style={{textAlign: 'left'}}>{name}</td>
                                <td style={{textAlign: 'left'}}>
                                    <SourceBadge source={source}/>
                                </td>
                                <td style={{textAlign: 'left'}}>{progress}</td>
                                <td style={{textAlign: 'left'}}>
                                    <RenderStarRating rating={level || 0}/>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Achievements;
