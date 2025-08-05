import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaBuilding, FaFileAlt, FaCheckCircle, FaEdit } from "react-icons/fa";
import businessVerificationService from "../store/auth/businessVerificationService";
import { submitBusinessVerification, updateBusinessVerification, getCurrentUser } from "../store/auth/authSlice";
import Loading from "./Loading";

const BusinessVerification = () => {
  const dispatch = useDispatch();
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingData, setExistingData] = useState(null);
  
  const [businessData, setBusinessData] = useState({
    businessName: "",
    businessType: "",
    gstNumber: "",
    panNumber: "",
    businessAddress: "",
    city: "",
    state: "",
    pincode: "",
    phoneNumber: "",
    email: "",
    website: "",
    businessDescription: "",
    yearsInBusiness: "",
    annualTurnover: "",
    employeeCount: "",
    certifications: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Load existing business verification data
  useEffect(() => {
    const loadBusinessVerification = async () => {
      try {
        const response = await businessVerificationService.getBusinessVerification();
        if (response.success && response.data.businessDetails) {
          setExistingData(response.data);
          setBusinessData(response.data.businessDetails);
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error loading business verification:", error);
      }
    };

    loadBusinessVerification();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      const requiredFields = [
        'businessName', 'businessType', 'gstNumber', 'panNumber',
        'businessAddress', 'city', 'state', 'pincode', 'phoneNumber'
      ];

      const missingFields = requiredFields.filter(field => !businessData[field]);
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Validate GST number format (basic validation)
      if (businessData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(businessData.gstNumber)) {
        toast.error("Please enter a valid GST number");
        setIsLoading(false);
        return;
      }

      // Validate PAN number format
      if (businessData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(businessData.panNumber)) {
        toast.error("Please enter a valid PAN number");
        setIsLoading(false);
        return;
      }

      // Submit or update business verification using Redux
      let result;
      if (isEditing) {
        result = await dispatch(updateBusinessVerification(businessData));
      } else {
        result = await dispatch(submitBusinessVerification(businessData));
      }

      if (result.meta.requestStatus === 'fulfilled') {
        toast.success(isEditing ? "Business verification updated successfully!" : "Business verification submitted successfully!");
        setIsEditing(true);
        setExistingData(result.payload.data);
        dispatch(getCurrentUser());
      } else {
        toast.error(result.payload?.message || "Failed to submit business verification");
      }

    } catch (error) {
      toast.error("Failed to submit business verification");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || authLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaBuilding className="text-blue-600 text-2xl" />
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? "Update Business Verification" : "Business Verification"}
            </h2>
          </div>
          {existingData && (
            <div className="flex items-center gap-2 text-green-600">
              <FaCheckCircle />
              <span className="text-sm font-medium">Verified</span>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FaFileAlt className="text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Why Business Verification?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Ensures trust and credibility in the marketplace</li>
                <li>• Required to place bids on auctions</li>
                <li>• Helps buyers verify supplier authenticity</li>
                <li>• Enables secure payment processing</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Business Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name * <FaCheckCircle className="inline text-green-500 ml-1" />
              </label>
              <input
                type="text"
                name="businessName"
                value={businessData.businessName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your business name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type * <FaCheckCircle className="inline text-green-500 ml-1" />
              </label>
              <select
                name="businessType"
                value={businessData.businessType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Business Type</option>
                <option value="proprietorship">Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="private-limited">Private Limited</option>
                <option value="public-limited">Public Limited</option>
                <option value="llp">LLP</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number * <FaCheckCircle className="inline text-green-500 ml-1" />
              </label>
              <input
                type="text"
                name="gstNumber"
                value={businessData.gstNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="22AAAAA0000A1Z5"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Format: 22AAAAA0000A1Z5</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN Number * <FaCheckCircle className="inline text-green-500 ml-1" />
              </label>
              <input
                type="text"
                name="panNumber"
                value={businessData.panNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ABCDE1234F"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Format: ABCDE1234F</p>
            </div>
          </div>

          {/* Business Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Address * <FaCheckCircle className="inline text-green-500 ml-1" />
            </label>
            <textarea
              name="businessAddress"
              value={businessData.businessAddress}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter complete business address"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City * <FaCheckCircle className="inline text-green-500 ml-1" />
              </label>
              <input
                type="text"
                name="city"
                value={businessData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter city"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State * <FaCheckCircle className="inline text-green-500 ml-1" />
              </label>
              <input
                type="text"
                name="state"
                value={businessData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter state"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode * <FaCheckCircle className="inline text-green-500 ml-1" />
              </label>
              <input
                type="text"
                name="pincode"
                value={businessData.pincode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter pincode"
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Phone * <FaCheckCircle className="inline text-green-500 ml-1" />
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={businessData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter business phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Email
              </label>
              <input
                type="email"
                name="email"
                value={businessData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter business email"
              />
            </div>
          </div>

          {/* Business Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={businessData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.yourbusiness.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years in Business
              </label>
              <input
                type="number"
                name="yearsInBusiness"
                value={businessData.yearsInBusiness}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter years in business"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Description
            </label>
            <textarea
              name="businessDescription"
              value={businessData.businessDescription}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your business, products, and services"
            />
          </div>

          {/* Bank Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Bank Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={businessData.bankName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter bank name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={businessData.accountHolderName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter account holder name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={businessData.accountNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter account number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={businessData.ifscCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg text-white font-medium ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Submitting..." : (isEditing ? "Update Business Verification" : "Submit Business Verification")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessVerification; 