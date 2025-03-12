import { useEffect, useState } from "react";
import ReactSelect, { StylesConfig } from "react-select";

function Select({
    options,
    handleChange,
    defaultSelection,
}: any) {
    const [selection, setSelection] = useState(
        defaultSelection || options[0] || ""
    );
    const [isDarkMode, setIsDarkMode] = useState(false);

    const formattedOptions = options.map((option: string) => ({
        value: option,
        label: option,
    }));

    useEffect(() => {
        setSelection(defaultSelection || options[0]);
    }, [defaultSelection, options]);

    const handleSelection = (option: any) => {
        setSelection(option.value); // Update state with selected value
        handleChange(option.value); // Pass selected value to the parent handler
    };

    useEffect(() => {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const updateTheme = () => {
            setIsDarkMode(darkModeMediaQuery.matches);
        };

        updateTheme();

        darkModeMediaQuery.addEventListener('change', updateTheme);

        return () => {
            darkModeMediaQuery.removeEventListener('change', updateTheme);
        };
    }, []);

    return (
        <ReactSelect
            options={formattedOptions}
            value={formattedOptions.find((opt: any) => opt.value === selection)}
            onChange={handleSelection}
            placeholder="Select an option"
            isSearchable
            menuShouldScrollIntoView={false}
            maxMenuHeight={200}
            styles={isDarkMode ? darkTheme : theme}
            className="rdfnselectoptarget"
        />
    );
}

const theme: StylesConfig = {
    option: (provided: any, state: any) => ({
        ...provided,
        color: 'black',
        backgroundColor: state.isSelected ? '#ffde00' : 'white',
        cursor: 'pointer',
        fontSize: '16px',
        borderRadius: '8px',
        ":hover": {
            backgroundColor: state.isSelected ? '#ffde00' : '#fffde1',
        },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '10px 12px'
    }),
    menu: (provided: any) => ({
        ...provided,
        width: 'auto',
        overflow: 'hidden',
        backgroundColor: 'white',
        borderRadius: '8px',
        zIndex: 999999999,
        minWidth: '100%',
    }),
    menuList: (provided: any) => ({
        ...provided,
        paddingTop: 0,
        paddingBottom: 0
    }),
    valueContainer: (provided: any) => ({
        ...provided,
        padding: '5px'
    }),
    control: (provided: any, state: any) => ({
        ...provided,
        borderRadius: '4px',
        backgroundColor: '#fffde1',
        color: 'black',
        cursor: 'pointer',
        borderColor: state.isFocused ? '#ffde00' : provided.borderColor,
        boxShadow: state.isFocused ? `0 0 0 1px #ffde00` : provided.boxShadow,
        "&:hover": {
            borderColor: state.isFocused ? '#ffde00' : provided.borderColor,
            boxShadow: state.isFocused ? `0 0 0 1px #ffde00` : provided.boxShadow,
        },
    }),
    input: (provided: any) => ({
        ...provided,
        color: 'black',
        fontSize: '16px',
    }),
    placeholder: (provided: any) => ({
        ...provided,
        color: 'black',
        fontSize: '16px',
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: 'black',
        fontSize: '16px',
    }),
    dropdownIndicator: (provided: any, state: any) => ({
        ...provided,
        color: 'black',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : null,
        transition: 'transform 0.2s'
    }),
    indicatorSeparator: () => ({
        display: 'none'
    }),
}

const darkTheme: StylesConfig = {
    option: (provided: any, state: any) => ({
        ...provided,
        color: state.isSelected ? 'black' : 'white',
        backgroundColor: state.isSelected ? '#ffde00' : '#222',
        cursor: 'pointer',
        fontSize: '16px',
        borderRadius: '8px',
        ":hover": {
            backgroundColor: state.isSelected ? '#ffde00' : '#333',
        },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '10px 12px'
    }),
    menu: (provided: any) => ({
        ...provided,
        width: 'auto',
        overflow: 'hidden',
        backgroundColor: '#222',
        borderRadius: '8px',
        zIndex: 999999999,
        minWidth: '100%',
    }),
    menuList: (provided: any) => ({
        ...provided,
        paddingTop: 0,
        paddingBottom: 0
    }),
    valueContainer: (provided: any) => ({
        ...provided,
        padding: '5px'
    }),
    control: (provided: any, state: any) => ({
        ...provided,
        borderRadius: '4px',
        backgroundColor: '#333',
        border: '1px solid #222',
        color: 'white',
        cursor: 'pointer',
        borderColor: state.isFocused ? '#ffde00' : provided.borderColor,
        boxShadow: state.isFocused ? `0 0 0 1px #ffde00` : provided.boxShadow,
        "&:hover": {
            borderColor: state.isFocused ? '#ffde00' : '#222',
            boxShadow: state.isFocused ? `0 0 0 1px #ffde00` : provided.boxShadow,
        },
    }),
    input: (provided: any) => ({
        ...provided,
        color: 'white',
        fontSize: '16px',
    }),
    placeholder: (provided: any) => ({
        ...provided,
        color: 'white',
        fontSize: '16px',
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: 'white',
        fontSize: '16px',
    }),
    dropdownIndicator: (provided: any, state: any) => ({
        ...provided,
        color: '#222',
        '&:hover': {
            color: '#222'
        },
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : null,
        transition: 'transform 0.2s'
    }),
    indicatorSeparator: () => ({
        display: 'none'
    }),
}

export default Select;