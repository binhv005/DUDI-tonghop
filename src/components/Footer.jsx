import React from 'react';
import { FileText, MapPin, Phone, Mail, MessageSquare, ShieldCheck, ArrowUp } from 'lucide-react';

export const Footer = ({ onScrollToTop }) => {
  const handleBackToTop = (e) => {
    e.preventDefault();
    if (onScrollToTop) {
      onScrollToTop();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer dark-footer">
      <div className="container">
        <div className="footer-top">
          {/* Column 1: Company Info */}
          <div className="footer-col footer-col-company">
            <div className="footer-brand-header">
              <div className="brand-logo-badge">
                <span className="logo-badge-title">DUDI</span>
                <span className="logo-badge-sub">software</span>
              </div>
              <span className="brand-name-light">
                DUDI <span className="brand-highlight">Software</span>
              </span>
            </div>

            <h3 className="company-full-name">
              Công ty TNHH Giải Pháp Phần Mềm DUDI
            </h3>

            <p className="company-desc">
              Đơn vị cung cấp giải pháp bảo trì ứng dụng chuyên nghiệp theo tháng, giúp doanh nghiệp duy trì tính ổn định và tuân thủ tiêu chuẩn Store.
            </p>

            <div className="company-meta-list">
              <div className="company-meta-item">
                <FileText size={16} className="meta-icon-red" />
                <span>Mã số thuế: <strong className="highlight-code">0319641544</strong></span>
              </div>
              <div className="company-meta-item">
                <MapPin size={16} className="meta-icon-red" />
                <span>Địa chỉ: 49/2 Đường 14, Phường Thủ Đức, Thành phố Hồ Chí Minh</span>
              </div>
            </div>
          </div>

          {/* Column 2: Direct Contacts */}
          <div className="footer-col footer-col-contacts">
            <h4 className="footer-col-title">LIÊN HỆ TRỰC TIẾP</h4>
            
            <div className="contact-cards-list">
              <a href="tel:0909163821" className="contact-card-box">
                <div className="contact-icon-wrapper">
                  <Phone size={17} className="contact-icon-red" />
                </div>
                <span className="contact-card-text">Hotline: 0909 163 821</span>
              </a>

              <a href="mailto:contact@dudisoftware.com" className="contact-card-box">
                <div className="contact-icon-wrapper">
                  <Mail size={17} className="contact-icon-red" />
                </div>
                <span className="contact-card-text">contact@dudisoftware.com</span>
              </a>

              <a href="https://zalo.me/0909163821" target="_blank" rel="noopener noreferrer" className="contact-card-box">
                <div className="contact-icon-wrapper">
                  <MessageSquare size={17} className="contact-icon-red" />
                </div>
                <span className="contact-card-text">Zalo OA: 0909 163 821</span>
              </a>
            </div>
          </div>

          {/* Column 3: Terms & Transparency */}
          <div className="footer-col footer-col-terms">
            <h4 className="footer-col-title">ĐIỀU KHOẢN & MINH BẠCH</h4>

            <ul className="terms-bullet-list">
              <li><span className="red-bullet">•</span> Minh bạch phạm vi theo hợp đồng</li>
              <li><span className="red-bullet">•</span> Nghiệm thu theo từng mốc kỹ thuật</li>
              <li><span className="red-bullet">•</span> Hỗ trợ xử lý lỗi phát sinh sau bàn giao</li>
              <li><span className="red-bullet">•</span> Bảo mật thông tin khách hàng</li>
            </ul>

            <button 
              type="button" 
              className="btn-back-to-top" 
              onClick={handleBackToTop}
            >
              <ArrowUp size={16} />
              <span>Về đầu trang</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            Copyright &copy; 2026 <strong>DUDI Software</strong>. All rights reserved.
          </p>

          <div className="verified-badge">
            <ShieldCheck size={16} className="text-emerald" />
            <span>Thông tin đăng ký kinh doanh chính thức</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
