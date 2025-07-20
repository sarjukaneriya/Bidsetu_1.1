import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const DeliveryConfirmation = ({ auctionId, userType, onDeliveryConfirmed }) => {
  const [expectedDate, setExpectedDate] = useState('');
  const [actualDate, setActualDate] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:8000/api/v1';

  // Supplier sets expected delivery date
  const handleSetExpectedDelivery = async () => {
    if (!expectedDate) {
      toast.info('Please select expected delivery date');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/expected-delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          expectedDeliveryDate: expectedDate
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Expected delivery date set successfully!');
        onDeliveryConfirmed && onDeliveryConfirmed();
      } else {
        toast.error(data.message || 'Failed to set expected delivery date');
      }
    } catch (error) {
      toast.error('Error setting expected delivery date');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Buyer confirms delivery
  const handleConfirmDelivery = async () => {
    if (!actualDate) {
      toast.info('Please select actual delivery date');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/delivery-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          deliveryStatus: 'delivered',
          actualDeliveryDate: actualDate,
          deliveryNotes: deliveryNotes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Delivery confirmed successfully!');
        onDeliveryConfirmed && onDeliveryConfirmed();
      } else {
        toast.error(data.message || 'Failed to confirm delivery');
      }
    } catch (error) {
      toast.error('Error confirming delivery');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-theme-bg2 rounded-lg shadow-md p-6 border border-theme-color">
      <h3 className="text-xl font-semibold mb-4 text-white">Delivery Confirmation</h3>
      
      {userType === 'supplier' ? (
        // Supplier Interface - Set Expected Delivery Date
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Expected Delivery Date
            </label>
            <input
              type="datetime-local"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          
          <button
            onClick={handleSetExpectedDelivery}
            disabled={isLoading}
            className="w-full bg-theme-color text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting...' : 'Set Expected Delivery Date'}
          </button>
        </div>
      ) : (
        // Buyer Interface - Confirm Delivery
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Actual Delivery Date
            </label>
            <input
              type="datetime-local"
              value={actualDate}
              onChange={(e) => setActualDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Delivery Notes (Optional)
            </label>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Any notes about the delivery..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              rows="3"
            />
          </div>
          
          <button
            onClick={handleConfirmDelivery}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Confirming...' : 'Confirm Delivery'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryConfirmation; 