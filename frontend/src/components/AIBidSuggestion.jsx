import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBidSuggestions, fetchWinProbability, clearBidSuggestions } from '../store/ai/aiSlice';
import { toast } from 'react-toastify';

const AIBidSuggestion = ({ auctionId, onBidSuggestion }) => {
  const dispatch = useDispatch();
  const { bidSuggestions, winProbability, loading, error } = useSelector((state) => state.ai);
  const [bidAmount, setBidAmount] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Get bid suggestions when component mounts
    if (auctionId) {
      dispatch(fetchBidSuggestions(auctionId));
    }

    return () => {
      dispatch(clearBidSuggestions());
    };
  }, [dispatch, auctionId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleGetSuggestions = () => {
    if (auctionId) {
      dispatch(fetchBidSuggestions(auctionId));
      setShowSuggestions(true);
    }
  };

  const handleBidAmountChange = (e) => {
    const amount = e.target.value;
    setBidAmount(amount);
    
    // Get win probability for the entered amount
    if (amount && auctionId) {
      dispatch(fetchWinProbability({ auctionId, bidAmount: parseFloat(amount) }));
    }
  };

  const handleUseSuggestion = (suggestedAmount) => {
    setBidAmount(suggestedAmount);
    if (onBidSuggestion) {
      onBidSuggestion(suggestedAmount);
    }
    toast.success(`Bid amount set to $${suggestedAmount}`);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getWinProbabilityColor = (probability) => {
    if (probability >= 70) return 'text-green-500';
    if (probability >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!auctionId) return null;

  return (
    <div className="bg-theme-bg2 p-6 rounded-lg border border-theme-color">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold flex items-center gap-2">
          🤖 AI Bid Assistant
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-theme-color"></div>}
        </h3>
        <button
          onClick={handleGetSuggestions}
          disabled={loading}
          className="bg-theme-color text-white px-4 py-2 rounded-lg hover:bg-opacity-80 disabled:opacity-50"
        >
          Get AI Suggestions
        </button>
      </div>

      {bidSuggestions && (
        <div className="space-y-4">
          {/* AI Suggestion */}
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-4 rounded-lg border border-blue-500">
            <h4 className="text-white font-semibold mb-2">🎯 AI Recommended Bid</h4>
            <div className="text-2xl font-bold text-white mb-2">
              ${bidSuggestions.suggestedBid?.toLocaleString()}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className={`${getConfidenceColor(bidSuggestions.confidence)}`}>
                Confidence: {bidSuggestions.confidence}%
              </span>
              <span className={`${getWinProbabilityColor(bidSuggestions.winProbability)}`}>
                Win Probability: {bidSuggestions.winProbability}%
              </span>
            </div>
            <button
              onClick={() => handleUseSuggestion(bidSuggestions.suggestedBid)}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Use This Bid
            </button>
          </div>

          {/* Market Factors */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-3">📊 Market Analysis</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Current Lowest:</span>
                <span className="text-white ml-2">${bidSuggestions.factors?.currentLowestBid?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">Your Expertise:</span>
                <span className="text-white ml-2">{bidSuggestions.factors?.supplierExpertise}%</span>
              </div>
              <div>
                <span className="text-gray-400">Market Competition:</span>
                <span className="text-white ml-2">{bidSuggestions.factors?.marketCompetition}%</span>
              </div>
              <div>
                <span className="text-gray-400">Budget Ratio:</span>
                <span className="text-white ml-2">{((bidSuggestions.factors?.budgetRatio || 0) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          {bidSuggestions.recommendations && bidSuggestions.recommendations.length > 0 && (
            <div className="bg-yellow-900 p-4 rounded-lg border border-yellow-500">
              <h4 className="text-white font-semibold mb-2">💡 AI Insights</h4>
              <ul className="space-y-1">
                {bidSuggestions.recommendations.map((rec, index) => (
                  <li key={index} className="text-yellow-200 text-sm flex items-start gap-2">
                    <span>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Manual Bid Input with Win Probability */}
      <div className="mt-6">
        <h4 className="text-white font-semibold mb-3">🔢 Test Your Bid</h4>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              value={bidAmount}
              onChange={handleBidAmountChange}
              placeholder="Enter bid amount"
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-theme-color focus:outline-none"
            />
          </div>
          {winProbability && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Win Chance:</span>
              <span className={`font-semibold ${getWinProbabilityColor(winProbability.winProbability)}`}>
                {winProbability.winProbability}%
              </span>
            </div>
          )}
        </div>
        
        {winProbability && winProbability.factors && (
          <div className="mt-3 bg-gray-800 p-3 rounded-lg">
            <h5 className="text-white font-semibold mb-2">📈 Win Factors</h5>
            <div className="space-y-1">
              {winProbability.factors.map((factor, index) => (
                <div key={index} className="text-sm">
                  <span className="text-gray-400">{factor.factor}:</span>
                  <span className={`ml-2 ${factor.impact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-2">({factor.description})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Features Info */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-white font-semibold mb-2">🚀 AI Features</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span>Optimal Pricing</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📊</span>
            <span>Market Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎲</span>
            <span>Win Probability</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span>Real-time Updates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBidSuggestion; 