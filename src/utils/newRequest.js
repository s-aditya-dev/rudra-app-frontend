import axios from "axios";
import { backEndPort } from "@/settings.js";

const newRequest = axios.create({
  baseURL: `${backEndPort}/api/`,
  withCredentials: true,
});

export default newRequest;
