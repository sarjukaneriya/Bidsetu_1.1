import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuctionInsights, fetchPricePrediction, fetchMarketTrends } from '../store/ai/aiSlice';
import { toast } from 'react-toastify';

const AIAuctionInsights = ({ auctionId, categoryId }) => {
  const dispatch = useDispatch();
  const { auctionInsights, pricePrediction, marketTrends, loading, error } = useSelector((state) => state.ai);

  useEffect(() => {
    if (auctionId) {
      dispatch(fetchAuctionInsights(auctionId));
      dispatch(fetchPricePrediction(auctionId));
    }
    if (categoryId) {
      dispatch(fetchMarketTrends(categoryId));
    }
  }, [dispatch, auctionId, categoryId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrendColor = (trend) => {
    if (trend === 'increasing') return 'text-green-500';
    if (trend === 'decreasing') return 'text-red-500';
    return 'text-yellow-500';
  };

  const getCompetitionLevel = (level) => {
    if (level === 'High') return 'text-red-500';
    if (level === 'Medium') return 'text-yellow-500';
    return 'text-green-500';
  };

  if (!auctionId) return null;

  return (
    <div className="bg-theme-bg2 p-6 rounded-lg border border-theme-color">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white text-xl font-semibold flex items-center gap-2">
          🧠 AI Auction Insights
          {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-theme-color"></div>}
        </h3>
        <div className="text-sm text-gray-400">
          Powered by Machine Learning
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Prediction */}
        {pricePrediction && (
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 rounded-lg border border-purple-500">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              💰 Price Prediction
            </h4>
            <div className="text-3xl font-bold text-white mb-2">
              ${pricePrediction.predictedPrice?.toLocaleString()}
            </div>
            <div className="flex items-center gap-4 text-sm mb-3">
              <span className={`${getConfidenceColor(pricePrediction.confidence)}`}>
                Confidence: {pricePrediction.confidence}%
              </span>
            </div>
            
            {pricePrediction.factors && (
              <div className="space-y-2">
                <h5 className="text-white font-semibold text-sm">Key Factors:</h5>
                {pricePrediction.factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">{factor.factor}</span>
                    <span className={`${factor.impact === 'positive' ? 'text-green-400' : factor.impact === 'negative' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {factor.weight * 100}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Market Trends */}
        {marketTrends && (
          <div className="bg-gradient-to-r from-green-900 to-teal-900 p-4 rounded-lg border border-green-500">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              📈 Market Trends
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Price:</span>
                <span className="text-white font-semibold">${marketTrends.averagePrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Competition:</span>
                <span className="text-white font-semibold">{marketTrends.competitionLevel}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Growth Rate:</span>
                <span className={`font-semibold ${getTrendColor(marketTrends.growthRate > 0 ? 'increasing' : 'decreasing')}`}>
                  {marketTrends.growthRate > 0 ? '+' : ''}{marketTrends.growthRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Market Size:</span>
                <span className="text-white font-semibold">{marketTrends.marketSize} auctions</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auction Analysis */}
      {auctionInsights && (
        <div className="mt-6 space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              📊 Auction Analysis
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {auctionInsights.auctionAnalysis?.competitionLevel}
                </div>
                <div className="text-sm text-gray-400">Competition</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {auctionInsights.auctionAnalysis?.expectedBids}
                </div>
                <div className="text-sm text-gray-400">Expected Bids</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {auctionInsights.auctionAnalysis?.successProbability}%
                </div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {auctionInsights.topSuppliers?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Top Suppliers</div>
              </div>
            </div>
          </div>

          {/* Top Suppliers */}
          {auctionInsights.topSuppliers && auctionInsights.topSuppliers.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                🏆 Top Recommended Suppliers
              </h4>
              <div className="space-y-3">
                {auctionInsights.topSuppliers.slice(0, 3).map((supplier, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-theme-color rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {supplier.supplier?.fullName || 'Unknown Supplier'}
                        </div>
                        <div className="text-sm text-gray-400">
                          Score: {supplier.score}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        ${supplier.stats?.averageBidAmount?.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">
                        {supplier.stats?.winRate?.toFixed(1)}% win rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Recommendations */}
      <div className="mt-6 bg-gradient-to-r from-yellow-900 to-orange-900 p-4 rounded-lg border border-yellow-500">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          💡 AI Recommendations
        </h4>
        <div className="space-y-2">
          {pricePrediction && (
            <div className="flex items-start gap-2">
              <span className="text-yellow-300">💰</span>
              <span className="text-yellow-200">
                Expected winning bid: ${pricePrediction.predictedPrice?.toLocaleString()} 
                (Confidence: {pricePrediction.confidence}%)
              </span>
            </div>
          )}
          {marketTrends && (
            <div className="flex items-start gap-2">
              <span className="text-yellow-300">📈</span>
              <span className="text-yellow-200">
                Market is {marketTrends.growthRate > 0 ? 'growing' : 'declining'} 
                ({Math.abs(marketTrends.growthRate)}% change)
              </span>
            </div>
          )}
          {auctionInsights && (
            <div className="flex items-start gap-2">
              <span className="text-yellow-300">🎯</span>
              <span className="text-yellow-200">
                {auctionInsights.auctionAnalysis?.competitionLevel} competition level - 
                {auctionInsights.auctionAnalysis?.competitionLevel === 'High' 
                  ? ' Consider aggressive pricing' 
                  : ' Opportunity for competitive bidding'}
              </span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <span className="text-yellow-300">⚡</span>
            <span className="text-yellow-200">
              Monitor real-time updates for optimal bidding timing
            </span>
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-white font-semibold mb-3">🚀 AI-Powered Features</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span className="text-gray-300">Price Prediction</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📊</span>
            <span className="text-gray-300">Market Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🏆</span>
            <span className="text-gray-300">Supplier Ranking</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span className="text-gray-300">Real-time Insights</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAuctionInsights; 