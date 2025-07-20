import AIPrediction from "../models/aiPrediction.model.js";
import Auction from "../models/auction.model.js";
import Bid from "../models/bid.model.js";
import User from "../models/user.model.js";
import ProductCategory from "../models/productCategory.model.js";

class AIPredictionService {
  // Predict optimal price for an auction
  async predictOptimalPrice(auctionId) {
    try {
      const auction = await Auction.findById(auctionId)
        .populate('category')
        .populate('location');

      if (!auction) throw new Error('Auction not found');

      // Get historical data for similar auctions
      const similarAuctions = await Auction.find({
        category: auction.category._id,
        status: 'over',
        budget: { $gte: auction.budget * 0.7, $lte: auction.budget * 1.3 }
      }).populate('bids');

      if (similarAuctions.length === 0) {
        return {
          predictedPrice: auction.budget * 0.8,
          confidence: 30,
          factors: [{ factor: 'Limited historical data', weight: 1, impact: 'neutral' }]
        };
      }

      // Calculate average winning bid for similar auctions
      const winningBids = [];
      for (const similarAuction of similarAuctions) {
        if (similarAuction.winner) {
          const winningBid = await Bid.findById(similarAuction.winner);
          if (winningBid) {
            winningBids.push(winningBid.bidAmount);
          }
        }
      }

      if (winningBids.length === 0) {
        return {
          predictedPrice: auction.budget * 0.8,
          confidence: 40,
          factors: [{ factor: 'No winning bids in similar auctions', weight: 1, impact: 'neutral' }]
        };
      }

      const averageWinningBid = winningBids.reduce((sum, bid) => sum + bid, 0) / winningBids.length;
      const budgetRatio = averageWinningBid / auction.budget;
      
      // Adjust for market conditions
      const marketTrend = await this.getMarketTrend(auction.category._id);
      const adjustedPrice = averageWinningBid * (1 + marketTrend.growthRate / 100);

      // Calculate confidence based on data quality
      const confidence = Math.min(95, 50 + (similarAuctions.length * 5) + (winningBids.length * 3));

      const factors = [
        { factor: 'Historical winning bids', weight: 0.4, impact: 'positive' },
        { factor: 'Market trend', weight: 0.2, impact: marketTrend.growthRate > 0 ? 'positive' : 'negative' },
        { factor: 'Budget ratio', weight: 0.3, impact: budgetRatio < 0.9 ? 'positive' : 'neutral' },
        { factor: 'Data quality', weight: 0.1, impact: 'positive' }
      ];

      return {
        predictedPrice: Math.round(adjustedPrice),
        confidence: Math.round(confidence),
        factors
      };

    } catch (error) {
      console.error('Error predicting optimal price:', error);
      return {
        predictedPrice: 0,
        confidence: 0,
        factors: [{ factor: 'Error in prediction', weight: 1, impact: 'negative' }]
      };
    }
  }

  // Forecast demand for a category and location
  async forecastDemand(categoryId, locationId, timeFrame = 'monthly') {
    try {
      // Get historical auction data
      const historicalAuctions = await Auction.find({
        category: categoryId,
        location: locationId,
        status: 'over',
        createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
      });

      if (historicalAuctions.length === 0) {
        return {
          predictedDemand: 0,
          confidence: 20,
          trendDirection: 'stable',
          seasonalFactor: 1
        };
      }

      // Group by time periods
      const demandByPeriod = {};
      const periodMs = timeFrame === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 
                      timeFrame === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 
                      90 * 24 * 60 * 60 * 1000;

      for (const auction of historicalAuctions) {
        const period = Math.floor(auction.createdAt.getTime() / periodMs);
        demandByPeriod[period] = (demandByPeriod[period] || 0) + 1;
      }

      // Calculate trend
      const periods = Object.keys(demandByPeriod).map(Number).sort();
      const demands = periods.map(period => demandByPeriod[period]);
      
      let trendDirection = 'stable';
      let growthRate = 0;

      if (demands.length >= 2) {
        const recentDemand = demands.slice(-3).reduce((sum, d) => sum + d, 0) / 3;
        const olderDemand = demands.slice(0, 3).reduce((sum, d) => sum + d, 0) / 3;
        
        growthRate = ((recentDemand - olderDemand) / olderDemand) * 100;
        
        if (growthRate > 10) trendDirection = 'increasing';
        else if (growthRate < -10) trendDirection = 'decreasing';
      }

      // Predict future demand
      const averageDemand = demands.reduce((sum, d) => sum + d, 0) / demands.length;
      const predictedDemand = Math.round(averageDemand * (1 + growthRate / 100));

      // Calculate seasonal factor (simplified)
      const currentMonth = new Date().getMonth();
      const seasonalFactor = this.calculateSeasonalFactor(currentMonth, categoryId);

      const confidence = Math.min(90, 40 + (historicalAuctions.length * 2) + Math.abs(growthRate));

      return {
        predictedDemand: Math.round(predictedDemand * seasonalFactor),
        confidence: Math.round(confidence),
        trendDirection,
        seasonalFactor,
        timeFrame
      };

    } catch (error) {
      console.error('Error forecasting demand:', error);
      return {
        predictedDemand: 0,
        confidence: 0,
        trendDirection: 'stable',
        seasonalFactor: 1
      };
    }
  }

