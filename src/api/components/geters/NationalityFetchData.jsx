import React, {useCallback} from 'react';
import {APP_REQUEST_URL} from '../../../data/Credentials';
import '../../../resources/styles/FormDefault.css';
import useFetchSortedData from "../UseFetchSortedData";

function NationalityFetchData({onChange}) {
    const url = APP_REQUEST_URL + '/nationalities';
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
        <label htmlFor="nationality-select" className={'label-default'}>
            Nationality:
            <div className="input-container">
                <select
                    id="nationality-select"
                    value={selected}
                    onChange={e => handleSelectChange(e.target.value)}
                    className={'input-default'}>
                    <option value="">{error ? 'Error loading data' : 'Select'}</option>
                    {data.map(nationality => (
                        <option key={nationality.id} value={nationality.id}>
                            {nationality.name}
                        </option>
                    ))}
                </select>
                {error ? (
                    <span className={'span-alert'}>Error loading nationalities.</span>
                ) : (
                    !selected && <span className={'span-alert'}>Select your nationality from list.</span>
                )}
            </div>
        </label>
    );

}

export default NationalityFetchData;
