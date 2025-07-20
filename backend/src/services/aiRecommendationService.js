import AIRecommendation from "../models/aiRecommendation.model.js";
import AIPrediction from "../models/aiPrediction.model.js";
import Auction from "../models/auction.model.js";
import Bid from "../models/bid.model.js";
import User from "../models/user.model.js";
import ProductCategory from "../models/productCategory.model.js";

class AIRecommendationService {
  // Calculate supplier expertise score based on historical performance
  async calculateSupplierExpertise(supplierId, categoryId) {
    try {
      const bids = await Bid.find({ 
        bidder: supplierId,
        auction: { $exists: true }
      }).populate({
        path: 'auction',
        match: { category: categoryId }
      });

      const categoryBids = bids.filter(bid => bid.auction);
      
      if (categoryBids.length === 0) return 0;

      const totalBids = categoryBids.length;
      const wonBids = categoryBids.filter(bid => 
        bid.auction.winner && bid.auction.winner.toString() === bid._id.toString()
      ).length;
      
      const winRate = (wonBids / totalBids) * 100;
      const averageBidAmount = categoryBids.reduce((sum, bid) => sum + bid.bidAmount, 0) / totalBids;
      
      // Calculate expertise score (0-100)
      const expertiseScore = Math.min(100, 
        (winRate * 0.4) + 
        (Math.min(totalBids * 2, 40)) + // Bonus for experience
        (Math.min(averageBidAmount / 1000, 20)) // Bonus for competitive pricing
      );

      return {
        expertiseScore: Math.round(expertiseScore),
        totalBids,
        winRate: Math.round(winRate),
        averageBidAmount: Math.round(averageBidAmount)
      };
    } catch (error) {
      console.error('Error calculating supplier expertise:', error);
      return { expertiseScore: 0, totalBids: 0, winRate: 0, averageBidAmount: 0 };
    }
  }

  // Get AI-powered supplier recommendations for an auction
  async getSupplierRecommendations(auctionId, limit = 10) {
    try {
      const auction = await Auction.findById(auctionId)
        .populate('category')
        .populate('location');

      if (!auction) throw new Error('Auction not found');

      // Get all suppliers who have bid on similar auctions
      const similarAuctions = await Auction.find({
        category: auction.category._id,
        status: 'over'
      }).select('_id');

      const supplierBids = await Bid.find({
        auction: { $in: similarAuctions.map(a => a._id) }
      }).populate('bidder');

      // Group by supplier and calculate scores
      const supplierScores = {};
      
      for (const bid of supplierBids) {
        const supplierId = bid.bidder._id.toString();
        
        if (!supplierScores[supplierId]) {
          supplierScores[supplierId] = {
            supplier: bid.bidder,
            totalBids: 0,
            wonBids: 0,
            totalAmount: 0,
            averageBidAmount: 0,
            winRate: 0,
            reliabilityScore: 0,
            locationScore: 0,
            priceScore: 0,
            overallScore: 0
          };
        }

        supplierScores[supplierId].totalBids++;
        supplierScores[supplierId].totalAmount += bid.bidAmount;

        // Check if this bid won
        const auction = await Auction.findById(bid.auction);
        if (auction.winner && auction.winner.toString() === bid._id.toString()) {
          supplierScores[supplierId].wonBids++;
        }
      }

      // Calculate final scores
      const recommendations = [];
      for (const [supplierId, data] of Object.entries(supplierScores)) {
        data.averageBidAmount = data.totalAmount / data.totalBids;
        data.winRate = (data.wonBids / data.totalBids) * 100;
        
        // Get supplier metrics
        const supplier = await User.findById(supplierId);
        if (supplier && supplier.supplierMetrics) {
          data.reliabilityScore = supplier.supplierMetrics.reliabilityScore;
        }

        // Location score (prefer nearby suppliers)
        if (auction.location && supplier.city) {
          // Simple location scoring - can be enhanced with actual distance calculation
          data.locationScore = auction.location.toString() === supplier.city ? 100 : 50;
        }

        // Price score (prefer competitive pricing)
        const budgetRatio = auction.budget / data.averageBidAmount;
        data.priceScore = Math.min(100, budgetRatio * 100);

        // Overall score calculation
        data.overallScore = Math.round(
          (data.winRate * 0.3) +
          (data.reliabilityScore * 0.3) +
          (data.locationScore * 0.2) +
          (data.priceScore * 0.2)
        );

        recommendations.push({
          supplier: data.supplier,
          score: data.overallScore,
          factors: {
            winRate: data.winRate,
            reliabilityScore: data.reliabilityScore,
            locationScore: data.locationScore,
            priceScore: data.priceScore
          },
          stats: {
            totalBids: data.totalBids,
            wonBids: data.wonBids,
            averageBidAmount: data.averageBidAmount
          }
        });
      }

      // Sort by overall score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting supplier recommendations:', error);
      return [];
    }
  }

