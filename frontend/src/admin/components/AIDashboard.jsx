import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAIAnalytics } from '../../store/ai/aiService';
import { toast } from 'react-toastify';

const AIDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAIAnalytics();
  }, []);

  const fetchAIAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getAIAnalytics();
      if (response.isError) {
        toast.error(response.message);
      } else {
        setAnalytics(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch AI analytics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'investigating': return 'text-red-500';
      case 'resolved': return 'text-green-500';
      case 'false_positive': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-color"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-theme-bg min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">🤖 AI Analytics Dashboard</h1>
        <p className="text-gray-400">Comprehensive insights into AI system performance and user behavior</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'overview'
              ? 'bg-theme-color text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('fraud')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'fraud'
              ? 'bg-theme-color text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Fraud Detection
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'performance'
              ? 'bg-theme-color text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Model Performance
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'insights'
              ? 'bg-theme-color text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Market Insights
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 rounded-lg border border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Total Recommendations</p>
                  <p className="text-white text-3xl font-bold">{analytics.totalRecommendations}</p>
                </div>
                <div className="text-blue-300 text-3xl">🎯</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-900 to-green-700 p-6 rounded-lg border border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm">Active AI Users</p>
                  <p className="text-white text-3xl font-bold">{analytics.activeUsers}</p>
                </div>
                <div className="text-green-300 text-3xl">👥</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-6 rounded-lg border border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Total Predictions</p>
                  <p className="text-white text-3xl font-bold">{analytics.aiUsage?.totalPredictions || 0}</p>
                </div>
                <div className="text-purple-300 text-3xl">🔮</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-900 to-red-700 p-6 rounded-lg border border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-200 text-sm">Fraud Alerts</p>
                  <p className="text-white text-3xl font-bold">{analytics.aiUsage?.totalFraudChecks || 0}</p>
                </div>
                <div className="text-red-300 text-3xl">🛡️</div>
              </div>
            </div>
          </div>

          {/* AI Usage Breakdown */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-white text-xl font-semibold mb-4">AI Feature Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {analytics.aiUsage?.totalPredictions || 0}
                </div>
                <div className="text-gray-400">Price Predictions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {analytics.aiUsage?.totalForecasts || 0}
                </div>
                <div className="text-gray-400">Demand Forecasts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {analytics.aiUsage?.totalFraudChecks || 0}
                </div>
                <div className="text-gray-400">Fraud Checks</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fraud Detection Tab */}
      {activeTab === 'fraud' && analytics && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-white text-xl font-semibold mb-4">Recent Fraud Alerts</h3>
            {analytics.recentFraudAlerts && analytics.recentFraudAlerts.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentFraudAlerts.map((alert, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(alert.riskScore)}`}>
                            Risk: {alert.riskScore}%
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-white font-medium">{alert.alertType.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-gray-400 text-sm">
                          User ID: {alert.userId} | Auction ID: {alert.auctionId}
                        </p>
                        {alert.riskFactors && alert.riskFactors.length > 0 && (
                          <div className="mt-2">
                            <p className="text-gray-400 text-sm">Risk Factors:</p>
                            <ul className="text-gray-300 text-sm">
                              {alert.riskFactors.slice(0, 3).map((factor, idx) => (
                                <li key={idx}>• {factor.factor}: {factor.description}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No recent fraud alerts</p>
            )}
          </div>
        </div>
      )}

      {/* Model Performance Tab */}
      {activeTab === 'performance' && analytics && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-white text-xl font-semibold mb-4">AI Model Performance</h3>
            {analytics.modelPerformance && analytics.modelPerformance.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.modelPerformance.map((model, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-3 capitalize">
                      {model.modelType.replace('_', ' ')}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Accuracy:</span>
                        <span className="text-white ml-2">{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Precision:</span>
                        <span className="text-white ml-2">{(model.precision * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Recall:</span>
                        <span className="text-white ml-2">{(model.recall * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">F1 Score:</span>
                        <span className="text-white ml-2">{(model.f1Score * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      Last Updated: {new Date(model.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No model performance data available</p>
            )}
          </div>
        </div>
      )}

      {/* Market Insights Tab */}
      {activeTab === 'insights' && analytics && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-white text-xl font-semibold mb-4">Market Insights</h3>
            {analytics.marketInsights && analytics.marketInsights.length > 0 ? (
              <div className="space-y-4">
                {analytics.marketInsights.map((insight, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-white font-semibold">Category: {insight.category}</h4>
                      <span className="text-gray-400 text-sm">
                        {new Date(insight.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Avg Price:</span>
                        <span className="text-white ml-2">${insight.averagePrice?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Competition:</span>
                        <span className="text-white ml-2">{insight.competitionLevel}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Growth:</span>
                        <span className={`ml-2 ${insight.growthRate > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {insight.growthRate > 0 ? '+' : ''}{insight.growthRate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Market Size:</span>
                        <span className="text-white ml-2">{insight.marketSize}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No market insights available</p>
            )}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchAIAnalytics}
          disabled={loading}
          className="bg-theme-color text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Analytics'}
        </button>
      </div>
    </div>
  );
};

export default AIDashboard; 