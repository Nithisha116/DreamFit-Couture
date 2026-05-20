import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus } from "lucide-react";
import toast from "react-hot-toast";
import OutsourcingTable from "../../../components/outsourcing/OutsourcingTable";
import OutsourcingModal from "../../../components/outsourcing/OutsourcingModal";
import {
  fetchOutsourcing,
  updateOutsourcing,
  createOutsourcing,
  reset,
} from "../../../features/outsourcing/outsourcingSlice";

const STATUS_OPTIONS = ["all", "Given", "In Progress", "Completed", "Pending"];

export default function OutsourcingPage() {
  const dispatch = useDispatch();
  const { outsourcings, employees, pagination, isLoading, isError, isSuccess, message } =
    useSelector((state) => state.outsourcing);

  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data
  const loadData = useCallback(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== "all") params.status = statusFilter;
    if (employeeFilter !== "all") params.employee = employeeFilter;

    dispatch(fetchOutsourcing(params));
  }, [dispatch, pagination.page, pagination.limit, debouncedSearch, statusFilter, employeeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toast on error
  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  // Handle edit click
  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  // Handle modal submit
  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await dispatch(
          updateOutsourcing({ id: editingItem._id, data: formData })
        ).unwrap();
        toast.success("Outsourcing updated successfully");
      } else {
        await dispatch(createOutsourcing(formData)).unwrap();
        toast.success("Outsourcing created successfully");
      }
      setModalOpen(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      toast.error(err || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    dispatch(
      fetchOutsourcing({
        page: newPage,
        limit: pagination.limit,
        search: debouncedSearch,
        status: statusFilter !== "all" ? statusFilter : undefined,
        employee: employeeFilter !== "all" ? employeeFilter : undefined,
      })
    );
  };

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    dispatch(
      fetchOutsourcing({
        page: 1,
        limit: newLimit,
        search: debouncedSearch,
        status: statusFilter !== "all" ? statusFilter : undefined,
        employee: employeeFilter !== "all" ? employeeFilter : undefined,
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Outsourcing
        </h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-sm"
        >
          <Plus size={16} />
          <span>Add Outsourcing</span>
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Filter Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all min-w-[140px]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Status" : s}
              </option>
            ))}
          </select>

          {/* Employee Filter */}
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all min-w-[140px]"
          >
            <option value="all">All Employees</option>
            {employees.map((emp) => (
              <option key={emp} value={emp}>
                {emp}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Search */}
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full sm:w-[220px] pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all placeholder:text-slate-400"
          />
          <button className="absolute right-1 top-1 bottom-1 px-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg flex items-center justify-center hover:from-violet-700 hover:to-purple-700 transition-all">
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <OutsourcingTable
        data={outsourcings}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onEdit={handleEdit}
      />

      {/* Modal */}
      <OutsourcingModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleModalSubmit}
        editData={editingItem}
        employees={employees}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
