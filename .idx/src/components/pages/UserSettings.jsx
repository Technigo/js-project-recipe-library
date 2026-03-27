import { useUserStore } from "../stores/userstore"
export const UserSettings = () => {
    const { toggleLogin, } inCrementAge, setUserName} isLoggedIn, userName } = useUserStore()
    return(
        <div>
            <h2>User Settings</h2>
            <p>Logged in: {isLoggedIn ? "Yes" : "No"}</p>
            <button onClick={toggleLogin}>Toggle Login</button>
            <button onClick = { incrementAge }>Increment Age</button>
            <label>
                New User Name:
                <input value={useName} onChange={(event) => setUserName(event.target.value)}/>

            </label>
        </div>
    )
}