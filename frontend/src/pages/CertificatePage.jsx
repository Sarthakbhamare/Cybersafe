import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCertificateData, getCertificationStatus } from "../utils/certification";
import CertificateTemplate from "../components/CertificateTemplate";
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from "jspdf";
import InlineLoader from "../components/InlineLoader.jsx";
import { useLoading } from "../context/LoadingContext.jsx";
import Button from "../components/ui/Button.jsx";
import { ArrowUturnLeftIcon, DocumentArrowDownIcon, PhotoIcon, PrinterIcon, LinkIcon, ShareIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

const CertificatePage = () => {
  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #certificate-container,
        #certificate-container * {
          visibility: visible;
        }
        #certificate-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        @page {
          size: landscape;
          margin: 0;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const navigate = useNavigate();
  const certificateRef = useRef(null);
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { withLoading } = useLoading();

  useEffect(() => {
    const { isCertified, certificate } = getCertificationStatus();
    
    if (!isCertified) {
      navigate('/student-dashboard');
      return;
    }

    const data = getCertificateData();
    setCertificateData(data);
    setLoading(false);
  }, [navigate]);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || downloading) return;
    setDownloading(true);
    await withLoading(async () => {
      try {
        const element = certificateRef.current;
        const dataUrl = await toPng(element, {
          quality: 1.0,
          pixelRatio: 2,
          width: 1123,
          height: 794,
          cacheBust: true,
          skipFonts: false,
        });
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [1123, 794],
          compress: true,
        });
        pdf.addImage(dataUrl, "PNG", 0, 0, 1123, 794, "", "FAST");
        const filename = `CyberSafe-Certificate-${certificateData.id}.pdf`;
        pdf.save(filename);
        alert("✅ Certificate downloaded as PDF!");
      } catch (error) {
        console.error("Error downloading PDF:", error);
        alert(`❌ Error downloading PDF: ${error.message}`);
      } finally {
        setDownloading(false);
      }
    }, "Generating secure PDF", "Optimizing certificate for download");
  };

  const handleDownloadPNG = async () => {
    if (!certificateRef.current || downloading) return;
    setDownloading(true);
    await withLoading(async () => {
      try {
        const element = certificateRef.current;
        const dataUrl = await toPng(element, {
          quality: 1.0,
          pixelRatio: 3,
          width: 1123,
          height: 794,
          cacheBust: true,
          skipFonts: false,
        });
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const filename = `CyberSafe-Certificate-${certificateData.id}.png`;
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        alert("✅ Certificate downloaded as PNG!");
      } catch (error) {
        console.error("Error downloading PNG:", error);
        alert(`❌ Error downloading PNG: ${error.message}`);
      } finally {
        setDownloading(false);
      }
    }, "Generating high-res image", "Preparing certificate pixels");
  };

  const handleShareLinkedIn = () => {
    // LinkedIn's new sharing API - opens composer with URL
    // Note: LinkedIn doesn't allow pre-filling text via URL parameters anymore
    // Users need to manually add their own message
    const url = encodeURIComponent(certificateData.verificationUrl);
    
    // Copy the suggested text to clipboard for user convenience
    navigator.clipboard.writeText(certificateData.linkedInShareText).then(() => {
      alert('📋 LinkedIn post text copied to clipboard!\n\nThe LinkedIn composer will open. Paste (Ctrl+V) the text from your clipboard to share your achievement.');
      
      // Open LinkedIn share dialog
      window.open(
        `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent('Check out my CyberSafe Certification! ' + certificateData.verificationUrl)}`,
        '_blank',
        'width=800,height=600'
      );
    }).catch(() => {
      // Fallback if clipboard fails
      window.open(
        `https://www.linkedin.com/feed/?shareActive=true`,
        '_blank',
        'width=800,height=600'
      );
    });
  };

  const handleCopyVerificationUrl = () => {
    navigator.clipboard.writeText(certificateData.verificationUrl);
    alert('✅ Verification URL copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <InlineLoader message="Loading your certificate..." />
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-700 mb-4 font-semibold">Certificate not found</p>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const gradeColor = 
    certificateData.grade === 'Distinction' ? 'from-purple-600 to-pink-600' :
    certificateData.grade === 'Merit' ? 'from-blue-600 to-indigo-600' :
    'from-green-600 to-emerald-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Actions Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
          {/* Primary */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/student-dashboard')}
            leftIcon={<ArrowUturnLeftIcon className="h-5 w-5" />}
          >Back to Dashboard</Button>

          <Button
            variant="gradient"
            size="sm"
            onClick={handleDownloadPDF}
            loading={downloading}
            leftIcon={<DocumentArrowDownIcon className="h-5 w-5" />}
          >Download PDF</Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadPNG}
            loading={downloading}
            leftIcon={<PhotoIcon className="h-5 w-5" />}
          >Download Image</Button>

          {/* Tertiary group - collapsible on small screens */}
          <div className="hidden sm:flex gap-3">
            <Button size="sm" variant="outline" onClick={handlePrint} leftIcon={<PrinterIcon className="h-5 w-5" />}>Print</Button>
            <Button size="sm" variant="info" onClick={handleShareLinkedIn} leftIcon={<ShareIcon className="h-5 w-5" />}>LinkedIn</Button>
            <Button size="sm" variant="outline" onClick={handleCopyVerificationUrl} leftIcon={<LinkIcon className="h-5 w-5" />}>Copy Link</Button>
          </div>

          {/* Compact menu on small screens */}
          <div className="sm:hidden">
            <details className="relative">
              <summary className="list-none">
                <Button size="sm" variant="outline" leftIcon={<EllipsisHorizontalIcon className="h-5 w-5" />}>More</Button>
              </summary>
              <div className="absolute z-20 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <button onClick={handlePrint} className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                  <PrinterIcon className="h-5 w-5" /> Print
                </button>
                <button onClick={handleShareLinkedIn} className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                  <ShareIcon className="h-5 w-5" /> LinkedIn
                </button>
                <button onClick={handleCopyVerificationUrl} className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" /> Copy Link
                </button>
              </div>
            </details>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="flex justify-center mb-8" id="certificate-container">
          <div className="inline-block shadow-2xl rounded-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
            <CertificateTemplate ref={certificateRef} certificateData={certificateData} />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span>
              <span>Certificate Details</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Holder Name</span>
                <span className="font-semibold text-gray-900">{certificateData.holderName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Certificate ID</span>
                <span className="font-mono text-indigo-600">{certificateData.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Final Score</span>
                <span className="font-semibold text-gray-900">{certificateData.score}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Grade</span>
                <span className="font-semibold text-gray-900">{certificateData.grade}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Issue Date</span>
                <span className="font-semibold text-gray-900">{certificateData.formattedIssueDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Expiry Date</span>
                <span className="font-semibold text-gray-900">{certificateData.formattedExpiryDate}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Attempt Number</span>
                <span className="font-semibold text-gray-900">#{certificateData.attemptNumber}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💼</span>
              <span>Share & Verify</span>
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span>💼</span>
                  <span>LinkedIn Integration</span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Add this certification to your LinkedIn profile to showcase your cybersecurity expertise to employers and peers.
                </p>
                <button
                  onClick={handleShareLinkedIn}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  Share on LinkedIn
                </button>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <span>✅</span>
                  <span>Verification</span>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  Anyone can verify the authenticity of your certificate using the verification URL:
                </p>
                <div className="p-2 bg-white rounded border border-green-300 text-xs font-mono text-gray-700 break-all mb-2">
                  {certificateData.verificationUrl}
                </div>
                <button
                  onClick={handleCopyVerificationUrl}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                >
                  Copy Verification Link
                </button>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <span>📄</span>
                  <span>Resume Ready</span>
                </div>
                <p className="text-sm text-purple-700">
                  Add this certification to your resume under "Certifications" or "Professional Development" to demonstrate your commitment to cybersecurity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LinkedIn Share Preview */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📝</span>
            <span>LinkedIn Post Preview</span>
          </h3>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-700 whitespace-pre-line">{certificateData.linkedInShareText}</p>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            This text will be pre-filled when you click "Share on LinkedIn"
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
