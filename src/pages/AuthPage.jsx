import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Configuration
const API_BASE_URL = "https://hotel-management-backend-4hff.onrender.com";

const AuthPage = ({ setToken, isLogin }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaText, setCaptchaText] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    
    if (isLogin) {
      generateCaptcha();
    }
  }, [isLogin]);

  const generateCaptcha = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setCaptchaText(result);
    setUserCaptcha("");
    setCaptchaError("");
  };

  const validateCaptcha = () => {
    if (userCaptcha.toLowerCase() !== captchaText.toLowerCase()) {
      setCaptchaError("Captcha code doesn't match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setCaptchaError("");

    // Validate captcha for login
    if (isLogin && !validateCaptcha()) {
      return;
    }

    try {
      const endpoint = isLogin ? "/login" : "/register";
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(
        `${API_BASE_URL}${endpoint}`,
        payload
      );

      if (isLogin) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setToken(response.data.token);
        navigate("/dashboard");
      } else {
        setSuccess(true);
        // Redirect to login after successful registration
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          (isLogin ? "Login failed" : "Registration failed")
      );
      if (isLogin) {
        generateCaptcha(); // Regenerate captcha on failed login
      }
    }
  };

  const authImage = isLogin
    ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fit=crop&w=1200&q=80"
    : "https://www.brides.com/thmb/JcdtVSFkiDT_FojuI32P0SQlrss=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/37-redwoods-outdoor-chapel-wedding-reception-dance-floor-ryan-ray-0524-65f65fcbd02f49e789f42482b59e8749.JPG";

  return (
    <div
      className="min-h-screen w-full bg-gray-50 flex items-center justify-center overflow-x-hidden"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className={`flex flex-col lg:flex-row w-full min-h-screen ${isLogin ? "" : "lg:flex-row-reverse"}`}>
        {/* Image Panel */}
        <div className="hidden lg:flex w-1/2 relative">
          <img
            src={authImage}
            alt={isLogin ? "Login visual" : "Register visual"}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 sm:top-8 left-4 sm:left-8 text-white text-xl sm:text-2xl font-bold">
            StayTrack
          </div>
          <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 text-lg sm:text-xl font-medium text-white">
            {isLogin ? (
              <>
                Welcome Back,
                <br />
                Let's get started
              </>
            ) : (
              <>
                Join Our Community,
                <br />
                Start Your Journey
              </>
            )}
          </div>
        </div>

        {/* Form Container - Light Theme */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-4 sm:p-6 md:p-8 lg:p-10 min-h-screen lg:min-h-0">
          <div className="w-full max-w-sm sm:max-w-md bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-gray-200">
            {/* Title StayTrack */}
            <div className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-4 sm:mb-6 tracking-wider">
              StayTrack
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {isLogin ? "Sign In to Your Account" : "Create New Account"}
              </h3>
              <p className="text-sm text-gray-600">
                {isLogin 
                  ? "Enter your credentials to access your dashboard"
                  : "Fill in your details to get started with StayTrack"
                }
              </p>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 text-center">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <span
                className="text-purple-600 hover:underline cursor-pointer font-semibold"
                onClick={() => navigate(isLogin ? "/register" : "/login")}
              >
                {isLogin ? "Create Account" : "Sign In"}
              </span>
            </p>

            {error && (
              <div className="text-red-600 text-xs sm:text-sm mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center">
                  <span className="mr-2">⚠</span>
                  {error}
                </div>
              </div>
            )}
            {success && (
              <div className="text-green-600 text-xs sm:text-sm mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  Registration successful! Redirecting to login...
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                      className="w-full bg-gray-50 text-gray-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-300 text-sm sm:text-base placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                      className="w-full bg-gray-50 text-gray-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-300 text-sm sm:text-base placeholder-gray-500"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full bg-gray-50 text-gray-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-300 text-sm sm:text-base placeholder-gray-500"
                />
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="w-full bg-gray-50 text-gray-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-300 text-sm sm:text-base pr-10 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              
              {!isLogin && (
                <div>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full bg-gray-50 text-gray-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-300 text-sm sm:text-base"
                  >
                    <option value="staff">Staff Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.role === "admin" 
                      ? "Administrators have full system access"
                      : "Staff members have limited access based on permissions"
                    }
                  </p>
                </div>
              )}

              {/* CAPTCHA - Only for Login */}
              {isLogin && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">Security Verification</label>
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="text-xs text-purple-600 hover:text-purple-700 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <div className="flex-1 bg-gray-100 rounded-lg p-3 text-center font-mono text-lg font-bold text-gray-800 select-none border border-gray-300">
                      {captchaText}
                    </div>
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={userCaptcha}
                      onChange={(e) => setUserCaptcha(e.target.value)}
                      required
                      className="flex-1 bg-gray-50 text-gray-800 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-300 text-sm placeholder-gray-500"
                    />
                  </div>
                  {captchaError && (
                    <div className="text-red-600 text-xs flex items-center">
                      <span className="mr-1">⚠</span>
                      {captchaError}
                    </div>
                  )}
                </div>
              )}

              {!isLogin && (
                <label className="flex items-start text-xs sm:text-sm text-gray-600 leading-relaxed">
                  <input
                    type="checkbox"
                    required
                    className="mr-2 mt-1 sm:mt-0 accent-purple-500 flex-shrink-0"
                  />
                  <span>
                    I agree to the{" "}
                    <span
                      onClick={() => setShowModal(true)}
                      className="underline text-purple-600 cursor-pointer font-semibold"
                    >
                      Terms & Conditions
                    </span>{" "}
                    and{" "}
                    <span
                      onClick={() => setShowModal(true)}
                      className="underline text-purple-600 cursor-pointer font-semibold"
                    >
                      Privacy Policy
                    </span>
                  </span>
                </label>
              )}

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 transition duration-300 text-white font-semibold py-2.5 sm:py-3 rounded-lg text-sm sm:text-base shadow-lg hover:shadow-purple-500/25"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            {/* Security notice */}
            
          </div>
        </div>
      </div>

      {/* Modal for Terms & Conditions */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] p-4 sm:p-6 text-black relative">
            <h2 className="text-lg sm:text-xl font-bold mb-4 pr-8">
              Terms & Conditions
            </h2>
            <div className="h-48 sm:h-64 overflow-y-auto text-xs sm:text-sm space-y-3 pr-2">
              <p className="font-semibold text-purple-600">
                Welcome to StayTrack Hotel Management System. By registering for an account, you agree to the following terms:
              </p>
              
              <div className="space-y-2">
                <p><strong>1. Account Registration</strong></p>
                <p>• You must provide accurate and complete information during registration</p>
                <p>• You are responsible for maintaining the confidentiality of your account credentials</p>
                <p>• You must notify us immediately of any unauthorized use of your account</p>
                
                <p><strong>2. User Responsibilities</strong></p>
                <p>• Use the system only for legitimate hotel management purposes</p>
                <p>• Comply with all applicable laws and regulations</p>
                <p>• Do not attempt to breach system security or access unauthorized data</p>
                
                <p><strong>3. Data Privacy</strong></p>
                <p>• We collect and process personal data in accordance with our Privacy Policy</p>
                <p>• Guest data must be handled in compliance with data protection laws</p>
                <p>• Regular data backups are performed, but users should maintain their own backups</p>
                
                <p><strong>4. System Usage</strong></p>
                <p>• The system is provided for managing hotel operations including bookings, guests, and rooms</p>
                <p>• Administrators have full system access while staff access may be limited</p>
                <p>• System availability is subject to maintenance windows and technical requirements</p>
                
                <p><strong>5. Termination</strong></p>
                <p>• We reserve the right to suspend or terminate accounts for violation of these terms</p>
                <p>• Users may request account deletion by contacting system administrators</p>
                
                <p><strong>6. Liability</strong></p>
                <p>• The system is provided "as is" without warranties of any kind</p>
                <p>• We are not liable for any indirect damages resulting from system use</p>
                <p>• Users are responsible for the accuracy of data entered into the system</p>
              </div>
              
              <p className="text-xs text-gray-600 mt-4">
                By creating an account, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
                For questions, contact your system administrator.
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 sm:top-3 right-3 sm:right-4 text-xl sm:text-2xl font-bold text-gray-700 hover:text-black p-1"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
