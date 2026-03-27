import { create } from "zustand"
export const useUserStore = create ((set) =>({
    isLoggedIn: false,
    age: 25,
    userName: "John Doe",
    toggleLogin: () set ((state) => ({isLoggedIn:})) !state.isLoggedIn}))
    incrementAge: () => set ((state) => ({age: state.age +1})),
    setUserName: (newUserName) => set ({userName:})
})