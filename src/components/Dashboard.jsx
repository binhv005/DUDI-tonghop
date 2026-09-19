import React, { useState, useMemo, useEffect } from 'react';
import {
  Inbox,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Download,
  PlusCircle,
  Phone,
  Mail,
  Building,
  ExternalLink,
  MessageSquare,
  Trash2,
  Eye,
  Check,
  X,
  ChevronDown,
  LayoutGrid,
  ListFilter,
  DollarSign,
  Calendar,
  Send,
  User,
  Layers,
  Wrench,
  Layout,
  ShieldCheck,
  Target,
  ShoppingCart,
  Smartphone,
  Compass,
  ArrowUpDown,
  FileSpreadsheet,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sparkles,
  Database,
  Flame,
  Settings,
  Copy
} from 'lucide-react';
import { INITIAL_LEADS, LEAD_STATUS_CONFIG, TECH_TEAM } from '../data/dashboardData';
import { SERVICES_DATA } from '../data/servicesData';
import {
  isFirebaseConfigured,
  subscribeToLeads,
  addLeadToFirebase,
  updateLeadStatusInFirebase,
  updateLeadAssigneeInFirebase,
  addNoteToFirebaseLead,
  deleteLeadFromFirebase,
  saveCustomFirebaseConfig,
  getActiveFirebaseConfig
} from '../firebase';

// Map icon for each service
const SERVICE_ICONS = {
  'dudi-page': Wrench,
  'dudi-gioithieu': Layout,
  'dudi-baohanh': ShieldCheck,
  'dudi-dongia': DollarSign,
  'dudi-dichvu': Target,
  'dudisoftwareseo': Search,
  'dudi-banhang': ShoppingCart,
  'dudi-baotri': Smartphone
};

const SERVICE_SHORT_LABELS = {
  'dudi-page': 'Sửa & Nâng Cấp Web',
  'dudi-gioithieu': 'Web Doanh Nghiệp',
  'dudi-baohanh': 'Bảo Trì & Bảo Hành',
  'dudi-dongia': 'Bảng Giá & Kỹ Sư',
  'dudi-dichvu': 'Landing Page CRO',
  'dudisoftwareseo': 'SEO Web Tổng Thể',
  'dudi-banhang': 'Website Bán Hàng',
  'dudi-baotri': 'Bảo Trì App Mobile'
};

const LOCAL_STORAGE_KEY = 'dudi_real_leads_live_v1';

