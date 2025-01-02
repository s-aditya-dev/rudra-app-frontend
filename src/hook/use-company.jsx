import React from "react";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../utils/newRequest.js";

// Custom hook to fetch companies
export const useCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await newRequest.get("/company");
      return response.data;
    },
  });
};
