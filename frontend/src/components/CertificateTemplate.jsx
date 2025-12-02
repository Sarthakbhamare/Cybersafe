import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * Modern Certificate Template - Forage-inspired Design
 * CRITICAL: Uses ONLY inline styles (no Tailwind classes) for html2canvas compatibility
 */
const CertificateTemplate = forwardRef(({ certificateData }, ref) => {
  if (!certificateData) return null;

  const gradeConfig = {
    Distinction: { 
      accent: "#9333ea",
      gradient: "linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #f97316 100%)",
      gradientAlt: "linear-gradient(45deg, #9333ea 0%, #ec4899 50%, #f97316 100%)",
      gradientText: "linear-gradient(90deg, #9333ea 0%, #ec4899 50%, #f97316 100%)",
      bg: "#faf5ff",
      textColor: "#7e22ce"
    },
    Merit: { 
      accent: "#2563eb",
      gradient: "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",
      gradientAlt: "linear-gradient(45deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",
      gradientText: "linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",
      bg: "#eff6ff",
      textColor: "#1d4ed8"
    },
    Pass: { 
      accent: "#059669",
      gradient: "linear-gradient(135deg, #059669 0%, #14b8a6 50%, #06b6d4 100%)",
      gradientAlt: "linear-gradient(45deg, #059669 0%, #14b8a6 50%, #06b6d4 100%)",
      gradientText: "linear-gradient(90deg, #059669 0%, #14b8a6 50%, #06b6d4 100%)",
      bg: "#ecfdf5",
      textColor: "#047857"
    },
  };

  const config = gradeConfig[certificateData.grade] || gradeConfig.Pass;

  return (
    <div
      ref={ref}
      style={{
        width: "1123px",
        height: "794px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Modern gradient background */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)'
        }}
      />
      
      {/* Decorative gradient accent - top right */}
      <div 
        style={{
          position: 'absolute',
          top: '-160px',
          right: '-160px',
          width: '384px',
          height: '384px',
          borderRadius: '9999px',
          filter: 'blur(96px)',
          opacity: 0.2,
          background: config.gradient
        }}
      />
      
      {/* Decorative gradient accent - bottom left */}
      <div 
        style={{
          position: 'absolute',
          bottom: '-160px',
          left: '-160px',
          width: '384px',
          height: '384px',
          borderRadius: '9999px',
          filter: 'blur(96px)',
          opacity: 0.15,
          background: config.gradientAlt
        }}
      />

      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', padding: '64px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '48px' }}>
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                background: config.gradient
              }}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '36px', height: '36px', color: '#ffffff' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>CyberSafe</div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Cybersecurity Training</div>
            </div>
          </div>

          {/* Certificate ID */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Certificate ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>{certificateData.id}</div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingLeft: '48px', paddingRight: '48px' }}>
          {/* Title */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', fontWeight: 'bold', marginBottom: '12px' }}>Certificate of Completion</div>
            <h1 style={{ fontSize: '60px', fontWeight: 'bold', color: '#111827', marginBottom: '24px', lineHeight: '1.1' }}>
              Cybersecurity<br />Professional
            </h1>
          </div>

          {/* Recipient */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', marginBottom: '12px' }}>This is to certify that</div>
            <div 
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '24px',
                background: config.gradientText,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {certificateData.holderName}
            </div>
          </div>

          {/* Description */}
          <div style={{ maxWidth: '672px', marginBottom: '40px' }}>
            <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.625' }}>
              has successfully completed the <strong style={{ color: '#111827' }}>CyberSafe Certification Program</strong>,
              demonstrating comprehensive knowledge of cybersecurity fundamentals, threat detection,
              and digital safety best practices.
            </p>
          </div>

          {/* Metrics Grid */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '40px' }}>
            <div 
              style={{ 
                padding: '16px 32px',
                borderRadius: '16px',
                border: `2px solid ${config.accent}`,
                backgroundColor: config.bg
              }}
            >
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '4px', color: config.accent }}>{certificateData.grade}</div>
              <div style={{ fontSize: '12px', color: '#4b5563', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grade Achieved</div>
            </div>
            
            <div style={{ padding: '16px 32px', borderRadius: '16px', backgroundColor: '#f9fafb', border: '2px solid #e5e7eb' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>{certificateData.score}%</div>
              <div style={{ fontSize: '12px', color: '#4b5563', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Final Score</div>
            </div>
            
            <div style={{ padding: '16px 32px', borderRadius: '16px', backgroundColor: '#f9fafb', border: '2px solid #e5e7eb' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>{certificateData.correctCount}/{certificateData.totalQuestions}</div>
              <div style={{ fontSize: '12px', color: '#4b5563', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Correct Answers</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: '32px', borderTop: '2px solid #f3f4f6' }}>
          {/* Left: Signature */}
          <div>
            <div 
              style={{ 
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '8px',
                fontFamily: "'Brush Script MT', cursive",
                background: config.gradientText,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              CyberSafe Team
            </div>
            <div style={{ width: '192px', height: '1px', backgroundColor: '#e5e7eb', marginBottom: '8px' }} />
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Program Director</div>
          </div>

          {/* Center: Dates */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500', marginBottom: '4px' }}>Issue Date</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '12px' }}>{certificateData.issueDate}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500', marginBottom: '4px' }}>Expiry Date</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>{certificateData.expiryDate}</div>
          </div>

          {/* Right: QR Code */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', padding: '8px', backgroundColor: '#ffffff', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
              <QRCodeSVG 
                value={certificateData.verificationUrl} 
                size={80}
                level="H"
                includeMargin={false}
              />
            </div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '8px', fontWeight: '500' }}>Verify Certificate</div>
          </div>
        </div>

        {/* Watermark */}
        <div 
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: '#9ca3af',
            opacity: 0.5,
            fontWeight: '500'
          }}
        >
          CyberSafe • Attempt #{certificateData.attemptNumber}
        </div>
      </div>
    </div>
  );
});

CertificateTemplate.displayName = "CertificateTemplate";

export default CertificateTemplate;
