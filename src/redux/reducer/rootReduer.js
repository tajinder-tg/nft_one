import { combineReducers } from "@reduxjs/toolkit";
import { nftReducer } from "./nftReducer";
const reducers = combineReducers({ nftReducer });
export default reducers;
