// DUDI Contact Form & Lead Submissions Central Data

export const LEAD_STATUS_CONFIG = {
  new: {
    label: 'Mới Tiếp Nhận',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    badgeClass: 'badge-status-new'
  },
  in_progress: {
    label: 'Đang Tư Vấn',
    color: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
    badgeClass: 'badge-status-progress'
  },
  quoted: {
    label: 'Đã Báo Giá',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    badgeClass: 'badge-status-quoted'
  },
  completed: {
    label: 'Đã Chốt Hợp Đồng',
    color: '#10b981',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    badgeClass: 'badge-status-completed'
  },
  cancelled: {
    label: 'Hủy / Spam',
    color: '#64748b',
    bg: '#f1f5f9',
    border: '#e2e8f0',
    badgeClass: 'badge-status-cancelled'
  }
};

// Clean empty array for real leads
export const INITIAL_LEADS = [];

export const TECH_TEAM = [
  { id: 'TECH-01', name: 'Nguyễn Thành Dũng', role: 'Lead Fullstack' },
  { id: 'TECH-02', name: 'Trần Văn Đức', role: 'Senior Frontend & UI' },
  { id: 'TECH-03', name: 'Lê Minh Quân', role: 'SEO & Speed Optimizer' },
  { id: 'TECH-04', name: 'Vũ Quốc Huy', role: 'Mobile Apps & DevOps' }
];
