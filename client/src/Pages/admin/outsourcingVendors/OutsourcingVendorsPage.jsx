import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus } from "lucide-react";
import toast from "react-hot-toast";
import VendorTable from "../../../components/outsourcingVendors/VendorTable";
import VendorModal from "../../../components/outsourcingVendors/VendorModal";
import {
  fetchVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  resetVendorState,
} from "../../../features/outsourcingVendor/outsourcingVendorSlice";

const SPECIALIZATIONS = ["all", "Stitching", "Embroidery", "Alteration", "Finishing", "Other"];

export default function OutsourcingVendorsPage() {
  const dispatch = useDispatch();
  const { vendors, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.outsourcingVendor
  );

  const [statusFilter, setStatusFilter] = useState("all");
  const [specFilter, setSpecFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== "all") params.status = statusFilter;
    if (specFilter !== "all") params.specialization = specFilter;

    dispatch(fetchVendors(params));
  }, [dispatch, debouncedSearch, statusFilter, specFilter]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(resetVendorState());
    }
  }, [isError, message, dispatch]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        await dispatch(deleteVendor(id)).unwrap();
        toast.success("Vendor deleted successfully");
      } catch (err) {
        toast.error(err || "Failed to delete vendor");
      }
    }
  };

  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await dispatch(
          updateVendor({ id: editingItem._id, data: formData })
        ).unwrap();
        toast.success("Vendor updated successfully");
      } else {
        await dispatch(createVendor(formData)).unwrap();
        toast.success("Vendor created successfully");
      }
      setModalOpen(false);
      setEditingItem(null);
      dispatch(fetchVendors({})); // Reload list
    } catch (err) {
      toast.error(err || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Outsourcing Vendors</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-700 transition-all shadow-sm"
        >
          <Plus size={16} />
          <span>Add Vendor</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm min-w-[140px]"
          >
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Specializations" : s}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendors..."
            className="w-full sm:w-[220px] pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-300 transition-all text-sm"
          />
          <button className="absolute right-1 top-1 bottom-1 px-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg flex items-center justify-center hover:from-violet-700 transition-all">
            <Search size={16} />
          </button>
        </div>
      </div>

      <VendorTable
        data={vendors}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <VendorModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleModalSubmit}
        editData={editingItem}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
