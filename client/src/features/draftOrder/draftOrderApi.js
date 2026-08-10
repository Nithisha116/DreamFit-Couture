// features/draftOrder/draftOrderApi.js
import axiosInstance from "../../app/axios";

const DRAFT_BASE = "/orders/drafts";

const buildQueryString = (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value);
    }
  });
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : "";
};

export const createDraft = async (draftData) => {
  const response = await axiosInstance.post(DRAFT_BASE, { draftData });
  return response.data;
};

export const updateDraft = async (id, draftData) => {
  const response = await axiosInstance.put(`${DRAFT_BASE}/${id}`, { draftData });
  return response.data;
};

export const getDrafts = async (params = {}) => {
  const queryString = buildQueryString(params);
  const response = await axiosInstance.get(`${DRAFT_BASE}${queryString}`);
  return response.data;
};

export const getDraftById = async (id) => {
  const response = await axiosInstance.get(`${DRAFT_BASE}/${id}`);
  return response.data;
};

export const deleteDraft = async (id) => {
  const response = await axiosInstance.delete(`${DRAFT_BASE}/${id}`);
  return response.data;
};

export const duplicateDraft = async (id) => {
  const response = await axiosInstance.post(`${DRAFT_BASE}/${id}/duplicate`);
  return response.data;
};

export const convertDraft = async (id, orderData) => {
  const response = await axiosInstance.post(`${DRAFT_BASE}/${id}/convert`, orderData);
  return response.data;
};

export const uploadDraftImages = async (draftId, garmentIndex, category, files) => {
  const fd = new FormData();
  fd.append("garmentIndex", garmentIndex);
  fd.append("category", category);
  files.forEach((file) => fd.append("images", file));
  const response = await axiosInstance.post(`${DRAFT_BASE}/${draftId}/images`, fd);
  return response.data;
};
