import { createSlice } from "@reduxjs/toolkit";
const userInfo = localStorage.getItem('userInfo')
  ? localStorage.getItem('userInfo')
  : null

const initialState = {
    userInfo:JSON.parse(userInfo!)

}

export const authenticateSlice = createSlice({
    name: "authenticate",
    initialState,
    reducers:{
        login: (state, action) => {
            
            state.userInfo = {...action.payload}
            
            console.log("state",state.userInfo)
        },
        logout: (state) => {
        state.userInfo = null
        }
    }
})
export const {login,logout} = authenticateSlice.actions
export default authenticateSlice.reducer