import {appContentStore} from "../stores/appContentStore"
export const Home () => {
    const { appContent } = appContentStore()
    return(
        <h1>{appContent.heading}</h1>
}