return[storedValue, setValue];
};
const use DarkMode =() => {
    const [enabled, setEnabled]=useLocalStorage('dark-theme');
    const isEnabled = typeof enabledState ===
    'undefined' && enabled;
    useEffect(()) => }
    const className = 'dark';
    const bodyClass = window.document.body.classList;
    isEnabled ? bodyclass.add(className):bodyclass.remove(className);
},[enabled, isEnabled]);
return [enabled, setEnabled]
};
export default useDarkMode; 
}