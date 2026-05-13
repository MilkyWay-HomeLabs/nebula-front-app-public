import {APP_REQUEST_URL} from '../../../data/Credentials';
// import '../../../resource/style/FormUpdater.css';
import '../../../resources/styles/FormDefault.css';
import useFetchSortedData from "../UseFetchSortedData";
import {useCallback} from "react";

/**
 * Fetches theme data, sorts it by name, and provides a selection mechanism for the user.
 * Updates the parent component on selection change.
 *
 * @param {Object} args - The arguments for the ThemeUpdaterFetchData function.
 * @param {any} args.value - The initial value to pre-select in the dropdown.
 * @param {Function} args.onChange - Callback function triggered on selection change.
 * Receives the selected object as an argument.
 *
 * @return {JSX.Element} A React component containing a dropdown menu for theme selection.
 */
function ThemeUpdaterFetchData({value, onChange}) {
    const url = APP_REQUEST_URL + '/themes';
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
        <div className="item-container div-component-b">
            <select
                value={selected}
                onChange={e => handleSelectChange(e.target.value)}
                className={'input-default'}>
                {data.map(item => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default ThemeUpdaterFetchData;
