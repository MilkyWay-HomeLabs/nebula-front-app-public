import {APP_REQUEST_URL} from '../../../data/Credentials';
import '../../../resources/styles/FormDefault.css';
import useFetchSortedData from "../UseFetchSortedData";
import {useCallback} from "react";

/**
 * Fetches and updates gender data, manages state, and handles change events for a select dropdown.
 *
 * @param {Object} props - An object containing the component's properties.
 * @param {*} props.value - The initial value for the selected gender.
 * @param {Function} props.onChange - Callback function to handle changes in selected gender.
 * @return {JSX.Element} Rendered component containing a dropdown for gender selection.
 */
function GenderUpdaterFetchData({value, onChange}) {
    const url = APP_REQUEST_URL + '/genders';
    const sortFunction = useCallback((a, b) => a.name.localeCompare(b.name), []);
    const { data, selected, setSelected } = useFetchSortedData(url, sortFunction, value);

    const handleSelectChange = (selected) => {
        const selectedId = parseInt(selected, 10);
        if (isNaN(selectedId)) {
            setSelected('');
            onChange('');
            return;
        }
        const selectedObject = data.find(gender => gender.id === selectedId) || '';
        setSelected(selectedId);
        onChange(selectedObject);
    };

    return (
        <div className={'combo-box-default'}>
            <label htmlFor="gender-select" className={'label-default'}>
                Gender:
                <select
                    id="gender-select"
                    value={selected}
                    onChange={e => handleSelectChange(e.target.value)}
                    className={'input-default'}>
                    {data.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
}

export default GenderUpdaterFetchData;
