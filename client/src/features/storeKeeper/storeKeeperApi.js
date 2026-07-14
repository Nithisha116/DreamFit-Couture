// src/features/storeKeeper/storeKeeperApi.js
import API from "../../app/axios";

export const getAllStoreKeepersApi = async (params = {}) => {
  const { search, department, page, limit, isActive } = params;
  let url = "/store-keepers";
  const q = [];
  if (search) q.push(`search=${encodeURIComponent(search)}`);
  if (department && department !== 'all') q.push(`department=${department}`);
  if (isActive) q.push(`isActive=${isActive}`);
  if (page) q.push(`page=${page}`);
  if (limit) q.push(`limit=${limit}`);
  if (q.length) url += `?${q.join('&')}`;
  const res = await API.get(url);
  return res.data;
};

export const getStoreKeeperByIdApi = async (id) => {
  const res = await API.get(`/store-keepers/${id}`);
  return res.data;
};

export const createStoreKeeperApi = async (data) => {
  const res = await API.post("/store-keepers", data);
  return res.data;
};

export const updateStoreKeeperApi = async (id, data) => {
  const res = await API.put(`/store-keepers/${id}`, data);
  return res.data;
};

export const deleteStoreKeeperApi = async (id) => {
  const res = await API.delete(`/store-keepers/${id}`);
  return res.data;
};

export const getStoreKeeperStatsApi = async () => {
  const res = await API.get("/store-keepers/stats");
  return res.data;
};