export function Dashboard({ onBackToHome }) {
  // Leads state persisted in localStorage (and synced with Firebase if active)
  const [leads, setLeads] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load leads from localStorage', e);
    }
    return [];
  });

  // Firebase Realtime connection status
  const [isFirebaseLive, setIsFirebaseLive] = useState(() => isFirebaseConfigured());
  const [isFirebaseSettingsOpen, setIsFirebaseSettingsOpen] = useState(false);
  const [firebaseConfigForm, setFirebaseConfigForm] = useState(() => {
    return (
      getActiveFirebaseConfig() || {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: ''
      }
    );
  });

  // Save to localStorage when leads change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error('Failed to save leads to localStorage', e);
    }
  }, [leads]);

  // Connect to Firebase Firestore Realtime if configured
  useEffect(() => {
    if (isFirebaseConfigured()) {
      setIsFirebaseLive(true);
      const unsubscribe = subscribeToLeads(
        (remoteLeads) => {
          console.log('🔥 [Firebase Realtime] Received leads from Firestore:', remoteLeads);
          if (Array.isArray(remoteLeads)) {
            setLeads(remoteLeads);
          }
        },
        (error) => {
          console.warn('Firestore subscription error:', error);
          setIsFirebaseLive(false);
        }
      );
      return () => unsubscribe();
    } else {
      setIsFirebaseLive(false);
    }
  }, []);

  // Sidebar & Navigation Filters
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('all'); // 'all' or serviceId
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all'); // 'all' or status key
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [activeLeadDetail, setActiveLeadDetail] = useState(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    company: '',
    serviceId: 'dudi-page',
    budget: '',
    priority: 'high',
    requirements: ''
  });

  const [newNoteInput, setNewNoteInput] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Lead Counts by Service
  const serviceCounts = useMemo(() => {
    const counts = {};
    SERVICES_DATA.forEach(s => {
      counts[s.id] = leads.filter(l => l.serviceId === s.id).length;
    });
    return counts;
  }, [leads]);

  // Lead Counts by Status
  const statusCounts = useMemo(() => {
    const counts = { all: leads.length };
    Object.keys(LEAD_STATUS_CONFIG).forEach(key => {
      counts[key] = leads.filter(l => l.status === key).length;
    });
    return counts;
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Service filter
      const leadSvcId = lead.serviceId || 'dudi-gioithieu';
      if (selectedServiceFilter !== 'all' && leadSvcId !== selectedServiceFilter) {
        return false;
      }
      // Status filter
      const leadStatus = lead.status || 'new';
      if (selectedStatusFilter !== 'all' && leadStatus !== selectedStatusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const customerName = lead.customerName || lead.fullName || lead.name || '';
        const serviceName = lead.serviceName || lead.service || '';
        const reqs = lead.requirements || lead.description || lead.note || lead.message || '';
        const matchName = customerName.toLowerCase().includes(query);
        const matchPhone = lead.phone?.toLowerCase().includes(query);
        const matchEmail = lead.email?.toLowerCase().includes(query);
        const matchCompany = lead.company?.toLowerCase().includes(query);
        const matchService = serviceName.toLowerCase().includes(query);
        const matchId = lead.id?.toLowerCase().includes(query);
        const matchReq = reqs.toLowerCase().includes(query);
        if (!matchName && !matchPhone && !matchEmail && !matchCompany && !matchService && !matchId && !matchReq) {
          return false;
        }
      }
      return true;
    });
  }, [leads, selectedServiceFilter, selectedStatusFilter, searchQuery]);

  // Handle Quick Status Change
  const handleUpdateStatus = (leadId, newStatus) => {
    const noteText = `Chuyển trạng thái sang "${LEAD_STATUS_CONFIG[newStatus]?.label || newStatus}"`;

    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        const updatedNotes = [
          ...(lead.notes || []),
          {
            id: Date.now(),
            author: 'Quản trị viên',
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            text: noteText
          }
        ];
        return { ...lead, status: newStatus, notes: updatedNotes };
      }
      return lead;
    }));

    if (activeLeadDetail && activeLeadDetail.id === leadId) {
      setActiveLeadDetail(prev => ({
        ...prev,
        status: newStatus,
        notes: [
          ...(prev.notes || []),
          {
            id: Date.now(),
            author: 'Quản trị viên',
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            text: noteText
          }
        ]
      }));
    }

    if (isFirebaseConfigured()) {
      updateLeadStatusInFirebase(leadId, newStatus, noteText).catch(console.error);
    }

    showToast(`Đã cập nhật trạng thái đơn ${leadId} thành "${LEAD_STATUS_CONFIG[newStatus]?.label}"`);
  };

  // Handle Assignee Change
  const handleUpdateAssignee = (leadId, assigneeName) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, assignedTo: assigneeName };
      }
      return lead;
    }));
    if (activeLeadDetail && activeLeadDetail.id === leadId) {
      setActiveLeadDetail(prev => ({ ...prev, assignedTo: assigneeName }));
    }

    if (isFirebaseConfigured()) {
      updateLeadAssigneeInFirebase(leadId, assigneeName).catch(console.error);
    }

    showToast(`Đã phân công ${assigneeName} phụ trách đơn ${leadId}`);
  };

  // Handle Delete Lead
  const handleDeleteLead = (leadId) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa yêu cầu liên hệ ${leadId}?`)) {
      setLeads(prev => prev.filter(l => l.id !== leadId));
      if (activeLeadDetail && activeLeadDetail.id === leadId) {
        setActiveLeadDetail(null);
      }

      if (isFirebaseConfigured()) {
        deleteLeadFromFirebase(leadId).catch(console.error);
      }

      showToast(`Đã xóa yêu cầu ${leadId}`);
    }
  };

  // Handle Add Note to Lead
  const handleAddNote = (leadId) => {
    if (!newNoteInput.trim()) return;

    const newNoteObj = {
      id: Date.now(),
      author: 'Quản trị viên',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      text: newNoteInput.trim()
    };

    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          notes: [...(lead.notes || []), newNoteObj]
        };
      }
      return lead;
    }));

    if (activeLeadDetail && activeLeadDetail.id === leadId) {
      setActiveLeadDetail(prev => ({
        ...prev,
        notes: [...(prev.notes || []), newNoteObj]
      }));
    }

    if (isFirebaseConfigured()) {
      addNoteToFirebaseLead(leadId, newNoteObj).catch(console.error);
    }

    setNewNoteInput('');
    showToast('Đã thêm ghi chú xử lý');
  };

  // Handle Create New Form Lead Submission
  const handleCreateNewLead = async (e) => {
    e.preventDefault();
    if (!newLeadForm.customerName.trim() || !newLeadForm.phone.trim()) {
      alert('Vui lòng nhập tên khách hàng và số điện thoại');
      return;
    }

    const matchedService = SERVICES_DATA.find(s => s.id === newLeadForm.serviceId);
    const newId = `FORM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLeadObj = {
      id: newId,
      customerName: newLeadForm.customerName.trim(),
      company: newLeadForm.company.trim() || 'Khách hàng cá nhân',
      phone: newLeadForm.phone.trim(),
      email: newLeadForm.email.trim() || 'Chưa cập nhật',
      serviceId: newLeadForm.serviceId,
      serviceName: matchedService ? matchedService.title : 'Dịch vụ DUDI',
      sourceUrl: matchedService ? matchedService.url : 'https://dudi.vn',
      budget: newLeadForm.budget.trim() || 'Thỏa thuận theo dự án',
      status: 'new',
      priority: newLeadForm.priority,
      assignedTo: 'Chưa phân công',
      createdAt: new Date().toISOString(),
      timeAgo: 'Vừa xong',
      requirements: newLeadForm.requirements.trim() || 'Khách hàng yêu cầu tư vấn gói dịch vụ.',
      notes: [
        {
          id: Date.now(),
          author: 'Hệ thống Form',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          text: `Tiếp nhận yêu cầu liên hệ mới cho ${matchedService?.title || 'Dịch vụ'}`
        }
      ]
    };

    setLeads(prev => [newLeadObj, ...prev]);

    if (isFirebaseConfigured()) {
      try {
        await addLeadToFirebase(newLeadObj);
      } catch (err) {
        console.error('Firebase save error:', err);
      }
    }

    setIsNewLeadModalOpen(false);
    setNewLeadForm({
      customerName: '',
      phone: '',
      email: '',
      company: '',
      serviceId: 'dudi-page',
      budget: '',
      priority: 'high',
      requirements: ''
    });
    showToast(`Đã tiếp nhận yêu cầu liên hệ mới [${newId}] từ ${newLeadObj.customerName}`);
  };

  // Handle Save Custom Firebase Config
  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    if (!firebaseConfigForm.apiKey.trim() || !firebaseConfigForm.projectId.trim()) {
      alert('Vui lòng nhập tối thiểu API Key và Project ID của Firebase');
      return;
    }

    saveCustomFirebaseConfig(firebaseConfigForm);
    setIsFirebaseLive(true);
    setIsFirebaseSettingsOpen(false);
    showToast('Đã lưu cấu hình Firebase! Đang kết nối Firestore Realtime...', 'success');

    // Subscribe to Firestore
    subscribeToLeads(
      (remoteLeads) => {
        if (remoteLeads && remoteLeads.length > 0) {
          setLeads(remoteLeads);
        }
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        showToast('Kết nối Firebase thất bại, vui lòng kiểm tra lại cấu hình', 'warning');
      }
    );
  };

  // Handle Export to CSV
  const handleExportCSV = () => {
    const headers = ['Mã Form', 'Thời gian', 'Họ tên khách hàng', 'Số điện thoại', 'Email', 'Công ty', 'Dịch vụ yêu cầu', 'Ngân sách', 'Trạng thái', 'Người phụ trách', 'Nội dung yêu cầu'];
    
    const rows = filteredLeads.map(l => [
      `"${l.id}"`,
      `"${l.timeAgo || l.createdAt}"`,
      `"${l.customerName || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${l.company || ''}"`,
      `"${l.serviceName || ''}"`,
      `"${l.budget || ''}"`,
      `"${LEAD_STATUS_CONFIG[l.status]?.label || l.status}"`,
      `"${l.assignedTo || ''}"`,
      `"${(l.requirements || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dudi_form_lien_he_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã tải xuống file CSV danh sách form liên hệ');
  };

  // Quick clear data / Refresh
  const handleResetData = () => {
    if (window.confirm('Bạn có muốn làm mới và xóa toàn bộ dữ liệu tạm trên thiết bị này?')) {
      setLeads([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      showToast('Đã làm mới và xóa sạch dữ liệu trên trình duyệt');
    }
  };

  return (
    <div className={`dashboard-root-layout lead-dashboard-mode ${isSidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      {/* Toast Notification */}
      {toast && (
        <div className={`dashboard-toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'warning' && <AlertTriangle size={18} />}
          </div>
          <span className="toast-text">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="dashboard-sidebar-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      {/* ================= LEFT SIDEBAR ================= */}
      <aside className={`dashboard-sidebar ${isMobileSidebarOpen ? 'mobile-drawer-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-inner">
          {/* Sidebar Top Header */}
          <div className="sidebar-brand-header">
            <div className="sidebar-brand-info">
              <div className="sidebar-brand-text">
                <span className="sidebar-brand-title">DUDI <span className="highlight">SOFTWARE</span></span>
                <span className="sidebar-brand-tagline">Hộp Thư & Form Khách Hàng</span>
              </div>
            </div>

            {/* Desktop Collapse Toggle */}
            <button 
              className="sidebar-toggle-btn hide-mobile"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? 'Mở rộng Sidebar' : 'Thu gọn Sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Mobile Close Button */}
            <button 
              className="sidebar-close-mobile show-mobile-only"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <div className="sidebar-nav-container">
            {/* 8 DUDI Services & All Inquiries */}
            <div className="sidebar-menu-section">
              <div className="section-label-row">
                <span className="sidebar-section-label">8 DỊCH VỤ DUDI SOFTWARE</span>
                <span className="services-count-tag">{SERVICES_DATA.length}</span>
              </div>
              
              <nav className="sidebar-menu-list">
                <button 
                  className={`sidebar-nav-item ${selectedServiceFilter === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedServiceFilter('all');
                    setSelectedStatusFilter('all');
                    if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
                  }}
                  title="Xem toàn bộ yêu cầu form từ tất cả dịch vụ"
                >
                  <Inbox size={17} className="nav-icon" />
                  <span className="nav-label">Tất Cả Yêu Cầu Form</span>
                  <span className="nav-badge-count">{leads.length}</span>
                </button>

                {SERVICES_DATA.map(service => {
                  const IconComp = SERVICE_ICONS[service.id] || Layers;
                  const isSelected = selectedServiceFilter === service.id;
                  const count = serviceCounts[service.id] || 0;

                  return (
                    <button 
                      key={service.id}
                      className={`sidebar-nav-item service-tab-item ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedServiceFilter(service.id);
                        if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
                      }}
                      title={`Xem form gửi từ: ${service.title}`}
                    >
                      <IconComp size={17} className="nav-icon" />
                      <span className="nav-label">{SERVICE_SHORT_LABELS[service.id] || service.title}</span>
                      {count > 0 && (
                        <span className="nav-badge-count">{count}</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= RIGHT MAIN LEAD MANAGEMENT AREA ================= */}
      <div className="dashboard-main-area lead-management-main">
        {/* Top Header Bar */}
        <header className="lead-main-header">
          <div className="lead-header-title-box">
            <button 
              className="btn-mobile-sidebar-toggle show-mobile-only"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="lead-header-title">
                {selectedServiceFilter === 'all'
                  ? 'Quản Lý Form Liên Hệ & Khách Hàng Tiềm Năng'
                  : `Form Liên Hệ: ${SERVICES_DATA.find(s => s.id === selectedServiceFilter)?.title || 'Dịch vụ'}`}
              </h1>
              <p className="lead-header-subtitle">
                Tiếp nhận và quản lý thông tin khách hàng gửi từ 8 hệ thống website dịch vụ DUDI
              </p>
            </div>
          </div>

          <div className="lead-header-actions">
            {/* Quick Test / New Lead button */}
            <button 
              className="btn-header-primary"
              onClick={() => setIsNewLeadModalOpen(true)}
              title="Mô phỏng khách hàng gửi form hoặc thêm lead mới"
            >
              <PlusCircle size={16} />
              <span>+ Tạo Yêu Cầu Mới</span>
            </button>

            {/* Export CSV button */}
            <button 
              className="btn-header-secondary"
              onClick={handleExportCSV}
              title="Xuất danh sách form liên hệ ra file Excel / CSV"
            >
              <FileSpreadsheet size={16} />
              <span className="hide-mobile">Xuất CSV</span>
            </button>

            {/* Reset / Reload Data button */}
            <button 
              className="btn-header-icon"
              onClick={handleResetData}
              title="Khôi phục dữ liệu form mẫu ban đầu"
            >
              <RefreshCw size={15} />
            </button>

            {/* Back to Home button */}
            <button 
              className="btn-header-secondary hide-mobile"
              onClick={onBackToHome}
              title="Quay lại trang chủ dịch vụ"
            >
              <Compass size={16} />
              <span>Về Trang Dịch Vụ</span>
            </button>
          </div>
        </header>

        {/* Filter, Search & View Controls Bar */}
        <div className="lead-toolbar-container">
          <div className="lead-search-box">
            <Search size={16} className="search-icon" />
            <input 
              type="text"
              placeholder="Tìm theo tên khách, SĐT, email, công ty, dịch vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="lead-search-input"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="lead-filters-group">
            {/* Filter by Status dropdown */}
            <div className="custom-select-wrapper">
              <select 
                value={selectedStatusFilter} 
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="lead-select-filter"
              >
                <option value="all">Tất Cả Trạng Thái</option>
                {Object.entries(LEAD_STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label} ({statusCounts[key] || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ================= CONTENT VIEW: TABLE OR KANBAN ================= */}
        {filteredLeads.length === 0 ? (
          <div className="empty-leads-state">
            <div className="empty-icon-box">
              <Inbox size={42} />
            </div>
            <h3>Không tìm thấy yêu cầu liên hệ nào phù hợp</h3>
            <p>Hãy thử thay đổi bộ lọc, từ khóa tìm kiếm hoặc bấm nút bên dưới để tạo yêu cầu mới.</p>
            <div className="empty-actions">
              <button 
                className="btn-header-primary"
                onClick={() => setIsNewLeadModalOpen(true)}
              >
                <PlusCircle size={16} />
                <span>+ Tạo Yêu Cầu Liên Hệ Mới</span>
              </button>
              <button 
                className="btn-header-secondary"
                onClick={() => {
                  setSelectedServiceFilter('all');
                  setSelectedStatusFilter('all');
                  setSearchQuery('');
                }}
              >
                Xóa Bộ Lọc
              </button>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* ================= TABLE VIEW ================= */
          <div className="leads-table-card-wrapper">
            <div className="table-responsive">
              <table className="leads-data-table">
                <thead>
                  <tr>
                    <th>MÃ & NGÀY GỬI</th>
                    <th>KHÁCH HÀNG / CÔNG TY</th>
                    <th>LIÊN HỆ TRỰC TIẾP</th>
                    <th>DỊCH VỤ YÊU CẦU</th>
                    <th>NGÂN SÁCH</th>
                    <th>TRẠNG THÁI XỬ LÝ</th>
                    <th>PHÂN CÔNG</th>
                    <th className="text-right">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => {
                    const statusCfg = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.new;

                    return (
                      <tr key={lead.id} className="lead-table-row">
                        {/* ID & Date */}
                        <td>
                          <div className="lead-id-cell">
                            <span className="lead-code">{lead.id}</span>
                            <span className="lead-time">
                              {lead.timeAgo || (lead.createdAt ? new Date(lead.createdAt).toLocaleString('vi-VN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Vừa xong')}
                            </span>
                          </div>
                        </td>

                        {/* Customer & Company */}
                        <td>
                          <div className="lead-customer-cell">
                            <div className="customer-avatar-badge">
                              {((lead.customerName || lead.fullName || lead.name || 'K')[0] || 'K').toUpperCase()}
                            </div>
                            <div className="customer-name-box">
                              <span className="customer-full-name">{lead.customerName || lead.fullName || lead.name || 'Khách hàng'}</span>
                              <span className="customer-company-name">
                                <Building size={12} />
                                {lead.company || lead.companyName || 'Khách cá nhân'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info (Quick Call & Zalo) */}
                        <td>
                          <div className="lead-contact-cell">
                            <div className="contact-phone-row">
                              <a href={`tel:${lead.phone}`} className="phone-link" title="Bấm để gọi điện">
                                <Phone size={13} className="text-blue" />
                                <span>{lead.phone || 'Chưa cung cấp'}</span>
                              </a>
                              {lead.phone && (
                                <a 
                                  href={`https://zalo.me/${String(lead.phone).replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="zalo-shortcut-tag"
                                  title="Mở chat Zalo với khách hàng này"
                                >
                                  Zalo
                                </a>
                              )}
                            </div>
                            {lead.email && lead.email !== 'Chưa cập nhật' && (
                              <a href={`mailto:${lead.email}`} className="email-link" title="Gửi email">
                                <Mail size={12} />
                                <span>{lead.email}</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Service Requested */}
                        <td>
                          <div className="lead-service-cell">
                            <span className="service-title-text">{lead.serviceName || lead.service || 'Website Doanh Nghiệp'}</span>
                            {lead.sourceUrl && (
                              <a 
                                href={lead.sourceUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="source-web-link"
                                title="Xem trang web nguồn khách gửi form"
                              >
                                <span>Xem trang</span>
                                <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Budget */}
                        <td>
                          <span className="lead-budget-tag">
                            {lead.budget || 'Thỏa thuận'}
                          </span>
                        </td>

                        {/* Status Dropdown */}
                        <td>
                          <div className="status-dropdown-wrapper">
                            <select 
                              value={lead.status}
                              onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                              className={`status-select-pill ${statusCfg.badgeClass}`}
                            >
                              {Object.entries(LEAD_STATUS_CONFIG).map(([sKey, sVal]) => (
                                <option key={sKey} value={sKey}>
                                  {sVal.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* Assignee */}
                        <td>
                          <select 
                            value={lead.assignedTo || 'Chưa phân công'}
                            onChange={(e) => handleUpdateAssignee(lead.id, e.target.value)}
                            className="assignee-select"
                          >
                            <option value="Chưa phân công">Chưa phân công</option>
                            {TECH_TEAM.map(t => (
                              <option key={t.id} value={t.name}>{t.name}</option>
                            ))}
                          </select>
                        </td>

                        {/* Action buttons */}
                        <td className="text-right">
                          <div className="table-actions-group">
                            <button 
                              className="btn-table-action view-btn"
                              onClick={() => setActiveLeadDetail(lead)}
                              title="Xem chi tiết toàn bộ thông tin & ghi chú"
                            >
                              <Eye size={15} />
                              <span>Chi tiết</span>
                            </button>
                            <button 
                              className="btn-table-action delete-btn"
                              onClick={() => handleDeleteLead(lead.id)}
                              title="Xóa yêu cầu này"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ================= KANBAN VIEW ================= */
          <div className="lead-kanban-board">
            {Object.entries(LEAD_STATUS_CONFIG).map(([statusKey, statusConfig]) => {
              const columnLeads = filteredLeads.filter(l => l.status === statusKey);

              return (
                <div key={statusKey} className="kanban-column">
                  <div className="kanban-column-header" style={{ borderTopColor: statusConfig.color }}>
                    <div className="kanban-header-left">
                      <span className="status-dot-indicator" style={{ backgroundColor: statusConfig.color }}></span>
                      <h4 className="kanban-title">{statusConfig.label}</h4>
                    </div>
                    <span className="kanban-count-pill">{columnLeads.length}</span>
                  </div>

                  <div className="kanban-cards-list">
                    {columnLeads.length === 0 ? (
                      <div className="kanban-empty-col">Không có yêu cầu nào</div>
                    ) : (
                      columnLeads.map(lead => (
                        <div key={lead.id} className="kanban-lead-card">
                          <div className="kanban-card-top">
                            <span className="kanban-lead-id">{lead.id}</span>
                            <span className="kanban-time">{lead.timeAgo}</span>
                          </div>

                          <h5 className="kanban-customer-name">{lead.customerName}</h5>
                          <span className="kanban-company-name">
                            <Building size={11} /> {lead.company}
                          </span>

                          <div className="kanban-service-tag">
                            {lead.serviceName}
                          </div>

                          <div className="kanban-budget-row">
                            <span className="kanban-budget-val">{lead.budget}</span>
                          </div>

                          <div className="kanban-card-footer">
                            <div className="kanban-quick-contacts">
                              <a href={`tel:${lead.phone}`} className="kanban-icon-btn" title="Gọi điện">
                                <Phone size={13} />
                              </a>
                              <a 
                                href={`https://zalo.me/${lead.phone.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="kanban-zalo-btn" 
                                title="Zalo"
                              >
                                Zalo
                              </a>
                            </div>

                            <button 
                              className="kanban-detail-btn"
                              onClick={() => setActiveLeadDetail(lead)}
                            >
                              Chi tiết
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= LEAD DETAIL MODAL / DRAWER ================= */}
      {activeLeadDetail && (
        <div className="lead-modal-backdrop" onClick={() => setActiveLeadDetail(null)}>
          <div className="lead-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="lead-modal-header">
              <div className="lead-modal-header-left">
                <span className="modal-badge-id">{activeLeadDetail.id}</span>
                <h3 className="modal-lead-title">{activeLeadDetail.customerName}</h3>
                <span className={`modal-status-badge ${LEAD_STATUS_CONFIG[activeLeadDetail.status]?.badgeClass}`}>
                  {LEAD_STATUS_CONFIG[activeLeadDetail.status]?.label}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveLeadDetail(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="lead-modal-body">
              {/* Quick Communication Actions */}
              <div className="modal-quick-actions-bar">
                <a 
                  href={`tel:${activeLeadDetail.phone}`} 
                  className="btn-action-call"
                  title="Gọi điện ngay cho khách"
                >
                  <Phone size={16} />
                  <span>Gọi {activeLeadDetail.phone}</span>
                </a>

                <a 
                  href={`https://zalo.me/${activeLeadDetail.phone.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-action-zalo"
                  title="Mở Zalo chat"
                >
                  <MessageSquare size={16} />
                  <span>Chat Zalo</span>
                </a>

                {activeLeadDetail.email && (
                  <a 
                    href={`mailto:${activeLeadDetail.email}`} 
                    className="btn-action-email"
                    title="Gửi Email"
                  >
                    <Mail size={16} />
                    <span>Gửi Email</span>
                  </a>
                )}

                {activeLeadDetail.sourceUrl && (
                  <a 
                    href={activeLeadDetail.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-action-web"
                    title="Xem trang web nguồn"
                  >
                    <ExternalLink size={15} />
                    <span>Trang Nguồn</span>
                  </a>
                )}
              </div>

              {/* Grid 2 Columns Info */}
              <div className="modal-info-grid-2">
                {/* Left Column: Customer & Project Details */}
                <div className="modal-info-block">
                  <h4 className="info-block-heading">Thông Tin Khách Hàng & Nhu Cầu</h4>
                  
                  <div className="detail-rows-list">
                    <div className="detail-row">
                      <span className="detail-label">Công ty / Tổ chức:</span>
                      <span className="detail-value">{activeLeadDetail.company || 'Khách cá nhân'}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Dịch vụ yêu cầu:</span>
                      <span className="detail-value font-bold text-blue">
                        {activeLeadDetail.serviceName}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Ngân sách dự kiến:</span>
                      <span className="detail-value font-bold text-red">
                        {activeLeadDetail.budget || 'Thỏa thuận'}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Thời gian gửi:</span>
                      <span className="detail-value">{activeLeadDetail.timeAgo} ({activeLeadDetail.createdAt ? new Date(activeLeadDetail.createdAt).toLocaleString('vi-VN') : 'Gần đây'})</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Mức độ ưu tiên:</span>
                      <span className="detail-value">
                        {activeLeadDetail.priority === 'high' ? '🔥 Ưu tiên cao' : 'Bình thường'}
                      </span>
                    </div>
                  </div>

                  <div className="detail-requirements-box">
                    <span className="req-box-title">Nội Dung Yêu Cầu Chi Tiết:</span>
                    <p className="req-box-text">
                      {activeLeadDetail.requirements || 'Chưa có mô tả cụ thể.'}
                    </p>
                  </div>
                </div>

                {/* Right Column: Processing & Notes */}
                <div className="modal-info-block">
                  <h4 className="info-block-heading">Trạng Thái & Phân Công Xử Lý</h4>

                  <div className="form-control-row">
                    <label>Trạng thái đơn hàng:</label>
                    <select 
                      value={activeLeadDetail.status}
                      onChange={(e) => handleUpdateStatus(activeLeadDetail.id, e.target.value)}
                      className="modal-select-input"
                    >
                      {Object.entries(LEAD_STATUS_CONFIG).map(([sKey, sCfg]) => (
                        <option key={sKey} value={sKey}>{sCfg.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control-row">
                    <label>Kỹ sư / Nhân sự phụ trách:</label>
                    <select 
                      value={activeLeadDetail.assignedTo || 'Chưa phân công'}
                      onChange={(e) => handleUpdateAssignee(activeLeadDetail.id, e.target.value)}
                      className="modal-select-input"
                    >
                      <option value="Chưa phân công">Chưa phân công</option>
                      {TECH_TEAM.map(t => (
                        <option key={t.id} value={t.name}>{t.name} ({t.role})</option>
                      ))}
                    </select>
                  </div>

                  {/* Notes & History Log */}
                  <div className="lead-notes-history-section">
                    <span className="notes-heading">Nhật Ký & Ghi Chú Trao Đổi ({activeLeadDetail.notes?.length || 0})</span>
                    
                    <div className="notes-list-scroll">
                      {(activeLeadDetail.notes || []).map(note => (
                        <div key={note.id} className="note-item-bubble">
                          <div className="note-bubble-header">
                            <span className="note-author">{note.author}</span>
                            <span className="note-time">{note.time}</span>
                          </div>
                          <p className="note-text">{note.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="add-note-input-row">
                      <input 
                        type="text"
                        placeholder="Thêm ghi chú cuộc gọi, hẹn gặp, báo giá..."
                        value={newNoteInput}
                        onChange={(e) => setNewNoteInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddNote(activeLeadDetail.id);
                          }
                        }}
                        className="modal-note-input"
                      />
                      <button 
                        className="btn-add-note"
                        onClick={() => handleAddNote(activeLeadDetail.id)}
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lead-modal-footer">
              <button 
                className="btn-modal-delete"
                onClick={() => handleDeleteLead(activeLeadDetail.id)}
              >
                <Trash2 size={15} />
                <span>Xóa Yêu Cầu</span>
              </button>
              <button 
                className="btn-modal-close"
                onClick={() => setActiveLeadDetail(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / TEST NEW LEAD SUBMISSION ================= */}
      {isNewLeadModalOpen && (
        <div className="lead-modal-backdrop" onClick={() => setIsNewLeadModalOpen(false)}>
          <div className="lead-modal-container modal-new-lead" onClick={(e) => e.stopPropagation()}>
            <div className="lead-modal-header">
              <div className="lead-modal-header-left">
                <Sparkles size={20} className="text-blue" />
                <h3 className="modal-lead-title">Tạo / Thử Nghiệm Gửi Form Liên Hệ</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsNewLeadModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNewLead}>
              <div className="lead-modal-body">
                <p className="new-lead-helper-text">
                  Điền thông tin bên dưới để tiếp nhận một yêu cầu liên hệ mới từ khách hàng hoặc giả lập người dùng gửi form từ 1 trong 8 trang dịch vụ.
                </p>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Họ và tên khách hàng <span className="text-red">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ví dụ: Nguyễn Văn Nam"
                      value={newLeadForm.customerName}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, customerName: e.target.value })}
                      className="modal-text-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số điện thoại liên hệ <span className="text-red">*</span></label>
                    <input 
                      type="tel" 
                      required
                      placeholder="Ví dụ: 0912 345 678"
                      value={newLeadForm.phone}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                      className="modal-text-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Địa chỉ Email</label>
                    <input 
                      type="email" 
                      placeholder="nam.nguyen@company.vn"
                      value={newLeadForm.email}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                      className="modal-text-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tên công ty / Doanh nghiệp</label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Cty TNHH Giải Pháp Nam Việt"
                      value={newLeadForm.company}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                      className="modal-text-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dịch vụ khách hàng chọn <span className="text-red">*</span></label>
                    <select 
                      value={newLeadForm.serviceId}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, serviceId: e.target.value })}
                      className="modal-text-input"
                    >
                      {SERVICES_DATA.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ngân sách dự kiến</label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: 10.000.000đ - 20.000.000đ"
                      value={newLeadForm.budget}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, budget: e.target.value })}
                      className="modal-text-input"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Nội dung chi tiết yêu cầu / mô tả dự án</label>
                  <textarea 
                    rows={3}
                    placeholder="Mô tả cụ thể tính năng, deadline, yêu cầu kỹ thuật hoặc câu hỏi của khách hàng..."
                    value={newLeadForm.requirements}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, requirements: e.target.value })}
                    className="modal-textarea"
                  />
                </div>
              </div>

              <div className="lead-modal-footer">
                <button 
                  type="button" 
                  className="btn-modal-close"
                  onClick={() => setIsNewLeadModalOpen(false)}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn-header-primary"
                >
                  <Check size={16} />
                  <span>Gửi Form & Nhận Ngay Vào Dashboard</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: FIREBASE FIRESTORE SETTINGS ================= */}
      {isFirebaseSettingsOpen && (
        <div className="lead-modal-backdrop" onClick={() => setIsFirebaseSettingsOpen(false)}>
          <div className="lead-modal-container modal-firebase-settings" onClick={(e) => e.stopPropagation()}>
            <div className="lead-modal-header">
              <div className="lead-modal-header-left">
                <Flame size={22} className="text-orange" />
                <h3 className="modal-lead-title">Cấu Hình Firebase Firestore Realtime</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsFirebaseSettingsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFirebaseConfig}>
              <div className="lead-modal-body">
                <div className="firebase-instruction-box">
                  <span className="inst-title">📌 Cách lấy thông tin kết nối Firebase:</span>
                  <ol className="inst-steps">
                    <li>Truy cập <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">Firebase Console</a> và tạo 1 Project mới.</li>
                    <li>Vào <strong>Build &gt; Firestore Database</strong> &gt; Tạo Database (chọn chế độ <em>Test mode</em>).</li>
                    <li>Vào <strong>Project Settings</strong> &gt; kéo xuống mục <em>Your apps</em> &gt; thêm Web App để lấy đoạn mã cấu hình.</li>
                    <li>Dán các giá trị tương ứng vào biểu mẫu bên dưới:</li>
                  </ol>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">API Key <span className="text-red">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="AIzaSy..."
                      value={firebaseConfigForm.apiKey}
                      onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, apiKey: e.target.value })}
                      className="modal-text-input font-mono"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Project ID <span className="text-red">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="dudi-leads-prod"
                      value={firebaseConfigForm.projectId}
                      onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, projectId: e.target.value })}
                      className="modal-text-input font-mono"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Auth Domain</label>
                    <input 
                      type="text" 
                      placeholder="dudi-leads-prod.firebaseapp.com"
                      value={firebaseConfigForm.authDomain}
                      onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, authDomain: e.target.value })}
                      className="modal-text-input font-mono"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Storage Bucket</label>
                    <input 
                      type="text" 
                      placeholder="dudi-leads-prod.appspot.com"
                      value={firebaseConfigForm.storageBucket}
                      onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, storageBucket: e.target.value })}
                      className="modal-text-input font-mono"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Messaging Sender ID</label>
                    <input 
                      type="text" 
                      placeholder="123456789012"
                      value={firebaseConfigForm.messagingSenderId}
                      onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, messagingSenderId: e.target.value })}
                      className="modal-text-input font-mono"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">App ID</label>
                    <input 
                      type="text" 
                      placeholder="1:123456789012:web:abcdef..."
                      value={firebaseConfigForm.appId}
                      onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, appId: e.target.value })}
                      className="modal-text-input font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="lead-modal-footer">
                <button 
                  type="button" 
                  className="btn-modal-close"
                  onClick={() => setIsFirebaseSettingsOpen(false)}
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="btn-header-primary"
                >
                  <Check size={16} />
                  <span>Lưu & Kết Nối Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
