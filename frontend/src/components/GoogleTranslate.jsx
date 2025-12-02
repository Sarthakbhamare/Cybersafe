// import { useEffect } from 'react';

// const GoogleTranslate = () => {
//   useEffect(() => {
//     // Add Google Translate script
//     const addScript = document.createElement('script');
//     addScript.setAttribute(
//       'src',
//       '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
//     );
//     document.body.appendChild(addScript);

//     // Initialize Google Translate
//     window.googleTranslateElementInit = () => {
//       new window.google.translate.TranslateElement(
//         {
//           pageLanguage: 'en',
//           includedLanguages: 'en,hi,kn,ta,te,ml,mr,gu,bn,pa', // English, Hindi, Kannada, Tamil, Telugu, Malayalam, Marathi, Gujarati, Bengali, Punjabi
//           layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
//           autoDisplay: false,
//         },
//         'google_translate_element'
//       );
//     };

//     return () => {
//       // Cleanup
//       document.body.removeChild(addScript);
//     };
//   }, []);

//   return (
//     <div className="flex items-center">
//       <div id="google_translate_element"></div>
//       <style>{`
//         /* Hide Google Translate banner */
//         .goog-te-banner-frame.skiptranslate {
//           display: none !important;
//         }
        
//         body {
//           top: 0px !important;
//           position: static !important;
//         }
        
//         /* Hide the top frame that Google Translate adds */
//         .skiptranslate {
//           display: none !important;
//         }
        
//         iframe.skiptranslate {
//           display: none !important;
//           visibility: hidden !important;
//         }
        
//         body > .skiptranslate {
//           display: none !important;
//         }
        
//         /* Ensure no top spacing added by Google Translate */
//         #goog-gt-tt, .goog-te-balloon-frame {
//           display: none !important;
//         }
        
//         /* Hide the Google branding and "Powered by" text */
//         .goog-logo-link {
//           display: none !important;
//         }
        
//         .goog-te-gadget {
//           font-family: inherit !important;
//           font-size: 0 !important;
//         }
        
//         /* Style the Google Translate dropdown - clean minimal look */
//         #google_translate_element {
//           display: inline-block;
//         }
        
//         .goog-te-gadget-simple {
//           background-color: white !important;
//           border: 1px solid #e2e8f0 !important;
//           border-radius: 0.5rem !important;
//           padding: 0.5rem 0.75rem !important;
//           font-size: 0.875rem !important;
//           color: #1e293b !important;
//           transition: all 0.2s !important;
//           box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
//         }
        
//         .goog-te-gadget-simple:hover {
//           background-color: #f8fafc !important;
//           border-color: #cbd5e1 !important;
//           box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
//         }
        
//         /* Hide the Google Translate icon */
//         .goog-te-gadget-icon {
//           display: none !important;
//         }
        
//         /* Style the text in dropdown */
//         .goog-te-menu-value {
//           color: #1e293b !important;
//         }
        
//         .goog-te-menu-value span {
//           color: #64748b !important;
//           font-size: 0.875rem !important;
//         }
        
//         .goog-te-menu-value span:first-child {
//           color: #0891b2 !important;
//           font-weight: 500 !important;
//         }
        
//         /* Hide "Powered by" text */
//         .goog-te-gadget span {
//           display: none !important;
//         }
        
//         .goog-te-gadget > span > a {
//           display: none !important;
//         }
        
//         /* Show only the language selector */
//         .goog-te-combo {
//           margin: 0 !important;
//           padding: 0.25rem 0.5rem !important;
//           border: none !important;
//           background: transparent !important;
//           color: #1e293b !important;
//           font-size: 0.875rem !important;
//           outline: none !important;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default GoogleTranslate;
