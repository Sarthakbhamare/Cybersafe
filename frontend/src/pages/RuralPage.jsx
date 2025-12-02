import React, { useState } from "react";

const Card = ({ children, className = "" }) => (
  <div className={`border border-gray-200 rounded-xl ${className}`}>
    {children}
  </div>
);

const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    default:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default", className = "" }) => {
  const variantStyles = {
    destructive: "bg-red-100 text-red-800 border-red-200",
    default: "bg-green-100 text-green-800 border-green-200",
    secondary: "bg-gray-100 text-gray-800 border-gray-200",
    warning: "bg-orange-100 text-orange-800 border-orange-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const Tabs = ({ children, defaultValue, className = "" }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={`${className}`}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

const TabsList = ({ children, className = "", activeTab, setActiveTab }) => (
  <div
    className={`inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 ${className}`}
  >
    {React.Children.map(children, (child) =>
      React.cloneElement(child, { activeTab, setActiveTab })
    )}
  </div>
);

const TabsTrigger = ({
  children,
  value,
  className = "",
  activeTab,
  setActiveTab,
}) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      activeTab === value
        ? "bg-white text-gray-900 shadow-sm"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    } ${className}`}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

const TabsContent = ({ children, value, className = "", activeTab }) => {
  if (activeTab !== value) return null;
  return <div className={className}>{children}</div>;
};

const ThreatCard = ({ title, description, examples, type, severity, icon }) => {
  const severityColors = {
    high: "destructive",
    medium: "warning",
    low: "secondary",
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-orange-50/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-orange-200/60 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 shadow-sm text-3xl">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 leading-tight">
              {title}
            </h3>
            <Badge variant={severityColors[severity]} className="mt-2">
              {severity === "high"
                ? "उच्च खतरा"
                : severity === "medium"
                ? "मध्यम खतरा"
                : "कम खतरा"}
            </Badge>
          </div>
        </div>
      </div>

      <p className="text-gray-600 mb-5 text-sm leading-relaxed">
        {description}
      </p>

      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
          <span className="w-1 h-4 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
          सामान्य उदाहरण:
        </h4>
        <ul className="space-y-2.5 ml-3">
          {examples.map((example, index) => (
            <li
              key={index}
              className="text-sm text-gray-700 flex items-start gap-3 group"
            >
              <span className="text-red-500 text-xs mt-1.5 font-bold group-hover:text-red-600 transition-colors">
                •
              </span>
              <span className="leading-relaxed group-hover:text-gray-900 transition-colors">
                {example}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

const QRCodeEducation = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "QR कोड क्या है?",
      content:
        "QR कोड चौकोर बिंदुओं का एक समूह है। इसे फोन के कैमरे से स्कैन किया जा सकता है।",
      visual: "📱",
      bgColor: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
    },
    {
      title: "सही QR कोड",
      content:
        "दुकानदार अपना QR कोड दिखाता है। आप स्कैन करके पैसे भेजते हैं। यह सुरक्षित है!",
      visual: "✅",
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
    },
    {
      title: "गलत QR कोड",
      content:
        "अगर कोई QR कोड भेजकर कहे 'पैसे पाने के लिए इसे स्कैन करें', तो यह धोखाधड़ी है!",
      visual: "❌",
      bgColor: "from-red-50 to-pink-50",
      borderColor: "border-red-200",
    },
    {
      title: "कैसे पहचानें?",
      content:
        "असली QR कोड में आपको PIN टाइप करने की जरूरत नहीं होती। अगर PIN मांगे तो यह धोखाधड़ी है!",
      visual: "🔐",
      bgColor: "from-yellow-50 to-orange-50",
      borderColor: "border-yellow-200",
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <Card
      className={`p-8 bg-gradient-to-br ${step.bgColor} shadow-xl ${step.borderColor} border-2`}
    >
      <div className="text-center mb-6">
        <div className="text-8xl mb-4">{step.visual}</div>
        <Badge variant="secondary" className="mb-4">
          चरण {currentStep + 1} / {steps.length}
        </Badge>
        <h3 className="text-2xl font-bold mb-4 text-gray-900">{step.title}</h3>
        <p className="text-lg text-gray-700 leading-relaxed max-w-md mx-auto">
          {step.content}
        </p>
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          className={currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""}
          disabled={currentStep === 0}
        >
          ◀ पिछला
        </Button>

        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentStep ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <Button onClick={nextStep} className="bg-green-600 hover:bg-green-700">
          {currentStep === steps.length - 1 ? "🔄 फिर से शुरू" : "अगला ▶"}
        </Button>
      </div>
    </Card>
  );
};

const AudioTipsSection = () => {
  const [playingTip, setPlayingTip] = useState(null);

  const audioTips = [
    {
      id: 1,
      title: "UPI सुरक्षा",
      description: "UPI PIN किसी को न बताएं",
      duration: "1:30",
      hindi: true,
    },
    {
      id: 2,
      title: "धोखाधड़ी की कॉल",
      description: "बैंक कॉल कहने वालों से सावधान रहें",
      duration: "2:15",
      hindi: true,
    },
    {
      id: 3,
      title: "लॉटरी धोखाधड़ी",
      description: "आपने लॉटरी जीती है जैसे झूठे संदेश",
      duration: "1:45",
      hindi: true,
    },
    {
      id: 4,
      title: "सरकारी योजनाएं",
      description: "नकली सरकारी योजनाओं से सावधान रहें",
      duration: "2:00",
      hindi: true,
    },
  ];

  const togglePlayTip = (tipId) => {
    if (playingTip === tipId) {
      setPlayingTip(null);
    } else {
      setPlayingTip(tipId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🎧 ऑडियो सलाह
        </h3>
        <p className="text-gray-600">सुनें और सीखें - हिंदी में</p>
      </div>

      <div className="grid gap-4">
        {audioTips.map((tip) => (
          <div
            key={tip.id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <button
              onClick={() => togglePlayTip(tip.id)}
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                playingTip === tip.id
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {playingTip === tip.id ? "⏸️" : "▶️"}
            </button>

            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">{tip.title}</h4>
              <p className="text-sm text-gray-600 mb-1">{tip.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {tip.duration}
                </Badge>
                <Badge
                  variant="default"
                  className="text-xs bg-orange-100 text-orange-800"
                >
                  हिंदी
                </Badge>
              </div>
            </div>

            <Button variant="outline" size="sm" className="flex-shrink-0">
              📥 डाउनलोड
            </Button>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button className="bg-green-600 hover:bg-green-700">
          🎵 सभी ऑडियो डाउनलोड करें
        </Button>
      </div>
    </div>
  );
};

const CommunityStories = () => {
  const stories = [
    {
      id: 1,
      name: "रामदास - उत्तर प्रदेश",
      story:
        "किसी ने फोन करके कहा 'आपको ₹50,000 लॉटरी मिली है'। लेकिन मैंने इस ऐप से सीखा था इसलिए उस पर विश्वास नहीं किया!",
      saved: "₹15,000",
      emoji: "👨‍🌾",
    },
    {
      id: 2,
      name: "लक्ष्मी - मध्य प्रदेश",
      story:
        "WhatsApp पर नकली सरकारी योजना का संदेश आया। उसमें पैसे मांग रहे थे। मैंने तुरंत संदेश हटा दिया।",
      saved: "₹8,000",
      emoji: "👵",
    },
    {
      id: 3,
      name: "विकास - बिहार",
      story:
        "QR कोड स्कैन करते समय PIN मांगा। इस ऐप से सीखने के कारण तुरंत रद्द कर दिया!",
      saved: "₹25,000",
      emoji: "👨",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          👥 हमारे समुदाय के अनुभव
        </h3>
        <p className="text-gray-600">असली लोगों की असली कहानियां</p>
      </div>

      <div className="grid gap-4">
        {stories.map((story) => (
          <Card
            key={story.id}
            className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{story.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{story.name}</h4>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    ₹{story.saved} बचाए
                  </Badge>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed italic">
                  "{story.story}"
                </p>
                <div className="flex items-center gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-500">
                      ⭐
                    </span>
                  ))}
                  <span className="text-xs text-gray-500 ml-2">
                    सत्यापित कहानी
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const RuralPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-700 to-green-800">
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge
                variant="secondary"
                className="w-fit bg-white/10 text-white border-white/20"
              >
                👨‍🌾 ग्रामीण समुदाय के लिए
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                ऑनलाइन धोखाधड़ी से{" "}
                <span className="text-yellow-300">सुरक्षित रहें</span>
              </h1>
              <p className="text-lg text-white/90 leading-relaxed">
                हिंदी में आसानी से सीखें। UPI, QR कोड, और फोन धोखाधड़ी से कैसे
                सुरक्षित रहें, जानें।
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className=" text-orange-600 hover:bg-gray-100 shadow-xl"
                >
                  🎯 सीखना शुरू करें
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 border-2"
                >
                  📱 वीडियो देखें
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">1 लाख+</div>
                  <div className="text-sm text-white/80">लोग सुरक्षित</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">₹50 लाख</div>
                  <div className="text-sm text-white/80">पैसे बचाए गए</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm text-white/80">हिंदी में</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🛡️</div>
                  <p className="text-lg font-medium">साइबर सुरक्षा</p>
                  <p className="text-sm opacity-80">हिंदी में आसान</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-xl">
                <span className="text-3xl">🏡</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <Tabs defaultValue="qr-education" className="space-y-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              जो चाहें वो चुनें
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              आसान और तेज़ सीखना। अपने समय के अनुसार सीखें!
            </p>
          </div>

          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 p-2 bg-gray-100 rounded-lg">
            <TabsTrigger
              value="qr-education"
              className="flex flex-col items-center gap-1 py-3 px-2 text-xs lg:text-sm"
            >
              📱 QR कोड सुरक्षा
            </TabsTrigger>
            <TabsTrigger
              value="threats"
              className="flex flex-col items-center gap-1 py-3 px-2 text-xs lg:text-sm"
            >
              ⚠️ धोखाधड़ी
            </TabsTrigger>
            <TabsTrigger
              value="audio"
              className="flex flex-col items-center gap-1 py-3 px-2 text-xs lg:text-sm"
            >
              🎧 ऑडियो सलाह
            </TabsTrigger>
            <TabsTrigger
              value="stories"
              className="flex flex-col items-center gap-1 py-3 px-2 text-xs lg:text-sm"
            >
              👥 अनुभव
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr-education" className="space-y-8">
            <div className="max-w-4xl mx-auto">
              <QRCodeEducation />
            </div>
          </TabsContent>

          <TabsContent value="threats" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <ThreatCard
                  title="QR कोड धोखाधड़ी"
                  description="नकली QR कोड से आपके पैसे चुराने के प्रयास"
                  examples={[
                    "WhatsApp पर QR कोड भेजकर पैसे पाने के लिए स्कैन करने को कहना",
                    "फोन में QR कोड स्कैन करते समय UPI PIN मांगना",
                    "दुकान के QR कोड पर दूसरा स्टिकर चिपकाना",
                  ]}
                  type="qr"
                  severity="high"
                  icon="📱"
                />
                <ThreatCard
                  title="सरकारी योजना धोखाधड़ी"
                  description="नकली सरकारी योजनाओं के नाम पर पैसे मांगना"
                  examples={[
                    "PM Kisan योजना के नाम पर ₹500 मांगना",
                    "किसानों को विशेष सहायता कहकर नकली संदेश",
                    "Aadhaar अपडेट करने के लिए पैसे मांगना",
                  ]}
                  type="government"
                  severity="high"
                  icon="🏛️"
                />
              </div>
              <div className="space-y-6">
                <ThreatCard
                  title="लॉटरी धोखाधड़ी"
                  description="आपने लॉटरी जीती है जैसे झूठे संदेश"
                  examples={[
                    "KBC लॉटरी में ₹25 लाख जीते हैं का SMS",
                    "जीत का पैसा पाने के लिए पहले ₹5000 दें",
                    "अनजान नंबरों से आने वाली लॉटरी कॉल",
                  ]}
                  type="lottery"
                  severity="medium"
                  icon="🎰"
                />
                <ThreatCard
                  title="बैंक धोखाधड़ी कॉल"
                  description="बैंक अधिकारी बनकर व्यक्तिगत जानकारी मांगना"
                  examples={[
                    "आपका खाता बंद होगा, OTP दें ऐसा कहना",
                    "ATM कार्ड अपडेट के लिए CVV नंबर मांगना",
                    "फोन पर PIN नंबर बताने के लिए दबाव डालना",
                  ]}
                  type="bank"
                  severity="high"
                  icon="🏦"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-8">
            <div className="max-w-4xl mx-auto">
              <AudioTipsSection />
            </div>
          </TabsContent>

          <TabsContent value="stories" className="space-y-8">
            <div className="max-w-4xl mx-auto">
              <CommunityStories />
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Quick Action Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-12">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            तुरंत मदद चाहिए?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            अगर धोखाधड़ी का शक हो, तुरंत इन नंबरों पर कॉल करें
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 bg-white/10 border border-white/20 backdrop-blur-sm">
              <div className="text-4xl mb-2">🚨</div>
              <h3 className="text-white font-bold mb-2">साइबर अपराध</h3>
              <p className="text-2xl font-bold text-yellow-300">1930</p>
              <p className="text-white/80 text-sm">24/7 उपलब्ध</p>
            </Card>
            <Card className="p-6 bg-white/10 border border-white/20 backdrop-blur-sm">
              <div className="text-4xl mb-2">📞</div>
              <h3 className="text-white font-bold mb-2">बैंक मदद</h3>
              <p className="text-2xl font-bold text-yellow-300">
                आपका बैंक
              </p>
              <p className="text-white/80 text-sm">कार्ड ब्लॉक करें</p>
            </Card>
            <Card className="p-6 bg-white/10 border border-white/20 backdrop-blur-sm">
              <div className="text-4xl mb-2">👮</div>
              <h3 className="text-white font-bold mb-2">पुलिस</h3>
              <p className="text-2xl font-bold text-yellow-300">100</p>
              <p className="text-white/80 text-sm">आपातकालीन सेवा</p>
            </Card>
          </div>
          <div className="mt-8">
            <Button
              size="lg"
              className=" text-green-600 hover:bg-gray-100 shadow-xl mr-4"
            >
              📱 ऐप डाउनलोड करें
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 border-2"
            >
              💬 मदद चैट
            </Button>
          </div>
        </div>
      </section>

      {/* Tips Banner */}
      <section className="bg-orange-50 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <Card className="p-8 bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎯 मुख्य याद रखने योग्य बातें
              </h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl mb-2">🔐</div>
                <h4 className="font-bold text-gray-900 mb-1">UPI PIN</h4>
                <p className="text-sm text-gray-600">किसी को न बताएं</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl mb-2">📱</div>
                <h4 className="font-bold text-gray-900 mb-1">QR कोड</h4>
                <p className="text-sm text-gray-600">PIN मांगे तो धोखाधड़ी</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl mb-2">🎰</div>
                <h4 className="font-bold text-gray-900 mb-1">लॉटरी</h4>
                <p className="text-sm text-gray-600">
                  पहले पैसे मांगे तो विश्वास न करें
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl mb-2">📞</div>
                <h4 className="font-bold text-gray-900 mb-1">धोखाधड़ी कॉल</h4>
                <p className="text-sm text-gray-600">तुरंत कॉल काट दें</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default RuralPage;