  // Calculate seasonal factor
  calculateSeasonalFactor(month, categoryId) {
    // Simplified seasonal factors - can be enhanced with category-specific data
    const seasonalFactors = {
      0: 0.9,   // January
      1: 0.85,  // February
      2: 1.0,   // March
      3: 1.1,   // April
      4: 1.15,  // May
      5: 1.2,   // June
      6: 1.1,   // July
      7: 1.05,  // August
      8: 1.0,   // September
      9: 0.95,  // October
      10: 0.9,  // November
      11: 0.85  // December
    };

    return seasonalFactors[month] || 1.0;
  }

  // Get market trend for a category
  async getMarketTrend(categoryId) {
    try {
      const auctions = await Auction.find({
        category: categoryId,
        status: 'over',
        createdAt: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } // Last 60 days
      }).populate('bids');

      if (auctions.length === 0) {
        return {
          averagePrice: 0,
          priceVolatility: 0,
          supplyDemandRatio: 1,
          competitionLevel: 50,
          marketSize: 0,
          growthRate: 0
        };
      }

      // Calculate average price
      const winningBids = [];
      for (const auction of auctions) {
        if (auction.winner) {
          const winningBid = await Bid.findById(auction.winner);
          if (winningBid) {
            winningBids.push(winningBid.bidAmount);
          }
        }
      }

      const averagePrice = winningBids.length > 0 ? 
        winningBids.reduce((sum, bid) => sum + bid, 0) / winningBids.length : 0;

      // Calculate price volatility
      const priceVolatility = winningBids.length > 1 ? 
        Math.sqrt(winningBids.reduce((sum, bid) => sum + Math.pow(bid - averagePrice, 2), 0) / winningBids.length) : 0;

      // Calculate competition level
      const totalBids = auctions.reduce((sum, auction) => sum + auction.bids.length, 0);
      const competitionLevel = Math.min(100, totalBids / auctions.length * 10);

      // Calculate supply-demand ratio
      const supplyDemandRatio = auctions.length / Math.max(1, totalBids / 10);

      // Calculate growth rate
      const recentAuctions = auctions.filter(a => 
        a.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      const olderAuctions = auctions.filter(a => 
        a.createdAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      const growthRate = olderAuctions.length > 0 ? 
        ((recentAuctions.length - olderAuctions.length) / olderAuctions.length) * 100 : 0;

      return {
        averagePrice: Math.round(averagePrice),
        priceVolatility: Math.round(priceVolatility),
        supplyDemandRatio: Math.round(supplyDemandRatio * 100) / 100,
        competitionLevel: Math.round(competitionLevel),
        marketSize: auctions.length,
        growthRate: Math.round(growthRate)
      };

    } catch (error) {
      console.error('Error getting market trend:', error);
      return {
        averagePrice: 0,
        priceVolatility: 0,
        supplyDemandRatio: 1,
        competitionLevel: 50,
        marketSize: 0,
        growthRate: 0
      };
    }
  }

  // Detect potential fraud
  async detectFraud(userId, auctionId, bidAmount) {
    try {
      const riskFactors = [];
      let totalRiskScore = 0;

      // Check user history
      const user = await User.findById(userId);
      if (!user) {
        riskFactors.push({
          factor: 'New user account',
          score: 20,
          description: 'User account is very new'
        });
        totalRiskScore += 20;
      }

      // Check bid pattern
      const userBids = await Bid.find({ bidder: userId });
      if (userBids.length === 0) {
        riskFactors.push({
          factor: 'First-time bidder',
          score: 15,
          description: 'User has no previous bidding history'
        });
        totalRiskScore += 15;
      }

      // Check for bid manipulation
      const auction = await Auction.findById(auctionId);
      if (auction) {
        const currentBids = await Bid.find({ auction: auctionId });
        
        // Check if user is bidding multiple times
        const userBidCount = currentBids.filter(bid => bid.bidder.toString() === userId).length;
        if (userBidCount > 3) {
          riskFactors.push({
            factor: 'Multiple bids from same user',
            score: 25,
            description: `User has placed ${userBidCount} bids on this auction`
          });
          totalRiskScore += 25;
        }

        // Check for suspicious bid amounts
        if (bidAmount < auction.budget * 0.1) {
          riskFactors.push({
            factor: 'Unusually low bid',
            score: 30,
            description: 'Bid amount is significantly below budget'
          });
          totalRiskScore += 30;
        }

        if (bidAmount > auction.budget * 1.5) {
          riskFactors.push({
            factor: 'Unusually high bid',
            score: 20,
            description: 'Bid amount exceeds budget significantly'
          });
          totalRiskScore += 20;
        }
      }

      // Check for rapid bidding
      const recentBids = await Bid.find({
        bidder: userId,
        createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
      });

      if (recentBids.length > 5) {
        riskFactors.push({
          factor: 'Rapid bidding behavior',
          score: 35,
          description: 'User is bidding very frequently'
        });
        totalRiskScore += 35;
      }

      // Determine alert type
      let alertType = 'behavioral';
      if (totalRiskScore > 50) {
        alertType = 'bid_manipulation';
      } else if (totalRiskScore > 30) {
        alertType = 'fake_supplier';
      }

      // Determine status
      let status = 'pending';
      if (totalRiskScore > 70) {
        status = 'investigating';
      }

      return {
        riskScore: Math.min(100, totalRiskScore),
        riskFactors,
        alertType,
        status
      };

    } catch (error) {
      console.error('Error detecting fraud:', error);
      return {
        riskScore: 0,
        riskFactors: [],
        alertType: 'behavioral',
        status: 'pending'
      };
    }
  }

  // Predict win probability for a supplier
  async predictWinProbability(auctionId, supplierId, bidAmount) {
    try {
      const auction = await Auction.findById(auctionId)
        .populate('category')
        .populate('bids');

      if (!auction) throw new Error('Auction not found');

      // Get current lowest bid
      const currentLowestBid = auction.lowestBidAmount || auction.budget;
      
      // Get supplier's historical performance
      const supplierBids = await Bid.find({ bidder: supplierId });
      const supplierWins = supplierBids.filter(bid => {
        return bid.auction && bid.auction.winner && bid.auction.winner.toString() === bid._id.toString();
      }).length;
      
      const supplierWinRate = supplierBids.length > 0 ? (supplierWins / supplierBids.length) * 100 : 0;

      // Calculate price advantage
      const priceAdvantage = currentLowestBid > 0 ? 
        ((currentLowestBid - bidAmount) / currentLowestBid) * 100 : 0;

      // Calculate competition factor
      const competitionFactor = Math.min(100, auction.bids.length * 10);

      // Calculate base probability
      let probability = 50; // Base 50%

      // Adjust for price advantage
      probability += priceAdvantage * 2;

      // Adjust for supplier performance
      probability += supplierWinRate * 0.3;

      // Adjust for competition
      probability -= competitionFactor * 0.2;

      // Adjust for bid timing (earlier bids have slight advantage)
      const timeRemaining = auction.endTime - new Date();
      const timeAdvantage = Math.max(0, (timeRemaining / (24 * 60 * 60 * 1000)) * 5); // Max 5% advantage
      probability += timeAdvantage;

      // Ensure probability is within bounds
      probability = Math.max(0, Math.min(100, probability));

      const factors = [
        { factor: 'Price advantage', impact: priceAdvantage, description: `Bid is ${Math.abs(priceAdvantage).toFixed(1)}% ${priceAdvantage > 0 ? 'lower' : 'higher'} than current lowest` },
        { factor: 'Supplier win rate', impact: supplierWinRate * 0.3, description: `Historical win rate: ${supplierWinRate.toFixed(1)}%` },
        { factor: 'Competition level', impact: -competitionFactor * 0.2, description: `${auction.bids.length} competing bids` },
        { factor: 'Time advantage', impact: timeAdvantage, description: `${Math.round(timeRemaining / (60 * 60 * 1000))} hours remaining` }
      ];

      // Calculate recommended bid
      const recommendedBid = currentLowestBid * 0.95; // 5% below current lowest

      return {
        winProbability: Math.round(probability),
        factors,
        recommendedBid: Math.round(recommendedBid),
        confidence: Math.min(95, 50 + supplierBids.length * 2)
      };

    } catch (error) {
      console.error('Error predicting win probability:', error);
      return {
        winProbability: 0,
        factors: [],
        recommendedBid: 0,
        confidence: 0
      };
    }
  }

  // Save prediction data
  async savePrediction(predictionType, data) {
    try {
      let aiPrediction = await AIPrediction.findOne();
      
      if (!aiPrediction) {
        aiPrediction = new AIPrediction({
          pricePredictions: [],
          demandForecasts: [],
          marketTrends: [],
          fraudAlerts: [],
          winProbabilities: [],
          supplierRankings: [],
          modelPerformance: []
        });
      }

      switch (predictionType) {
        case 'price_prediction':
          aiPrediction.pricePredictions.push(data);
          break;
        case 'demand_forecast':
          aiPrediction.demandForecasts.push(data);
          break;
        case 'market_trend':
          aiPrediction.marketTrends.push(data);
          break;
        case 'fraud_alert':
          aiPrediction.fraudAlerts.push(data);
          break;
        case 'win_probability':
          aiPrediction.winProbabilities.push(data);
          break;
      }

      await aiPrediction.save();
      return aiPrediction;

    } catch (error) {
      console.error('Error saving prediction:', error);
      throw error;
    }
  }
}

export default new AIPredictionService(); 