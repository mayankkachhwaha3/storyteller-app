import { useNavigate } from "react-router-dom";

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$9.99",
    period: "per month",
    features: ["Unlimited access to all stories", "Ad-free listening", "Download for offline"]
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "$89.99",
    period: "per year",
    features: ["All Monthly benefits", "2 months free", "Cancel anytime"],
    popular: true
  }
];

export default function Subscription() {
  const navigate = useNavigate();
  
  return (
    <div className="flex-1 px-5 py-6 pb-24">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold mb-2">Go Premium</h1>
        <p className="text-zinc-400 max-w-md mx-auto">
          Unlock all stories ad-free and support our creators
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative p-6 rounded-2xl border-2 ${
              plan.popular 
                ? 'border-accent bg-zinc-800/50' 
                : 'border-zinc-700'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-white text-xs font-medium px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
              <p className="text-3xl font-bold mb-1">{plan.price}</p>
              <p className="text-zinc-400 text-sm mb-6">{plan.period}</p>
              
              <ul className="space-y-3 mb-6 text-left">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-accent mr-2">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => navigate("/payment")}
                className={`w-full py-3 rounded-lg font-medium ${
                  plan.popular 
                    ? 'bg-accent text-white hover:bg-accent/90' 
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                Get Started
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center text-sm text-zinc-400">
        <p className="mb-2">Already a subscriber? <a href="#" className="text-accent">Log in</a></p>
        <p>Cancel anytime. No commitment.</p>
      </div>
    </div>
  );
}
