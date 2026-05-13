import {APP_REQUEST_URL} from '../../../data/Credentials';
import '../../../resources/styles/FormDefault.css';
import useFetchSortedData from "../UseFetchSortedData";
import {useCallback} from "react";

/**
 * Fetches and updates nationality data for a dropdown component.
 * Allows the user to select a nationality from the fetched list,
 * which triggers the provided change handler.
 *
 * @param {Object} params The parameters for the function.
 * @param {string} params.value The initial value for the selected nationality.
 * @param {Function} params.onChange Function invoked when the selected nationality changes.
 * It receives the selected nationality object as an argument.
 * @return {JSX.Element} The rendered nationality selection dropdown component.
 */
function NationalityUpdaterFetchData({value, onChange}) {
    const url = APP_REQUEST_URL + "/nationalities";
    const sortFunction = useCallback((a, b) => a.name.localeCompare(b.name), []);
    const { data, selected, setSelected } = useFetchSortedData(url, sortFunction, value);

    const handleSelectChange = (selected) => {
        const selectedId = parseInt(selected, 10);
        if (isNaN(selectedId)) {
            setSelected('');
            onChange('');
            return;
        }
        const selectedObject = data.find(nationality => nationality.id === selectedId) || '';
        setSelected(selectedId);
        if (selectedObject) {
            onChange(selectedObject);
        }
    };

    return (
        <div className={'combo-box-default'}>
            <label htmlFor="nationality-select" className={'label-default'}>
                Nationality:
            </label>
            <select
                id="nationality-select"
                value={selected}
                onChange={e => handleSelectChange(e.target.value)}
                className={'input-default'}>
                {data.map(nationality => (
                    <option key={nationality.id} value={nationality.id}>
                        {nationality.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default NationalityUpdaterFetchData;
