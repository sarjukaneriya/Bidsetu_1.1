import { Router } from "express";
import { 
        createAuction,
        getAllAuctions, 
        getSingleAuctionById,
        updateAuctionStatus,
        getBidsAuctionsByUser,
        getAuctionsByUser,
        deleteSingleAuctionById,
        updateSingleAuactionById,
        getAuctionWinner,
        getLiveAuctions,
        getUpcomingAuctions,
        updatePaymentStatus,
        finalizeAuctionWinner,
        updateDeliveryStatus,
        setExpectedDeliveryDate,
        getSupplierMetrics
    } from "../controllers/auction.controller.js";
import { verifyAdmin, verifyUser, verifySeller, verifyBuyer } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";




const router = Router();

// Specific routes (must come before parameterized routes)
router.route("/upcoming-auctions").get(getUpcomingAuctions);
router.route("/live-auctions").get(getLiveAuctions);
router.route("/user-bids").get(verifyUser, getBidsAuctionsByUser);
router.route("/user-auctions").get(verifyUser, getAuctionsByUser);
router.route("/supplier-metrics/:supplierId").get(getSupplierMetrics);
router.route("/search").post(getAllAuctions); // Specific search endpoint

// General routes
router.route("/").post(getAllAuctions);
router.route("/create-auction").post(verifyUser, verifyBuyer, upload.single("image"), createAuction);

// Parameterized routes (must come after specific routes)
router.route("/finalize-winner/:id").post(verifyUser, finalizeAuctionWinner);
router.route("/:id/winner").get(getAuctionWinner);
router.route("/:id/status").post(updateAuctionStatus);
router.route("/update-payment-status/:id").put(updatePaymentStatus);
router.route("/delete/:id").delete(verifyUser, verifySeller, deleteSingleAuctionById);
router.route("/update/:id").put(verifyUser, verifySeller, upload.single("image"), updateSingleAuactionById);
router.route("/:id/delivery-status").put(verifyUser, updateDeliveryStatus);
router.route("/:id/expected-delivery").put(verifyUser, setExpectedDeliveryDate);
router.route("/admin-delete/:id").delete(verifyUser, verifyAdmin, deleteSingleAuctionById);
router.route("/:id").get(getSingleAuctionById);









export default router;
