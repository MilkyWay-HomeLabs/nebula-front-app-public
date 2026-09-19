import React, {useCallback} from 'react';
import {APP_REQUEST_URL} from '../../../data/Credentials';
import '../../../resources/styles/FormDefault.css';
import useFetchSortedData from "../UseFetchSortedData";

function GenderFetchData({onChange}) {
    const url = APP_REQUEST_URL + '/genders';
    const sortFunction = useCallback((a, b) => a.name.localeCompare(b.name), []);
    const {data, selected, setSelected, error} = useFetchSortedData(
        url,
        sortFunction
    );

    const handleSelectChange = (selectedId) => {
        setSelected(selectedId);
        onChange(selectedId);
    };

    return (
        <label htmlFor="gender-select" className={'label-default'}>
            Gender:
            <div className="input-container">
                <select
                    id="gender-select"
                    value={selected}
                    onChange={e => handleSelectChange(e.target.value)}
                    className={'input-default'}>
                    <option value="">{error ? 'Error loading data' : 'Select'}</option>
                    {data.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>
                {error ? (
                    <span className={'span-alert'}>Error loading genders.</span>
                ) : (
                    !selected && <span className={'span-alert'}>Select your gender.</span>
                )}
            </div>
        </label>
    );
}

export default GenderFetchData;
