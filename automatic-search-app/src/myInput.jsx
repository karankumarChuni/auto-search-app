import {useCallback,useState} from 'react';
import _debounce from 'lodash/debounce';

export function MyInput() {
    const [value, setValue] = useState('');

    function handleDebounceFn(inputValue) {
        console.log("making api request now", inputValue)
    }

    const debounceFn = useCallback(_debounce(handleDebounceFn, 3000), []);

    function handleChange (event) {
        setValue(event.target.value);
        debounceFn(event.target.value);
    };

    return <input value={value} onChange={handleChange} />
}