  // Get AI bid suggestions for suppliers
  async getBidSuggestions(auctionId, supplierId) {
    try {
      const auction = await Auction.findById(auctionId)
        .populate('category')
        .populate('bids');

      if (!auction) throw new Error('Auction not found');

      // Get current lowest bid
      const currentLowestBid = auction.lowestBidAmount || auction.budget;
      
      // Get supplier's historical performance
      const supplierExpertise = await this.calculateSupplierExpertise(supplierId, auction.category._id);
      
      // Get market data for this category
      const marketData = await this.getMarketData(auction.category._id);
      
      // Calculate suggested bid amount
      const suggestedBid = this.calculateOptimalBid(
        currentLowestBid,
        auction.budget,
        supplierExpertise,
        marketData
      );

      // Calculate win probability
      const winProbability = this.calculateWinProbability(
        suggestedBid,
        currentLowestBid,
        supplierExpertise,
        auction.bids.length
      );

      return {
        suggestedBid: Math.round(suggestedBid),
        winProbability: Math.round(winProbability),
        confidence: Math.round(this.calculateConfidence(supplierExpertise, marketData)),
        factors: {
          currentLowestBid,
          supplierExpertise: supplierExpertise.expertiseScore,
          marketCompetition: marketData.competitionLevel,
          budgetRatio: suggestedBid / auction.budget
        },
        recommendations: this.getBidRecommendations(suggestedBid, winProbability)
      };

    } catch (error) {
      console.error('Error getting bid suggestions:', error);
      return null;
    }
  }

  // Calculate optimal bid amount
  calculateOptimalBid(currentLowest, budget, expertise, marketData) {
    const baseBid = currentLowest * 0.95; // Start 5% below current lowest
    
    // Adjust based on expertise
    const expertiseAdjustment = (100 - expertise.expertiseScore) / 100 * 0.1; // Less expert = higher bid
    
    // Adjust based on market competition
    const competitionAdjustment = marketData.competitionLevel / 100 * 0.05;
    
    // Adjust based on budget
    const budgetAdjustment = Math.min(baseBid / budget, 1) * 0.1;
    
    const finalBid = baseBid * (1 + expertiseAdjustment + competitionAdjustment + budgetAdjustment);
    
    return Math.min(finalBid, budget * 0.9); // Don't exceed 90% of budget
  }

  // Calculate win probability
  calculateWinProbability(suggestedBid, currentLowest, expertise, competitionLevel) {
    const priceAdvantage = (currentLowest - suggestedBid) / currentLowest * 100;
    const expertiseBonus = expertise.expertiseScore * 0.5;
    const competitionPenalty = competitionLevel * 0.3;
    
    let probability = 50 + priceAdvantage + expertiseBonus - competitionPenalty;
    
    return Math.max(0, Math.min(100, probability));
  }

  // Calculate confidence level
  calculateConfidence(expertise, marketData) {
    const expertiseConfidence = expertise.totalBids * 2; // More bids = higher confidence
    const marketConfidence = marketData.dataPoints * 0.5;
    
    return Math.min(100, expertiseConfidence + marketConfidence);
  }

