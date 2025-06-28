const ProcessHome = () => {
  return (
 <div className="">
  <h2 className="text-4xl font-medium text-white mb-10 text-center">
    Post Requirements & Get <span className="text-color-primary">Lowest Offers</span>
  </h2>
  <div className="grid grid-cols-1 m-auto gap-5 w-full md:grid-cols-2 lg:grid-cols-4">
    <div className="flex flex-col text-white gap-4 justify-start p-8 rounded-2xl bg-theme-bg">
      <h2 className="text-5xl font-bold text-stroke">01</h2>
      <h3 className="text-2xl font-bold">Register as a Buyer</h3>
      <p className="text-body-text-color">
        Sign up for free and gain access to a smart procurement platform designed for cost-effective sourcing.
      </p>
    </div>
    <div className="flex flex-col text-white gap-4 justify-start p-8 rounded-2xl bg-theme-bg">
      <h2 className="text-5xl font-bold text-stroke">02</h2>
      <h3 className="text-2xl font-bold">Post Your Requirement</h3>
      <p className="text-body-text-color">
        Describe the product or service you need, set quantity, budget, and timeline preferences.
      </p>
    </div>
    <div className="flex flex-col text-white gap-4 justify-start p-8 rounded-2xl bg-theme-bg">
      <h2 className="text-5xl font-bold text-stroke">03</h2>
      <h3 className="text-2xl font-bold">Receive Competitive Bids</h3>
      <p className="text-body-text-color">
        Verified suppliers will submit their lowest bids in real-time to win your order.
      </p>
    </div>
    <div className="flex flex-col text-white gap-4 justify-start p-8 rounded-2xl bg-theme-bg">
      <h2 className="text-5xl font-bold text-stroke">04</h2>
      <h3 className="text-2xl font-bold">Select the Best Offer</h3>
      <p className="text-body-text-color">
        Review all offers, compare terms, and choose the best supplier that meets your need and budget.
      </p>
    </div>
  </div>
</div>

  );
};

export default ProcessHome;