  // Get market data for a category
  async getMarketData(categoryId) {
    try {
      const auctions = await Auction.find({
        category: categoryId,
        status: 'over'
      }).populate('bids');

      const totalAuctions = auctions.length;
      const totalBids = auctions.reduce((sum, auction) => sum + auction.bids.length, 0);
      const averageBidsPerAuction = totalAuctions > 0 ? totalBids / totalAuctions : 0;

      return {
        competitionLevel: Math.min(100, averageBidsPerAuction * 10),
        dataPoints: totalAuctions,
        averageBidsPerAuction
      };
    } catch (error) {
      console.error('Error getting market data:', error);
      return { competitionLevel: 50, dataPoints: 0, averageBidsPerAuction: 0 };
    }
  }

  // Get bid recommendations
  getBidRecommendations(suggestedBid, winProbability) {
    const recommendations = [];
    
    if (winProbability < 30) {
      recommendations.push("Consider lowering your bid to increase win probability");
    } else if (winProbability > 80) {
      recommendations.push("Your bid is very competitive - consider if you can maintain quality at this price");
    }
    
    if (suggestedBid < 100) {
      recommendations.push("Very low bid - ensure you can deliver quality at this price point");
    }
    
    return recommendations;
  }

  // Update user preferences based on behavior
  async updateUserPreferences(userId, userType, action, data) {
    try {
      let aiRecommendation = await AIRecommendation.findOne({ userId, userType });
      
      if (!aiRecommendation) {
        aiRecommendation = new AIRecommendation({
          userId,
          userType,
          preferredCategories: [],
          categoryExpertise: [],
          preferredLocations: [],
          searchHistory: [],
          bidHistory: []
        });
      }

      // Update based on action type
      switch (action) {
        case 'search':
          aiRecommendation.searchHistory.push({
            query: data.query,
            timestamp: new Date(),
            clickedResults: data.clickedResults || []
          });
          break;

        case 'bid':
          aiRecommendation.bidHistory.push({
            auctionId: data.auctionId,
            bidAmount: data.bidAmount,
            timestamp: new Date(),
            won: data.won || false
          });
          break;

        case 'category_preference':
          if (!aiRecommendation.preferredCategories.includes(data.categoryId)) {
            aiRecommendation.preferredCategories.push(data.categoryId);
          }
          break;

        case 'location_preference':
          if (!aiRecommendation.preferredLocations.includes(data.locationId)) {
            aiRecommendation.preferredLocations.push(data.locationId);
          }
          break;
      }

      // Update AI scores
      await this.updateAIScores(aiRecommendation);
      
      await aiRecommendation.save();
      return aiRecommendation;

    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Update AI scores for a user
  async updateAIScores(aiRecommendation) {
    try {
      const user = await User.findById(aiRecommendation.userId);
      
      if (user && user.supplierMetrics) {
        aiRecommendation.aiScores.reliabilityScore = user.supplierMetrics.reliabilityScore;
        aiRecommendation.aiScores.deliveryScore = user.supplierMetrics.onTimeDeliveryRate;
        
        // Calculate quality score based on reviews and ratings
        aiRecommendation.aiScores.qualityScore = user.supplierMetrics.rating || 0;
        
        // Calculate overall score
        aiRecommendation.aiScores.overallScore = Math.round(
          (aiRecommendation.aiScores.reliabilityScore * 0.4) +
          (aiRecommendation.aiScores.deliveryScore * 0.3) +
          (aiRecommendation.aiScores.qualityScore * 0.3)
        );
      }

      // Update category expertise
      for (const categoryId of aiRecommendation.preferredCategories) {
        const expertise = await this.calculateSupplierExpertise(aiRecommendation.userId, categoryId);
        
        const existingExpertise = aiRecommendation.categoryExpertise.find(
          exp => exp.category.toString() === categoryId.toString()
        );
        
        if (existingExpertise) {
          existingExpertise.expertiseScore = expertise.expertiseScore;
          existingExpertise.totalBids = expertise.totalBids;
          existingExpertise.winRate = expertise.winRate;
          existingExpertise.averageBidAmount = expertise.averageBidAmount;
        } else {
          aiRecommendation.categoryExpertise.push({
            category: categoryId,
            ...expertise
          });
        }
      }

    } catch (error) {
      console.error('Error updating AI scores:', error);
    }
  }
}

export default new AIRecommendationService(); 